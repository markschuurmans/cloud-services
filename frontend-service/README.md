# Frontend Service (Vue + shadcn)

Deze frontend draait op Vue 3 (TypeScript) met de `vue-shadcn` scaffold en is gekoppeld aan de bestaande microservices-architectuur.

## Wat is aangesloten

- Login flow via `auth-service` (`/api/auth/login`)
- Beschermde route voor targets (`/targets`)
- Overzicht van alle targets via `target-service` (`/api/target/targets`)
- Uniforme frontend API-prefixes voor alle services

## Routing en auth

- `src/router/index.ts` bevat route guards (`requiresAuth`, `guestOnly`)
- JWT token wordt opgeslagen in `localStorage` via `src/services/auth.ts`
- API calls lopen via `src/services/api.ts` met automatische `Authorization` header

## Proxy setup

Development (Vite): `vite.config.ts`

Production (Nginx): `nginx.conf`

Gekoppelde prefixes:

- `/api/auth/*`
- `/api/register/*`
- `/api/target/*`
- `/api/score/*`
- `/api/clock/*`
- `/api/mail/*`
- `/api/read/*`
- `/media/uploads/*`

## Lokaal frontend-only draaien

```bash
cd /Users/mark/Projects/cloud-services/frontend-service
npm install
npm run dev
```

## Met compose stack

```bash
cd /Users/mark/Projects/cloud-services
make dev
```

```bash
cd /Users/mark/Projects/cloud-services
make prod
```
