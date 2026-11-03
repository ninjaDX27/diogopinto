# MongoDB Atlas adapter · Growth Intelligence Pipeline

**Status:** Development scaffold only. No Atlas account is connected; the API has not been run against a live MongoDB cluster. Unit tests validate the input rules and stage transitions without a database. This is **not production-ready**, **not a public endpoint**, and must never be used with actual financial/customer data.

## Why MongoDB

- Event history can be kept inside a lead document.
- Campaign attribution remains a short set of identifiers, while states evolve over time.
- The application runs behind a Node API that can later add proper business authentication and controlled access.
- MongoDB alone does **not** supply Supabase Auth, hosted Edge Functions or RLS. These require separate implementation.

## First setup (Atlas Free)

1. Create a Free cluster at https://cloud.mongodb.com/ (512 MB storage including indexes, subject to Atlas limits).
2. Create a **database user** with read/write access restricted to database `growth_intelligence_dev`.
3. Add your **current IP address** to the Atlas Network Access allowlist. Never use `0.0.0.0/0` for a public deployment.
4. Choose **Connect → Drivers → Node.js** and copy the connection URI.
5. Locally copy this directory's `.env.example` to `.env`, replace connection values and generate `DEV_API_TOKEN` with:
   `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`
6. Use **Node.js 22+** and run:

```bash
cd projects/growth-intelligence-pipeline/mongodb
npm install
npm test
npm start
```

The API binds to `127.0.0.1:8787`. `/health` is public **on localhost only**. All CRUD/metrics endpoints require the development bearer token and are intentionally blocked when `NODE_ENV=production`.

## Local tests with curl

Use your actual secret only in the **local shell**, never in frontend code or screenshots.

```bash
curl http://127.0.0.1:8787/health

curl -X POST http://127.0.0.1:8787/v1/leads \
  -H "Authorization: Bearer $DEV_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId":"demo-event-0001","campaignId":"search-home","source":"website","product":"mortgage"}'

curl http://127.0.0.1:8787/v1/metrics \
  -H "Authorization: Bearer $DEV_API_TOKEN"
```

Note: `DEV_API_TOKEN` is not automatically loaded into your shell from `.env`; set it locally before using the curl examples.

## Collections and indexes

The server creates MongoDB `crm_leads` with unique compound indexes on (`tenantId`, `eventId`) and (`tenantId`, `leadId`) and an index on (`tenantId`, `createdAt`). One event ID allows an idempotent lead create; ordered status updates are appended to `history`.

A second collection `campaign_daily` and transaction-level `deals` should be introduced **after** the basic API is working. Do not mix an unfinished CRM with the existing synthetic analytics dashboard and call the combined result "live".

## Security gaps before external access

- Replace development bearer token with identity provider / OAuth / RBAC.
- Add API rate limiting, CSRF/CORS policy for authorized frontends and request validation using an audited library.
- Document GDPR lawful basis, retention, erasure and access requests; prevent storage of borrowers' financial records in this demo.
- Use encrypted secret management, network restrictions, monitoring, logs without PII and backups.
- Build integration tests against a dedicated disposable MongoDB, then staging with synthetic data.
- Build analytics materializations separately and avoid joining raw campaign spend with leads at their different grains.
- Never connect GitHub Pages frontend directly to MongoDB Atlas using a database URI.

## Caveat about old tutorials

MongoDB Atlas App Services Data API, HTTPS Endpoints and App Services Authentication have reached end of life. Prefer the supported MongoDB Node.js driver behind your own authenticated server.

Reference: https://www.mongodb.com/docs/data-api-deprecation/
