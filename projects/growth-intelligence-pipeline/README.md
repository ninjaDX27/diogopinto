# Growth Intelligence Pipeline | End-to-end synthetic case

**Problem:** Marketing reports leads, sales teams report processes, finance reports commissions — but the same customer journey is not connected to a defensible decision.

This project models **campaign → event → CRM qualification → documents → approval → contract → retained commission**. It is a stand-alone, fully synthetic training case **inspired by** the tracking and analytics conventions implemented in two earlier GitHub repositories:

- [MarTech Tracking Architecture](https://github.com/ninjaDX27/martech-tracking-architecture): consent-gated event envelopes and deduplication concepts.
- [Acquisition Analytics](https://github.com/ninjaDX27/analytics-dashboards): consistent denominators, media cost and qualified lead economics.

**Important:** This project does not fetch data, imports, events or code from those repositories. It is an *integration design simulation*, not proof of live Google Ads, GA4, Meta CAPI, BigQuery or CRM connectivity. There is no patient, credit application or customer personal data.

## Reproduce

Node.js 22+; no npm dependencies.

```bash
cd projects/growth-intelligence-pipeline
npm test
npm run build
```

Open `dist/growth/index.html` in any modern browser (works offline — the dashboard's aggregates are embedded). The site deployment workflow builds the same static dashboard into `/growth/` on GitHub Pages once Pages is enabled.

### Exported data and SQL

The build also writes the following **synthetic-only** files to `dist/growth/data/`:

- `campaign_daily.csv`: daily campaign-day media spend, impressions, clicks and leads.
- `lead_lifecycle.csv`: event IDs, campaign sources, dated CRM states, hypothetical loan and commission amounts, and consent flags (no names, emails or phone numbers).
- `campaign_cohort_metrics.csv`: mature-cohort measures by campaign.
- `monthly_cohorts.csv`: mature-cohort measures by acquisition month.

[BigQuery cohort query](sql/bigquery_cohort_kpis.sql) shows how to aggregate the two fact tables **before joining**, preventing spend duplication when a campaign-day has multiple leads. Replace the placeholder dataset name and import the CSVs to run it. This SQL was authored for BigQuery but has not been executed against a live BigQuery instance. The browser app and Node tests are the verified execution paths.

## Data design

- Fixed simulation: **1 April–30 September 2026**, reporting **as of 1 November 2026**; deterministic seed 2026.
- Event grain: one `event_id` per synthetic lead.
- CRM grain: one synthetic `lead_id`, with dated states; no customer identifiers or external API calls.
- Media grain: one campaign-day; spending is on paid media only, never a full customer acquisition cost.
- Dates: UTC day precision, with simulated transitions `received → contacted → qualified → documented → approved → signed`.
- **Outcome lag:** a mature cohort is an acquisition date at least **90 days** before the as-of date. Unmatured leads are excluded together with their campaign-day media costs in the default view.
- **Commission:** model assumption = `0.65% × hypothetical financed amount` for a signed contract; not a contracted commission or real margin. It is attributed to the acquisition cohort after the signing is observed.
- `analytics` and `ads` simulated event routes require their respective consent toggles; `crm` routing is shown independently. This is **not** a legal determination of the lawful basis for processing personal data.

## KPIs

| Name | Formula / definition |
| --- | --- |
| Leads | distinct accepted synthetic lead IDs acquired in selected cohort |
| Qualified | count with qualification reached by reporting date |
| Contracts | count with signed stage reached by reporting date |
| Qualification rate | Qualified / Leads |
| Lead-to-contract | Contracts / Leads |
| Media cost per contract | Paid spend for chosen acquisition cohort / signed contracts in that cohort |
| Commission / media spend | Recorded *hypothetical* commission from signed contracts / acquisition-cohort media spend |
| Missing attribution | Leads without campaign ID, expected zero in this synthetic simulation |

The last two ratios are **not** incremental marketing ROI, full loaded CAC, or profit. Media spend exists even on days without new leads. Organic media cost is zero; content, SEO and staff costs are excluded. A **null** cost per contract indicates insufficient denominator or missing paid media costs, not zero cost.

## Three decisions this can inform (subject to real-data validation)

1. **Are leads of sufficient quality?** Inspect qualified/lead ratios and stages per channel.
2. **Where does money disappear?** Compare media cost per signed contract *only for mature cohorts*, then audit commercial response and documentation delays.
3. **What is attributable?** Show which records have tracking consent and what proportion could be forwarded to external analytics or advertising systems under appropriately configured integrations.

The dashboard provides a **synthetic illustration**, not an instruction to change any live advertising spend or lending decision.

## Tests and guardrails

- deterministic generation and unique lead IDs
- source-day reconciliation of acquired leads
- monotonic stage progression and commission only after signing
- observation-time censoring and 90-day cohort maturity
- exact-enough monetary reconciliation
- suppression of simulated external events without consent
- no email, phone, contact names or other personally identifying details in the generated dataset

## Before real-world integration

Validate permission boundaries, consent and GDPR lawful bases with the relevant privacy/compliance function. Implement idempotent ingestion, versioned schemas, secured webhooks, auditing, access control, late-arriving outcomes, refunds/commission reversals, attribution windows, campaign-currency normalization, bank/product-level segmentation and tests on an isolated pseudonymised dataset. Never export personal financial information or credentials to a static public dashboard.
