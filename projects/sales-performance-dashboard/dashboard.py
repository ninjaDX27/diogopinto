"""Build a self-contained, offline Plotly HTML sales dashboard from FactOrders."""
import argparse
from pathlib import Path
import pandas as pd
import plotly.graph_objects as go
import plotly.io as pio

def build(input_path: str, output_path: str) -> None:
    orders = pd.read_csv(input_path, parse_dates=["OrderDate"], dtype={"OrderKey": "string", "CustomerID": "string"})
    for col in ("OrderKey", "OrderDate", "Country", "Revenue", "CustomerID"):
        if col not in orders:
            raise ValueError(f"Missing FactOrders column: {col}")
    orders["Revenue"] = pd.to_numeric(orders["Revenue"], errors="raise")
    orders = orders[orders.Revenue > 0].copy()
    orders["YearMonth"] = orders.OrderDate.dt.strftime("%Y-%m")
    rev = orders.groupby("YearMonth", as_index=False).Revenue.sum()
    freq = orders.groupby("YearMonth", as_index=False).OrderKey.nunique()
    by_country = orders.groupby("Country", as_index=False).Revenue.sum().sort_values("Revenue", ascending=False).head(15)
    total = orders.Revenue.sum()
    norders = orders.OrderKey.nunique()
    nclients = orders.CustomerID.nunique()
    aov = total / norders if norders else 0

    charts = []
    for title, x, y, kind in (
        ("Revenue trend (gross eligible)", rev.YearMonth, rev.Revenue, "line"),
        ("Orders by month", freq.YearMonth, freq.OrderKey, "bar"),
        ("Top markets by revenue", by_country.Country, by_country.Revenue, "bar")
    ):
        f = go.Figure()
        if kind == "bar":
            f.add_trace(go.Bar(x=list(x), y=list(y), marker_color="#60afe6"))
        else:
            f.add_trace(go.Scatter(x=list(x), y=list(y), mode="lines+markers", line=dict(color="#57d9bb", width=3)))
        f.update_layout(title=title, template="plotly_dark", paper_bgcolor="#0e1b2b",
                        plot_bgcolor="#0e1b2b", margin=dict(l=30,r=20,t=58,b=45),
                        height=340, font=dict(family="Arial"))
        charts.append(pio.to_html(f, full_html=False, include_plotlyjs=True if not charts else False))

    summary = f"Gross eligible revenue: {total:,.2f} GBP · Orders: {norders:,} · Customers: {nclients:,} · AOV: {aov:,.2f} GBP"
    html = """<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sales Performance Dashboard</title>
<style>body{background:#08111e;color:#e6f2fd;font-family:system-ui;margin:0;padding:30px;line-height:1.6}main{max-width:1120px;margin:auto}h1{font-size:clamp(28px,5vw,52px)}.stats,.chart{border:1px solid #2d4960;border-radius:15px;padding:18px;background:#0e1b2b;margin:14px 0}small{color:#a0bfd1}a{color:#70e8c8}</style>
<main><h1>Sales Performance Dashboard</h1><p class="stats">""" + summary + """</p><small>UCI raw currency: GBP. Gross eligible sales, not net after refunds. Unknown customer IDs and cancelled rows excluded. Charts generated from the input file; see README for caveats.</small>""" + "".join(f'<div class="chart">{c}</div>' for c in charts) + "</main></html>"
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(html, encoding="utf-8")
    print("Written:", output)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="FactOrders.csv created by etl.py")
    parser.add_argument("--out", default="dist/dashboard.html")
    a = parser.parse_args()
    build(a.input, a.out)
