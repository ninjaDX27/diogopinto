# Portfolio website — Diogo Pinto

This repository contains a self-contained, static professional portfolio in `index.html`.

## Live deployment using GitHub Pages

1. Open the repository **Settings**.
2. Go to **Pages** → **Build and deployment**.
3. Under **Source**, select **GitHub Actions** (the repository already has a deployment workflow).
4. Save, then open **Actions → Deploy portfolio to GitHub Pages** and choose **Run workflow** or re-run the failed run.
5. Check for a successful deployment in Actions and confirm the published website URL under Pages.

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

- The two analytics projects are now published under `projects/` and linked from the portfolio cards. Revalidate their reproducible workflows when source data or dependencies change.
- Replace the abstract case preview with a published Power BI Embed **only if** a valid, public and permissioned report exists.
- Add a verified LinkedIn URL, professional email or contact form after checking what should be public.
- Replace illustrative project results with audited and reproducible data if available.
- Add browser QA, privacy/accessibility review and SEO metadata for the final production domain.

## Run and install applications by link

[Portuguese step-by-step guide](docs/COMO_ABRIR_INSTALAR_E_PUBLICAR_APPS.md) covers Codespaces, Vercel, GitHub Apps, releases and the first-time Pages configuration. [The mortgage scenario lab](https://codespaces.new/ninjaDX27/cro-landing-pages) can be opened in GitHub Codespaces.

## Local preview

Open `index.html` directly in a modern browser. No build or dependencies are required; Google Fonts are optional and the browser can fall back to system fonts.

For a local HTTP server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Maintenance

Edit content and translations directly inside `index.html`, commit to `main`, and GitHub Pages will redeploy automatically once enabled.
