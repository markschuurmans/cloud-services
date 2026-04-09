# Frontend Service (Vue)

Dit is de Vue 3 frontend voor de Photo Prestiges microservices.

## Architectuur

De frontend gebruikt uniforme API-routes en laat de daadwerkelijke service-routing over aan de webserver:

- `/api/auth/*` -> `auth-service`
- `/api/register/*` -> `register-service`
- `/api/target/*` -> `target-service`
- `/api/score/*` -> `score-service`
- `/api/clock/*` -> `clock-service`
- `/api/mail/*` -> `mail-service`
- `/api/read/*` -> `read-service`
- `/media/uploads/*` -> target uploads

In development handelt Vite dit af via `server.proxy` in `vite.config.js`.
In productie handelt Nginx dit af via `nginx.conf`.

## Lokaal starten (zonder Docker)

1. Installeer dependencies:

```bash
npm install
```

2. Start Vite:

```bash
npm run dev
```

## Met Docker Compose

Vanaf de repo-root:

```bash
make dev
```

Frontend is dan beschikbaar op `http://localhost:5173`.

Voor productie-compose:

```bash
make prod
```

Frontend is dan beschikbaar op `http://localhost:8080`.

