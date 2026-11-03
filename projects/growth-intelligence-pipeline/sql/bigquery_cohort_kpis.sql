-- Growth Intelligence Pipeline · BigQuery reproducibility example.
-- Source: generated, synthetic CSV exports only. NOT a production revenue report.
-- Load campaign_daily.csv and lead_lifecycle.csv into two BigQuery tables
-- in the same dataset. Replace YOUR_PROJECT.PORTFOLIO_DEMO placeholders.
--
-- Data grain: campaign_daily has 1 campaign + day.
-- lead_lifecycle has 1 synthetic lead + original campaign + day.
-- IMPORTANT: aggregate facts separately BEFORE joining to avoid multiplying media spend.

WITH settings AS (
  SELECT DATE '2026-11-01' AS as_of, DATE_SUB(DATE '2026-11-01', INTERVAL 90 DAY) AS last_mature_acquisition
),
media_by_cohort AS (
  SELECT
    campaign_id,
    SAFE_CAST(date AS DATE) AS acquired_on,
    SUM(SAFE_CAST(media_cost AS NUMERIC)) AS paid_media_cost,
    SUM(SAFE_CAST(clicks AS INT64)) AS clicks,
    SUM(SAFE_CAST(impressions AS INT64)) AS impressions
  FROM `YOUR_PROJECT.PORTFOLIO_DEMO.campaign_daily` c
  CROSS JOIN settings s
  WHERE SAFE_CAST(c.date AS DATE) <= s.last_mature_acquisition
  GROUP BY campaign_id, acquired_on
),
crm_by_cohort AS (
  SELECT
    l.campaign_id,
    SAFE_CAST(l.received_at AS DATE) AS acquired_on,
    COUNT(DISTINCT l.lead_id) AS leads,
    COUNT(DISTINCT IF(SAFE_CAST(l.qualified_at AS DATE) <= s.as_of, l.lead_id, NULL)) AS qualified_leads,
    COUNT(DISTINCT IF(SAFE_CAST(l.signed_at AS DATE) <= s.as_of, l.lead_id, NULL)) AS signed_contracts,
    SUM(
      IF(SAFE_CAST(l.signed_at AS DATE) <= s.as_of,
        SAFE_CAST(l.commission_amount AS NUMERIC), NUMERIC '0')
    ) AS hypothetical_commission
  FROM `YOUR_PROJECT.PORTFOLIO_DEMO.lead_lifecycle` l
  CROSS JOIN settings s
  WHERE SAFE_CAST(l.received_at AS DATE) <= s.last_mature_acquisition
  GROUP BY l.campaign_id, acquired_on
),
combined AS (
  SELECT
    COALESCE(m.campaign_id, c.campaign_id) AS campaign_id,
    COALESCE(m.acquired_on, c.acquired_on) AS acquired_on,
    IFNULL(m.paid_media_cost, 0) AS paid_media_cost,
    IFNULL(c.leads, 0) AS leads,
    IFNULL(c.qualified_leads, 0) AS qualified_leads,
    IFNULL(c.signed_contracts, 0) AS signed_contracts,
    IFNULL(c.hypothetical_commission, 0) AS hypothetical_commission
  FROM media_by_cohort m
  FULL OUTER JOIN crm_by_cohort c
    ON m.campaign_id = c.campaign_id AND m.acquired_on = c.acquired_on
)
SELECT
  campaign_id,
  SUM(leads) AS leads,
  SUM(qualified_leads) AS qualified_leads,
  SUM(signed_contracts) AS signed_contracts,
  ROUND(SUM(paid_media_cost), 2) AS media_cost_eur,
  ROUND(SUM(hypothetical_commission), 2) AS hypothetical_commission_eur,
  ROUND(SAFE_DIVIDE(SUM(paid_media_cost), SUM(signed_contracts)), 2) AS media_cost_per_signed_contract,
  ROUND(SAFE_DIVIDE(SUM(hypothetical_commission), SUM(paid_media_cost)), 2) AS hypothetical_commission_to_spend
FROM combined
GROUP BY campaign_id
ORDER BY campaign_id;
