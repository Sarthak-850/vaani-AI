<div align="center">

# ⚙️ Vaani Backend API Server
### *Scalable Clinical Engine, Real-Time WebSockets & AI Entity Extraction*

[![NodeJS](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql)](https://supabase.com/)
[![Socket.io](https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socketdotio)](https://socket.io/)
[![Render](https://img.shields.io/badge/Render-Deploys_Live-46E3B7?style=for-the-badge&logo=render)](https://vaani-backend-1.onrender.com/api/health)

[🌐 **Live Backend API Health**](https://vaani-backend-1.onrender.com/api/health) • [📁 **Frontend Client Repo**](https://github.com/som425/Vaani_frontend)

---

</div>

## 🏛️ System Features & Highlights

- 🧠 **Gemini 1.5 Flash AI Engine**: Multilingual clinical entity extraction converting spoken transcripts into structured medical JSON (vitals, symptoms, ICD codes, medications, risk levels).
- 🚨 **Real-Time WebSockets Streaming**: `Socket.IO` bi-directional event broadcasting for high-risk triage alerts and real-time field visit tracking.
- 🗄️ **Relational PostgreSQL Schema (Prisma ORM)**: Robust relational data model linking Users, Villages, Households, Patients, Visits, Health Records, Alerts, and Incentives.
- 🔐 **Stateless JWT Auth & RBAC**: Role-based access control supporting `ADMIN`, `SUPERVISOR` (DHO), and `ASHA` worker roles with bcrypt password hashing.
- 📍 **Bhopal GIS Sector Data Support**: Endpoint `/api/visits/bhopal-visits` returning geofenced latitude and longitude coordinates across Bhopal sectors (`23.2599° N, 77.4126° E`).

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | System & DB Health Status Check | Public |
| `POST` | `/api/auth/login` | ASHA Worker / Supervisor Authentication | Public |
| `POST` | `/api/auth/clerk-sync` | Clerk Auth User Synchronization | Authenticated |
| `GET` | `/api/auth/me` | Fetch Current Authenticated User | Authenticated |
| `POST` | `/api/visits` | Log Voice Visit & Trigger Triage Alert | ASHA / Admin |
| `POST` | `/api/visits/extract-preview` | Gemini AI Real-Time Clinical Extract Preview | Authenticated |
| `GET` | `/api/visits` | Fetch Filtered Visit History & GPS Records | Authenticated |
| `GET` | `/api/visits/bhopal-visits` | Fetch Bhopal GIS Coordinates & Visits | Authenticated |
| `GET` | `/api/alerts` | Fetch Triage Queue & High-Risk Alerts | Supervisor / Admin |
| `PUT` | `/api/alerts/:id/status` | Update Triage Alert Status & Doctor Notes | Supervisor / Admin |
| `GET` | `/api/households` | Fetch Village Households & Patient Directory | Authenticated |
| `GET` | `/api/incentives` | Fetch Verified ASHA Earnings & Incentive Ledger | Authenticated |
| `GET` | `/api/analytics/overview` | District Level Epidemiological Analytics | Supervisor / Admin |

---

## ⚡ Socket.IO Real-Time Events

| Event Name | Type | Payload Description |
|---|---|---|
| `visit:created` | Broadcast | Triggered when a new household visit is logged |
| `alert:created` | Broadcast | Triggered when a HIGH / CRITICAL triage case occurs |
| `notification:new` | Targeted | Pushes notification to DHO Supervisor command center |
| `visit:updated` | Broadcast | Triggered when visit verification status is modified |

---

## 🗄️ Database Relational Schema (Prisma)

```mermaid
erDiagram
    USER ||--o{ ASHA_WORKER : has
    VILLAGE ||--o{ ASHA_WORKER : assigns
    VILLAGE ||--o{ HOUSEHOLD : contains
    HOUSEHOLD ||--o{ PATIENT : includes
    HOUSEHOLD ||--o{ VISIT : records
    ASHA_WORKER ||--o{ VISIT : performs
    VISIT ||--o{ HEALTH_RECORD : generates
    VISIT ||--o{ ALERT : triggers
    VISIT ||--o{ INCENTIVE : credits
```

---

## 🛠️ Environment Variables Configuration

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.jeedoodyzroxqvwkjcax.supabase.co:5432/postgres
JWT_SECRET=super_secret_jwt_key_intelliashe_production_2026_secure
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=https://vaani-frontend.vercel.app
```

---

## 🛠️ Local Development & Seeding

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Synchronize Schema with Supabase PostgreSQL
npx prisma db push

# 4. Seed Initial Bhopal Data (ASHA Workers, Households, Visits)
npm run prisma:seed

# 5. Start Development Server
npm run dev
```

---

## 🚢 Render Deployment Settings

- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma db push && node dist/server.js`
- **Port**: `5000`

---

<div align="center">
  <sub>Vaani AI Backend Server • Built for Scale & Frontline Healthcare Impact</sub>
</div>
