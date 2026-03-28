# NRL Shield

NRL Shield is an AI governance platform implementing Need-to-Know + Role + Level controls, prompt safety, risk scoring, auditability, and admin oversight for enterprise AI interactions.

## Stack

- React + TypeScript + Vite
- Supabase (Auth, Postgres, Edge Functions)
- TailwindCSS + Framer Motion
- Recharts for risk/operations visualizations
- PDF and OCR processing via `pdfjs-dist` and `tesseract.js`
- jsPDF + jspdf-autotable for compliance PDF export

## Highlights

- NRL-aware AI assistant with prompt guard, risk scoring, and response filtering
- Realtime query stream panel (Supabase Realtime-backed)
- Admin data connectors page for cloud source onboarding and document uploads
- Document ingestion security analysis (PDF, image, text) with sensitive-content findings
- Audit/event tracking and explainability receipt support hooks

## Run Locally

```bash
npm install
npm run dev
```

Production build check:

```bash
npm run build
```

Lint check:

```bash
npm run lint
```

Mongo bootstrap and smoke check:

```bash
# set env first (PowerShell example)
$env:MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/"
$env:MONGODB_DB="nrl_shield"

npm run mongo:bootstrap
npm run mongo:smoke
```

## Environment

Copy .env.example and provide values:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (optional alternative to anon key)
- VITE_SESSION_TIMEOUT_MINUTES
- VITE_MAX_QUERIES_PER_HOUR
- VITE_GOOGLE_DRIVE_OAUTH_URL (optional)

Edge-only variables are documented in docs/DEPLOYMENT.md.

## Implemented Phases

- Phase 1: Foundation and backend schema/functions
- Phase 2: Auth + security components
- Phase 3: NRL + RBAC
- Phase 4: Frontend AI pipeline services/hooks
- Phase 5: User interface pages/layout
- Phase 6: Admin panel sections and routing
- Phase 8: CSV/PDF reporting + scheduled report edge function
- Phase 9: Security hardening (headers, CORS tightening, key-rotation flow)
- Phase 10: UI polish, responsive enhancements, deployment docs, NRL smoke checklist

## Key Docs

- docs/ARCHITECTURE.md
- docs/SECURITY.md
- docs/DEPLOYMENT.md
- docs/NRL_MATRIX.md
- docs/API_REFERENCE.md
