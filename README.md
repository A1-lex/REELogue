# REELogue 🎬
> *Your watch history, beautifully told.*

REELogue is a production-grade, full-stack Progressive Web App (PWA) designed to track watched movies, manage personal watchlists, and preview trailers in an intuitive, glassmorphic interface. Built with **Next.js**, **NestJS**, **Prisma ORM**, and **PostgreSQL**, REELogue showcases enterprise-level TypeScript development, clean architecture, and responsive mobile UX.

---

## 🌟 Key Features

* **Glassmorphic Journal Dashboard:** Custom dark-slate aesthetic (`#080A24`) built with Tailwind CSS, micro-interactions, responsive status tabs, and dynamic pagination.
* **Multi-Genre Relational Architecture:** Many-to-many ($M:N$) genre mappings allowing movies to belong to multiple categories simultaneously.
* **Interactive Status & Deletion:** Real-time state synchronization for toggling watch status (`TO_WATCH` vs. `WATCHED`) and deleting entries.
* **Embedded Trailer Integration:** Lightweight, in-app YouTube trailer modal player.
* **Cross-Browser PWA Hardening:** Native installability across Chromium (Chrome/Brave/Edge), Safari (iOS/macOS), and Firefox with offline asset caching, standard 192/512px maskable PNGs, and a custom `beforeinstallprompt` installation banner.
* **Full-Stack REST API:** Strongly typed NestJS backend with relational Prisma queries, custom DTO validation pipelines, offset-based pagination, and CORS isolation.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js (App Router, Server & Client Components)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **PWA Infrastructure:** Custom Service Worker (`sw.js`), Web App Manifest API, Sharp image rasterization pipeline

### Backend & Database
* **Framework:** NestJS (TypeScript RESTful API)
* **ORM:** Prisma ORM
* **Database:** PostgreSQL
* **Utilities:** `class-validator`, `class-transformer`

---

## 🏗️ Project Architecture

```text
movie_tracker/
├── backend/                  # NestJS RESTful API
│   ├── src/
│   │   ├── movies/           # Movies module (Controllers, Services, DTOs)
│   │   ├── genres/           # Genres module
│   │   └── prisma/           # Prisma client module & service
│   └── prisma/               # Database schema & migrations
│
└── frontend/                 # Next.js Application Frontend
    ├── public/               # Static PWA assets (manifest, sw.js, generated icons)
    ├── scripts/              # Sharp PWA icon generation pipeline
    └── src/
        ├── app/              # App Router pages, layouts, and metadata specs
        ├── components/       # UI Modals, Movie Cards, Install Banner, SW Provider
        ├── hooks/            # PWA custom lifecycle hooks (usePwaInstall)
        ├── lib/              # API Fetcher service layer
        └── types/            # Domain interfaces
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js:** v18+
* **PostgreSQL:** Local service or Docker container

### 1. Database Setup
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 2. Backend API Setup
```bash
cd backend
npm install
npm run start:dev
# API runs at http://localhost:3000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Generate high-resolution PWA icons
node scripts/generate-pwa-icons.mjs
npm run dev
# Frontend runs at http://localhost:3001
```

---

## 📱 Progressive Web App (PWA) Setup

REELogue passes all Chromium, Safari, and Firefox PWA audit criteria:

1. **Icon Rasterization:** Execute `node scripts/generate-pwa-icons.mjs` inside `frontend/` to build genuine binary-valid PNG assets (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`).
2. **Metadata & Manifest:** Explicit `manifest.json` linkage and Next.js `Viewport` API integration ensure immediate install prompts in supported browsers.
3. **Verification:** Inspect via Chrome DevTools (**Application > Manifest** and **Application > Service Workers**).

---

## 📈 Future Roadmap

* [ ] **Analytics & Stats Dashboard:** Visualizing monthly watch velocity and top genre metrics.
* [ ] **Search & Filter Extensions:** Live title search bar and advanced sorting.
* [ ] **User Authentication:** OAuth2 and JWT-based multi-user profile isolation.
* [ ] **TMDB Integration:** Automated movie metadata fetching via external APIs.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).