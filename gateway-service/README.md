# Gateway Service

This service is the single API entrypoint for backend traffic.

## Security responsibilities

- Validates JWT access tokens.
- Forwards authenticated user context to internal services via `x-user-id`.
- Prevents direct backend exposure by keeping backend services on the Docker internal network.

## Swagger docs via gateway

- `GET /api-docs` provides one Swagger UI for all services.
- The UI loads specs from proxied endpoints:
  - `/api-docs/specs/auth`
  - `/api-docs/specs/register`
  - `/api-docs/specs/target`
  - `/api-docs/specs/score`
  - `/api-docs/specs/clock`
  - `/api-docs/specs/mail`
  - `/api-docs/specs/read`

## Environment variables

- `PORT` (default `3000`)
- `JWT_SECRET` (required)
- `AUTH_SERVICE_URL`
- `REGISTER_SERVICE_URL`
- `TARGET_SERVICE_URL`
- `SCORE_SERVICE_URL`
- `CLOCK_SERVICE_URL`
- `MAIL_SERVICE_URL`
- `READ_SERVICE_URL`

