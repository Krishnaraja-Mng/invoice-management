```markdown
# Invoice Management

Stack
- Backend: Node.js + TypeScript + Express
- ORM: TypeORM
- Database: PostgreSQL
- Mobile client: React Native + TypeScript (Expo)
- Auth: JWT (email/password)
- Containerization: Docker & docker-compose
- License: MIT

Quickstart (local)
1. Copy .env.example -> .env and fill values.
2. Build & start with Docker Compose:
   docker-compose up --build
3. From /api:
   npm install
   npm run typeorm:run
   npm run dev

Project layout
- README.md
- LICENSE
- .gitignore
- .env.example
- docker-compose.yml
- /api (backend)
- /mobile (React Native Expo app)
- /docs
- /scripts
- /tests

Planned initial features
- Invoice CRUD (line items, subtotal, tax, total)
- Customer management (basic)
- JWT auth scaffolding (register/login)
- Docker + docker-compose for local dev
- TypeORM entities and migration hooks
- Basic React Native client to list invoices

Next
- Create the GitHub repo (instructions below) and push this scaffold.
- I can then add: CI workflow, migrations, seed scripts, PDF/email sample code, and Stripe integration on request.
```