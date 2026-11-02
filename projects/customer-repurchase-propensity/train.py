"""90-day repurchase classifier with chronology-aware holdout evaluation."""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import average_precision_score, roc_auc_score, brier_score_loss, f1_score

FEATURES = ["recency_days", "orders_90d", "revenue_90d", "aov_90d", "sku_variety_90d",
            "lifetime_orders", "lifetime_spend", "tenure_days"]

def at_cutoff(df: pd.DataFrame, cutoff: pd.Timestamp) -> pd.DataFrame:
    history = df[df.InvoiceDate < cutoff]
    future = df[(df.InvoiceDate >= cutoff) & (df.InvoiceDate < cutoff + pd.Timedelta(days=90))]
    if history.empty:
        raise ValueError("No purchases before cutoff.")
    h = history.groupby("CustomerID").agg(
        last=("InvoiceDate", "max"), first=("InvoiceDate", "min"),
        lifetime_orders=("OrderKey", "nunique"), lifetime_spend=("Revenue", "sum")
    )
    h["recency_days"] = (cutoff - h["last"]).dt.total_seconds() / 86400
    h["tenure_days"] = (cutoff - h["first"]).dt.total_seconds() / 86400
    h = h[h.recency_days <= 365].copy()
    recent = history[history.InvoiceDate >= cutoff - pd.Timedelta(days=90)]
    r = recent.groupby("CustomerID").agg(
        orders_90d=("OrderKey", "nunique"),
        revenue_90d=("Revenue", "sum"),
        sku_variety_90d=("DominantSKU", "nunique")
    )
    h = h.join(r)
    for field in ("orders_90d", "revenue_90d", "sku_variety_90d"):
        h[field] = h[field].fillna(0)
    h["aov_90d"] = np.where(h.orders_90d > 0, h.revenue_90d / h.orders_90d, 0)
    h["repurchase_90d"] = h.index.isin(set(future.CustomerID)).astype(int)
    h["cutoff"] = str(cutoff.date())
    return h.reset_index()[["CustomerID", "cutoff"] + FEATURES + ["repurchase_90d"]]

def get_cutoffs(df: pd.DataFrame):
    start, end = df.InvoiceDate.min().normalize(), df.InvoiceDate.max().normalize()
    days = (end - start).days
    if days < 370:
        raise ValueError("At least 370 days of observed data required for meaningful 90-day out-of-time validation.")
    if days < 550:
        train = [start + pd.Timedelta(days=90)]
        val = start + pd.Timedelta(days=181)
        test = start + pd.Timedelta(days=273)
    else:
        val, test = end - pd.Timedelta(days=210), end - pd.Timedelta(days=100)
        last_train = end - pd.Timedelta(days=320)
        train = list(pd.date_range(start + pd.Timedelta(days=120), last_train, freq="90D"))
    if not train or train[-1] + pd.Timedelta(days=90) > val or val + pd.Timedelta(days=90) > test or test + pd.Timedelta(days=90) > end:
        raise ValueError("Insufficient time coverage for three disjoint outcome periods.")
    return train, val, test

def scores(y, p):
    y = np.asarray(y, dtype=int)
    p = np.asarray(p, dtype=float)
    top_n = max(1, int(np.ceil(.2 * len(y))))
    baseline = float(np.mean(y))
    return {"n": int(len(y)), "positive_rate": baseline,
            "pr_auc": float(average_precision_score(y, p)),
            "roc_auc": float(roc_auc_score(y, p)) if len(set(y)) == 2 else None,
            "brier": float(brier_score_loss(y, p)),
            "top20_lift": float(np.mean(y[np.argsort(-p)[:top_n]]) / baseline) if baseline else None}

def train(input_path, out_dir):
    df = pd.read_csv(input_path, parse_dates=["InvoiceDate"], dtype={"CustomerID": "string", "OrderKey": "string", "DominantSKU": "string"})
    cols = ["CustomerID", "OrderKey", "InvoiceDate", "Revenue", "DominantSKU"]
    if any(c not in df for c in cols):
        raise ValueError(f"Missing invoice-level fields: {set(cols) - set(df)}")
    df = df.dropna(subset=["CustomerID", "OrderKey", "InvoiceDate"])
    df = df[pd.to_numeric(df.Revenue, errors="coerce") > 0].copy()
    train_dates, val_date, test_date = get_cutoffs(df)
    train_df = pd.concat([at_cutoff(df, d) for d in train_dates], ignore_index=True)
    validation = at_cutoff(df, val_date)
    test = at_cutoff(df, test_date)

    for name, frame in (("train", train_df), ("validation", validation), ("test", test)):
        if len(frame) < 40 or frame.repurchase_90d.nunique() < 2:
            raise ValueError(f"{name}: fewer than 40 customers or target has only one class")
    ytr, yv, yt = (a.repurchase_90d.to_numpy() for a in (train_df, validation, test))
    models = {
        "Baseline (recency, frequency)": (["recency_days", "orders_90d"],
            make_pipeline(SimpleImputer(strategy="median"), StandardScaler(),
                          LogisticRegression(max_iter=1500))),
        "Logistic regression (RFM+)": (FEATURES,
            make_pipeline(SimpleImputer(strategy="median"), StandardScaler(),
                          LogisticRegression(max_iter=1500))),
        "Random forest": (FEATURES, RandomForestClassifier(
            n_estimators=140, min_samples_leaf=20, max_depth=9, random_state=42, n_jobs=-1))
    }
    validated, leaderboard = {}, []
    for label, (features, model) in models.items():
        model.fit(train_df[features], ytr)
        pred_val = model.predict_proba(validation[features])[:, 1]
        result = scores(yv, pred_val)
        leaderboard.append({"model": label, "validation": result})
        validated[label] = (features, model, pred_val)
    winner = max(leaderboard, key=lambda x: x["validation"]["pr_auc"])["model"]
    feats, model, pred_val = validated[winner]
    thresholds = np.linspace(.05, .95, 91)
    threshold = float(max(thresholds, key=lambda t: f1_score(yv, pred_val >= t, zero_division=0)))

    test_results = []
    for label, (features, m, _) in validated.items():
        probability = m.predict_proba(test[features])[:, 1]
        test_results.append({"model": label, "test": scores(yt, probability)})
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    chosen_probability = model.predict_proba(test[feats])[:, 1]
    pd.DataFrame({"CustomerID": test.CustomerID, "cutoff": test.cutoff,
                  "actual_repurchase": yt, "predicted_probability": chosen_probability}).to_csv(out / "test_predictions.csv", index=False)
    results = {"source": str(input_path), "target": "eligible repurchase in next 90 days",
               "train_cutoffs": [str(d.date()) for d in train_dates],
               "validation_cutoff": str(val_date.date()), "test_cutoff": str(test_date.date()),
               "sample_sizes": {name: len(frame) for name, frame in (("train", train_df), ("validation", validation), ("test", test))},
               "validation_leaderboard": leaderboard, "winner": winner,
               "threshold_selected_on_validation": threshold, "test_comparison": test_results,
               "limitations": ["Historical prediction is not causal uplift.",
                               "Missing IDs and returns are excluded.",
                               "Short time horizon and country/product shifts can invalidate generalisation.",
                               "Consent and randomised holdout needed for an outreach decision."]}
    (out / "metrics.json").write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    print("Winner (validation):", winner)
    print("Test outcomes (once, after selection):", json.dumps(test_results, indent=2))
    return results

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="Clean invoices.csv from sales ETL")
    ap.add_argument("--out", default="dist/repurchase")
    a = ap.parse_args()
    train(a.input, a.out)
