# 🎙️ Vaani AI — AI Voice Health OS

> Multilingual AI-powered clinical decision support system, real-time epidemiological surveillance, and voice-first health operating system for ASHA workers in rural healthcare.

---

## 📁 Repository Structure

```
vaani-AI/
├── vaani_backend-main/      # Node.js + Express + Prisma + PostgreSQL + Socket.IO API
│   ├── prisma/              # Prisma schema & database seeds
│   │   ├── schema.prisma    # Complete relational health models (12 tables)
│   │   └── seed.ts          # Rural field demo data seed script
│   ├── src/                 # Controllers, Services, Middleware, Routes
│   └── package.json         # Backend dependencies & build scripts
│
└── Vaani_frontend-main/     # React 18 + Vite + Tailwind CSS + Lucide
    ├── src/                 # 3D Avatar Centerpiece, GIS Maps, Audio Waveforms
    ├── public/              # High-resolution assets
    └── package.json         # Frontend dependencies & build scripts
```

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd vaani_backend-main
npm install
npx prisma generate
npm run build
npm run dev
```

### 2. Frontend Setup
```bash
cd Vaani_frontend-main
npm install
npm run dev
```

---

## 🚢 Vercel Deployment Instructions

### Deploying the Backend API
1. Import this repository in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Set **Root Directory** to:
   ```
   vaani_backend-main
   ```
3. Set **Build Command** to:
   ```
   npm run build
   ```
   *(Executes `prisma generate && tsc` with schema at `prisma/schema.prisma`)*
4. Configure Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`).

### Deploying the Frontend Client
1. Import this repository in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Set **Root Directory** to:
   ```
   Vaani_frontend-main
   ```
3. Set **Build Command** to:
   ```
   npm run build
   ```
4. Set Environment Variables:
   * `VITE_API_URL` (URL of your deployed backend)
   * `VITE_SOCKET_URL` (URL of your backend WebSocket server)
