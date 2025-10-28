# Invoice API

This is the backend service for the Invoice Management system. It uses Express + TypeScript + TypeORM.

Local run
1. Ensure DATABASE_URL in .env points to a reachable Postgres instance.
2. npm install
3. npm run typeorm:run
4. npm run dev

API
- GET /health
- GET /invoices
- POST /invoices
- GET /invoices/:id