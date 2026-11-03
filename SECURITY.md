# Security and privacy

This repository publishes educational demonstrations and synthetic examples in financial-services domains. It is **not** a production financial-services platform or an audited CRM.

## Scope

The development MongoDB adapter is restricted to localhost and is not suitable for public access without authentication redesign, authorization, rate limiting, monitoring, security testing, data-retention rules and legal review.

Do not use customer identities, credit applications, bank statements, credentials or production campaign data in public fixtures.

## Reporting a vulnerability

Please avoid submitting security exploits, API tokens, database connection strings or personal information in public issues. If GitHub private vulnerability reporting is enabled for this repository, use that channel. Otherwise contact the maintainer privately via an existing trusted route.

## Developer checklist

- Never commit `.env` values, private keys, raw CRM exports, secrets or financial documents.
- Do not expose MongoDB connection strings or service-side API tokens through GitHub Pages JavaScript.
- Use synthetic data for public examples and clearly label modeled commission assumptions.
- Review all GitHub App permissions before connecting a repository to a third-party service.
- A green CI run tests only the configured checks; it does not certify product security.
