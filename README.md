# PayPilot App

Next.js app for PayPilot.

## Run (Modal CPU by default)

```bash
npm run dev
```

This uses the repo-level `scripts/modal-run` wrapper and streams logs to your local terminal.
When the app starts, the script prints a tunnel URL for port `3000`.

## Build / Start / Lint (Modal CPU)

```bash
npm run build
npm run start
npm run lint
```

## Local Fallback

If you need to run directly on your machine:

```bash
npm run dev:local
npm run build:local
npm run start:local
npm run lint:local
```
