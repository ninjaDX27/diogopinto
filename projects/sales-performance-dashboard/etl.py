"""Clean UCI Online Retail transactions and export a Power BI-ready star schema."""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import pandas as pd

REQUIRED = {"InvoiceNo", "StockCode", "Quantity", "InvoiceDate", "UnitPrice", "CustomerID", "Country"}

def process(input_path: str, output_dir: str) -> dict:
    p = Path(input_path)
    if p.suffix.lower() in {".xlsx", ".xls"}:
        xls = pd.ExcelFile(p)
        df = pd.concat([pd.read_excel(p, sheet_name=s) for s in xls.sheet_names], ignore_index=True)
    else:
        df = pd.read_csv(p, low_memory=False)

    df.columns = [str(c).strip() for c in df.columns]
    df.rename(columns={"Invoice": "InvoiceNo", "Price": "UnitPrice", "Customer ID": "CustomerID"}, inplace=True)
    missing = REQUIRED - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {sorted(missing)}")

    checks = {"source_rows": len(df), "duplicate_lines_not_dropped": int(df.duplicated().sum())}
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"], errors="coerce")
    for col in ("Quantity", "UnitPrice"):
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df["InvoiceNo"] = df["InvoiceNo"].astype("string").str.strip()
    df["CustomerID"] = df["CustomerID"].astype("string").str.replace(r"\.0$", "", regex=True).str.strip()
    df["StockCode"] = df["StockCode"].astype("string").str.strip()
    df["Country"] = df["Country"].astype("string").fillna("Unknown")

    is_cancellation = df["InvoiceNo"].str.upper().str.startswith("C").fillna(False)
    valid = (
        df["InvoiceDate"].notna() & df["InvoiceNo"].notna() &
        df["CustomerID"].notna() & (df["CustomerID"] != "") &
        (df["Quantity"] > 0) & (df["UnitPrice"] > 0) & ~is_cancellation
    )
    x = df.loc[valid, sorted(REQUIRED)].copy()
    if x.empty:
        raise ValueError("No eligible transactions after cleaning.")
    x["Revenue"] = x["Quantity"] * x["UnitPrice"]
    x["InvoiceYear"] = x["InvoiceDate"].dt.year
    group = ["InvoiceNo", "CustomerID", "InvoiceYear"]
    invoices = x.groupby(group, as_index=False).agg(
        InvoiceDate=("InvoiceDate", "min"), Country=("Country", "first"),
        Revenue=("Revenue", "sum"), LineItems=("StockCode", "size"),
        DistinctProducts=("StockCode", "nunique")
    )
    dominant = (x.sort_values("Revenue", ascending=False)
                .drop_duplicates(group)[group + ["StockCode"]]
                .rename(columns={"StockCode": "DominantSKU"}))
    invoices = invoices.merge(dominant, on=group, how="left")
    invoices["OrderKey"] = (invoices["InvoiceNo"] + "|" + invoices["CustomerID"] +
                            "|" + invoices["InvoiceYear"].astype("string"))
    invoices["OrderDate"] = invoices["InvoiceDate"].dt.strftime("%Y-%m-%d")
    invoices = invoices.sort_values("InvoiceDate").reset_index(drop=True)
    assert invoices["OrderKey"].is_unique
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    invoices.to_csv(out / "invoices.csv", index=False)
    invoices[["OrderKey", "OrderDate", "CustomerID", "Country", "DominantSKU",
              "Revenue", "LineItems", "DistinctProducts"]].to_csv(out / "FactOrders.csv", index=False)

    days = pd.date_range(invoices.InvoiceDate.min().normalize(), invoices.InvoiceDate.max().normalize(), freq="D")
    pd.DataFrame({
        "Date": days.strftime("%Y-%m-%d"), "Year": days.year, "MonthNumber": days.month,
        "YearMonth": days.strftime("%Y-%m"), "Quarter": ["Q" + str(i) for i in days.quarter]
    }).to_csv(out / "DimDate.csv", index=False)
    pd.DataFrame({"Country": sorted(invoices["Country"].dropna().unique())}).to_csv(out / "DimCountry.csv", index=False)
    pd.DataFrame({"DominantSKU": sorted(invoices["DominantSKU"].dropna().unique())}).to_csv(out / "DimProduct.csv", index=False)

    checks.update({"eligible_line_items": len(x), "invoices": len(invoices),
                   "distinct_customers": int(invoices.CustomerID.nunique()),
                   "gross_eligible_sales": round(float(invoices.Revenue.sum()), 2),
                   "start": str(invoices.InvoiceDate.min()), "end": str(invoices.InvoiceDate.max())})
    print(json.dumps(checks, indent=2, ensure_ascii=False))
    return checks

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Original UCI XLSX/CSV")
    parser.add_argument("--out", default="data/processed")
    args = parser.parse_args()
    process(args.input, args.out)
