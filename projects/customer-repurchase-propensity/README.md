# Customer Repurchase Propensity · 90 Days

**Business question:** Given historical purchases at an observation date, which existing customers are more likely to place at least one eligible new order in the next 90 days?

This is a documented **historical classification exercise**, not a causal evaluation of retention campaigns.

## Reproduce with real public data

The original [UCI Online Retail dataset](https://archive.ics.uci.edu/dataset/352/online+retail) (Daqing Chen, CC BY 4.0) must be downloaded separately. It covers Dec 2010–Dec 2011 and contains limited temporal history; results need careful interpretation.

```bash
pip install -r projects/customer-repurchase-propensity/requirements.txt
python projects/sales-performance-dashboard/etl.py --input "data/raw/Online Retail.xlsx" --out data/processed
python projects/customer-repurchase-propensity/train.py --input data/processed/invoices.csv --out dist/repurchase
```

To test the pipeline without the UCI download, generate **clearly synthetic** invoices:

```bash
python projects/customer-repurchase-propensity/generate_demo.py --out data/demo/invoices.csv
python projects/customer-repurchase-propensity/train.py --input data/demo/invoices.csv --out dist/demo
```

## Design

- **Unit of analysis:** customer at an observation date.
- **Eligibility:** at least one prior purchase and most recent purchase within 365 days.
- **Target:** at least one eligible new order in `[cutoff, cutoff + 90d)`.
- **Features as-of cutoff:** recency, 90-day frequency, 90-day monetary value, average basket, historical order count and spend, tenure, SKU variety.
- **Prevent leakage:** no future outcome in predictors; distinct train/validation/test cutoff dates have >=90d separation. Test remains untouched until selection.
- **Models:** simple recency/frequency baseline, expanded logistic regression, random forest. Choose model via validation PR-AUC, threshold via validation F1; report PR-AUC, ROC-AUC, Brier and top-quintile lift on test.
- **Missing data:** eligible purchase history only; exclusions create selection bias. Currency remains whatever the source recorded.
- **Interpretability:** linear model coefficients can be inspected, but not causal explanations.

## Business decision

Use the score only to **prioritise analysis or a consented, randomly controlled outreach experiment**. A high propensity customer may repurchase without being contacted; incremental profit cannot be inferred from prediction alone.

## Honest reporting

Results shown on the [portfolio model card](../../index.html#model) are from a **separate synthetic demonstration run** (PR-AUC baseline 0.615, logistic 0.675, random forest 0.659). They are *not* validated performance on real UCI transactions and should not be copied as results of this script unless reproduced.

## Caveats

Single historical retailer, dated patterns, short dataset, exclusions of missing customer IDs and returns, drift risk, no customer acquisition costs, margin, contact consent, calibration assessment or randomised intervention. No production or financial uplift claims.
