# PharmaLink Pro

Pharmacy Wholesale & Importer Website with RFQ Generator.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS (Clinical Precision design system)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL 15

## Quick Start

### 1. Install dependencies
```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your DB and SMTP settings
```

### 3. Set up the database
```bash
# Start PostgreSQL (or use Docker)
docker-compose up postgres -d

# Run schema then seed data
psql $DATABASE_URL -f backend/src/db/schema.sql
psql $DATABASE_URL -f backend/src/db/seed.sql
```

### 4. Run development servers
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:3000  
API: http://localhost:5000

## Project Structure
```
frontend/src/
├── pages/          # Route-level page components
├── components/     # Shared UI components
├── store/          # Zustand state (rfqStore, authStore)
├── lib/            # Axios API client
└── styles/         # Global CSS + Tailwind config

backend/src/
├── routes/         # Express route handlers
├── services/       # rfqNumber, email, pdf
├── middleware/     # JWT auth
└── db/             # Pool + schema.sql
```
