# Portfolio website — Diogo Pinto

This repository contains a self-contained, static professional portfolio in `index.html`.

## Live deployment using GitHub Pages

1. Open the repository **Settings**.
2. Go to **Pages** → **Build and deployment**.
3. Select **Deploy from a branch**.
4. Choose **main** and **/(root)**, then save.
5. GitHub will show the published website URL and deployment status on the Pages screen.

Expected GitHub Pages pattern for this user repository:
`https://ninjadx27.github.io/diogopinto/`

**Important:** This expected address is not a verified deployed URL until GitHub Pages shows a successful publication.

## What is included

- Responsive, accessible single-page portfolio
- English and Portuguese language switching
- Dark and light appearance
- Two highlighted cases: Sales Performance Dashboard and Customer Repurchase Propensity
- Interactive *illustrative* commercial dashboard with synthetic data, three views and a year filter
- Model comparison based on a previous **synthetic-data** test
- Methodology, skills, professional experience and a GitHub contact link
- No analytics pixels or tracking cookies

## Evidence and limits

The dashboard embedded here contains independently constructed synthetic figures to illustrate interface interactions. It is **not** an actual Power BI report and does not display the original transaction-level demo dataset used by the preceding portfolio project.

The ML model comparison uses rounded test PR-AUC values from the separately developed synthetic dataset: baseline 0.615, logistic regression 0.675, random forest 0.659. The values are **not** evidence of business impact or model performance on real transactions.

The MaxFinance Top awareness metrics are previously reported first-party figures and have not been independently audited.

## Recommended next updates

- Upload the two complete analytics project source directories and link their public repositories in the project cards.
- Replace the abstract case preview with a published Power BI Embed **only if** a valid, public and permissioned report exists.
- Add a verified LinkedIn URL, professional email or contact form after checking what should be public.
- Replace illustrative project results with audited and reproducible data if available.
- Add browser QA, privacy/accessibility review and SEO metadata for the final production domain.

## Local preview

Open `index.html` directly in a modern browser. No build or dependencies are required; Google Fonts are optional and the browser can fall back to system fonts.

For a local HTTP server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Maintenance

Edit content and translations directly inside `index.html`, commit to `main`, and GitHub Pages will redeploy automatically once enabled.
