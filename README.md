# Diogo Pinto | Data → Decisions

Professional website covering **Growth, Marketing Analytics, Business Intelligence and Digital Transformation**.

**Site source:** [index.html](index.html) · **Deployment instructions:** [SITE_GUIDE.md](SITE_GUIDE.md)

## Projects (reproducible source)

| Project | Question | Repo files | Demo |
|---|---|---|---|
| Sales Performance Dashboard | What is happening in sales and where should management investigate? | [ETL, Plotly dashboard, Power BI DAX & documentation](projects/sales-performance-dashboard/) | [Live website section](index.html#demo) |
| Customer Repurchase Propensity | Who is likely to repurchase within 90 days? | [Model, synthetic generator & methodology](projects/customer-repurchase-propensity/) | [Model comparison](index.html#model) |

### Growth Intelligence Pipeline — new integrated case

**[Source and reproducible tests](projects/growth-intelligence-pipeline/)** · **Interactive site route:** `/growth/` after GitHub Pages is enabled.

This synthetic Node.js case joins acquisition campaign costs, a consent-aware event, CRM lead states, 90-day mature cohorts, signed contracts and hypothetical retained commissions. The dashboard supports channel and cohort filters. No API credentials, personally identifying data or live advertising integrations are used.

```bash
cd projects/growth-intelligence-pipeline
npm test
npm run build
```

Open `dist/growth/index.html` to inspect the self-contained offline dashboard.

### Engineering labs (from existing repositories)

| Project | What to inspect | Links |
|---|---|---|
| Mortgage Scenario Lab | Vue 3 comparator, mathematical validation and UI tests; all bank data fictional | [Source](https://github.com/ninjaDX27/cro-landing-pages) · [Codespaces](https://codespaces.new/ninjaDX27/cro-landing-pages) · Site path `/cro/` after deployment |
| MarTech Tracking Architecture | Consent-aware event contract, GA4 and Meta CAPI simulator | [Source and tests](https://github.com/ninjaDX27/martech-tracking-architecture) |
| Acquisition Analytics | SQL, reproducible synthetic dataset and KPI definitions | [Source and tests](https://github.com/ninjaDX27/analytics-dashboards) |
| Offer Review Automation | AI-assisted schema validation with human approval | [Source and tests](https://github.com/ninjaDX27/ai-workflow-automation) |

### Build and publish

The [GitHub Pages workflow](.github/workflows/deploy-pages.yml) also tests and builds the [Growth Intelligence Pipeline](projects/growth-intelligence-pipeline/) into `/growth/`. It now checks out the [CRO source repository](https://github.com/ninjaDX27/cro-landing-pages), runs its tests, builds its Vue app and assembles `index.html` plus `/cro/` into a single static artifact.

- **Independent preview:** Workflow's successful **build** job uploads `portfolio-browser-preview`, a downloadable zip of the site and CRO assets.
- **Public deployment:** The **deploy** job requires the owner to enable **Settings → Pages → Source → GitHub Actions**. Otherwise it fails with “Get Pages site failed”, even when the build succeeds.
- When updating CRO code, manually re-run this workflow to refresh the public demo; it does not automatically listen to pushes in the separate CRO repository.

### Scientific integrity

The website contains clearly labelled **synthetic demonstrations**, not validated real-company dashboard results. The separately published code can analyse the public UCI Online Retail dataset (download independently). ML results shown on the site refer to an earlier **synthetic-data** test; do not interpret them as predictive performance on real customers.

The website uses HTML, CSS and JavaScript with no build step. Enable **GitHub Pages** in Settings → Pages → Source → **GitHub Actions**, then run the existing deployment workflow. The attempted deployment failed because Pages is not yet enabled.

**Owner:** Diogo Pinto. [GitHub profile](https://github.com/ninjaDX27)

## Launch and installation

[How to open, install and deploy apps using GitHub links (PT)](docs/COMO_ABRIR_INSTALAR_E_PUBLICAR_APPS.md) · [CRO live development environment (Codespaces)](https://codespaces.new/ninjaDX27/cro-landing-pages) · [Deploy CRO using Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FninjaDX27%2Fcro-landing-pages)
