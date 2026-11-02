# Sales Performance Dashboard

**Business question:** Where do revenue, orders and customers concentrate, and what should commercial management investigate next?

This is a reproducible **business intelligence project**. Source code turns Online Retail line items into an order-level fact table, Power BI dimensions and an offline HTML dashboard.

## Reproduce

Python 3.10+:

```bash
pip install -r projects/sales-performance-dashboard/requirements.txt
python projects/sales-performance-dashboard/etl.py --input "data/raw/Online Retail.xlsx" --out data/processed
python projects/sales-performance-dashboard/dashboard.py --input data/processed/FactOrders.csv --out dist/dashboard.html
```

Download the original **Online Retail** .xlsx yourself from the [UCI repository](https://archive.ics.uci.edu/dataset/352/online+retail) (Daqing Chen, 2015, CC BY 4.0, DOI 10.24432/C5BW33). The raw data are not redistributed.

## Data definitions

- **Grain:** one invoice per customer per year; keep line items for gross eligible revenue and pick only dominant product for optional invoice classification.
- **Revenue:** sum of positive quantity × positive unit price, excluding invoices with an identifier starting with C; **not** net revenue or profit.
- **Orders:** unique invoice-year-customer composite key; **customers:** distinct identified customer IDs.
- **AOV:** eligible revenue / eligible invoices.
- **Time:** invoices' recorded dates. The date dimension provides complete date coverage.
- **Countries:** country recorded on each eligible invoice.

Rows without CustomerID are removed so unique customers and 90-day repurchase analyses share a consistent population. Cancellations and returns are excluded rather than reconciled, so treat any sales totals as a *gross eligible* figure.

## Three dashboard views

1. **Executive:** revenue, orders, AOV and distinct customers, trend.
2. **Commercial:** orders over time and average order value.
3. **Geography:** sales by country, concentration and relevant comparisons.

The [live site demo](../../index.html#demo) intentionally uses generated synthetic figures, not the UCI dataset. For a real-data dashboard, run the scripts above. A .pbix binary is not included: [Power BI import and measures](powerbi/README.md) enable native recreation.

## Management decisions

Investigate changes in demand, country dependence, declining AOV and commercial seasonality. Evaluate alternative explanations and baseline periods. These aggregates do not identify causal drivers of growth.

## Validation

Check the ETL reconciliation printout, compare sampled invoices against source rows and audit currency, duplicate lines, cancellation logic and missing IDs before presenting figures to management.
