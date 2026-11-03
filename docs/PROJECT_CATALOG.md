# Project catalogue — Diogo Pinto

**Growth, Analytics, MarTech and Digital Transformation** · Reviewed 3 November 2026.

This page is the canonical navigation for featured projects. These are learning labs and demonstrators; most commercial/financial data are **synthetic**, and their successful tests are not equivalent to production deployment.

| Case | Business question | Reproducible evidence | Current limitation |
|---|---|---|---|
| **[Growth Intelligence Pipeline](../projects/growth-intelligence-pipeline/)** | How do leads progress from campaign to contract? | Seeded event/CRM data, 90-day cohorts, HTML dashboard, CSV exports, tests | MongoDB adapter is local development code, **not connected** to Atlas or a live CRM |
| **[Mortgage Scenario Lab](https://github.com/ninjaDX27/cro-landing-pages)** | How can users compare mortgage scenarios clearly? | Vue calculator, accessible controls and tests | Fictitious offers and no real bank feed |
| **[MarTech Tracking](https://github.com/ninjaDX27/martech-tracking-architecture)** | How do consent and measurement events affect attribution? | Versioned events, dataLayer example, payload simulator and tests | No GA4/Meta CAPI delivery to real accounts |
| **[Acquisition Analytics](https://github.com/ninjaDX27/analytics-dashboards)** | What explains lead quality and marketing efficiency? | Seeded daily dataset, KPI dictionary, BigQuery query and checks | No live Looker Studio deployment or actual acquisition results |
| **[AI Workflow Automation](https://github.com/ninjaDX27/ai-workflow-automation)** | Where can AI support human review? | Structured extraction simulation, provenance and manual approval boundaries | Offline workflow, not operating on market offers |
| **[Sales Performance BI](../projects/sales-performance-dashboard/)** | Which sales cohorts and markets matter? | ETL, offline Plotly report generator, DAX measures | No native `.pbix` or verified revenue outcomes |
| **[Customer Repurchase Propensity](../projects/customer-repurchase-propensity/)** | Which customers may repurchase in 90 days? | Chronological train/validate/test design, models and metric report | Demonstrated scores are synthetic, not production predictions |

## How the components connect

```text
Acquisition channels → CRO landing pages
                           ↓
                   Tracking events
                           ↓
                  CRM qualification
                           ↓
                    Signed outcomes
                           ↓
                Funnel + cost + revenue
                           ↓
               Decision / A-B experiment
```

This is a conceptual architecture, **not** evidence that all referenced repositories are connected to live services.

## Explore

- [Personal profile](https://github.com/ninjaDX27)
- [Portfolio website source](../index.html) — Pages still requires initial activation.
- [Run / install projects from GitHub links](COMO_ABRIR_INSTALAR_E_PUBLICAR_APPS.md)
- [Repository organisation and hygiene](GITHUB_ORGANIZATION.md)

## Recruiter evaluation standard

A meaningful case study includes the initial problem, success metrics, source and granularity of data, implementation, tests, findings, limitations and the decision that could be improved. Metric definitions such as CAC, revenue, attributed commission and uplift must not be conflated.

For synthetic datasets, results only illustrate behaviour. For public real datasets, report the download source, cleaning decisions, temporal split and repeatable results before making empirical claims.
