# Revela AI Frontend

Production-grade Next.js 15 frontend for Revela AI.

## Commands

```bash
npm install
npm run dev
```

```bash
npm run build
npm start
```

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Set `NEXT_PUBLIC_API_BASE_URL` to the running FastAPI backend base URL. This frontend expects the backend to expose `/api/*` routes at that host.
