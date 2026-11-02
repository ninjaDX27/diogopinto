"""Make reproducible SYNTHETIC invoice-grain data. Not original UCI transactions."""
import argparse
from pathlib import Path
import numpy as np
import pandas as pd

def generate(out: str, seed: int = 2026, customers: int = 1200) -> None:
    rng = np.random.default_rng(seed)
    start = pd.Timestamp("2024-01-01")
    finish = pd.Timestamp("2026-09-30")
    records = []
    number = 100000
    for i in range(customers):
        customer = str(30000 + i)
        beginning = start + pd.Timedelta(days=int(rng.integers(0, 300)))
        tendency = float(rng.gamma(shape=1.6, scale=1.1))
        norders = max(1, int(rng.poisson(2 + 3 * tendency)))
        for offset in rng.integers(0, max(1, (finish - beginning).days), size=norders):
            number += 1
            moment = beginning + pd.Timedelta(days=int(offset))
            records.append({
                "CustomerID": customer, "OrderKey": f"SYN-{number}|{customer}",
                "InvoiceDate": moment, "Revenue": round(float(rng.uniform(15, 120)), 2),
                "DominantSKU": "SKU-" + str(int(rng.integers(1, 16))),
                "Country": rng.choice(["Portugal", "United Kingdom", "Spain", "France"])
            })
    frame = pd.DataFrame(records).sort_values("InvoiceDate")
    target = Path(out)
    target.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(target, index=False)
    print("SYNTHETIC orders:", len(frame), "customers:", customers, "file:", target)

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="data/demo/invoices.csv")
    ap.add_argument("--seed", type=int, default=2026)
    a = ap.parse_args()
    generate(a.out, seed=a.seed)
