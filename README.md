# AWB Editor SaaS

A modern SaaS application for Air Waybill (AWB) editing, document generation, and tracking. Built with React (Vite), Express.js, PostgreSQL (Prisma ORM), and PDF generation features.

---

## 🏗️ Project Architecture & Tech Stack

This project is organized as a monorepo containing full-stack client and server components:

- **Frontend (`/client`)**: React 19, Vite, React Router 7, Zustand, React Hook Form, Zod.
- **Backend (`/server`)**: Node.js, Express 5, Prisma ORM, JWT Authentication (Access & Refresh tokens), PDFKit, QR Code & Barcode generators (`bwip-js`).
- **Database**: PostgreSQL (with Docker Compose support).

---

## 📁 Repository Structure

```
awb/
├── client/                 # Vite + React Frontend
│   ├── src/                # Frontend source code (pages, components, store, services)
│   ├── .env.example        # Template for frontend environment variables
│   └── package.json        # Frontend dependencies & scripts
├── server/                 # Node.js + Express Backend API
│   ├── prisma/             # Prisma schema & seed script
│   ├── src/                # Express controllers, routes, middleware, services
│   ├── .env.example        # Template for backend environment variables
│   └── package.json        # Backend dependencies & scripts
├── docker-compose.yml      # Local PostgreSQL container configuration
├── .gitignore              # Root Git ignore rules
└── README.md               # Project documentation
```

---

## 🚀 Quick Start & Setup Guide

### 1. Prerequisites
- **Node.js**: v18 or higher
- **npm** or **yarn** or **pnpm**
- **Docker Desktop** (optional, for running PostgreSQL database container)

---

### 2. Database Setup

Using Docker Compose to run PostgreSQL locally:
```bash
docker-compose up -d
```

---

### 3. Backend Setup (`/server`)

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and adjust database credentials if needed:
   ```bash
   cp .env.example .env
   ```
4. Run Prisma database migrations & generate client:
   ```bash
   npm run db:push
   npm run db:generate
   ```
5. Seed initial test data (optional):
   ```bash
   npm run db:seed
   ```
6. Start the backend development server:
   ```bash
   npm run dev
   ```
   *Backend API runs at:* `http://localhost:5000`

---

### 4. Frontend Setup (`/client`)

1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *Frontend app runs at:* `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend (`server/.env`)
- `DATABASE_URL`: PostgreSQL connection URI.
- `JWT_SECRET`: Secret key for signing access tokens.
- `JWT_REFRESH_SECRET`: Secret key for signing refresh tokens.
- `PORT`: Express server port (Default: `5000`).
- `CLIENT_URL`: Allowed CORS origin (Default: `http://localhost:5173`).

### Frontend (`client/.env`)
- `VITE_API_URL`: Base URL for the Express API (Default: `http://localhost:5000/api`).

---

## ⚙️ Available Scripts

### Backend (`/server`)
- `npm run dev` – Starts Node server with Nodemon (live reload).
- `npm start` – Starts Node server in production mode.
- `npm run db:push` – Pushes Prisma schema changes directly to DB.
- `npm run db:generate` – Generates Prisma Client TypeScript/JS bindings.
- `npm run db:seed` – Seeds database with default seed data.
- `npm run db:studio` – Opens Prisma GUI data editor in browser.

### Frontend (`/client`)
- `npm run dev` – Starts Vite development server.
- `npm run build` – Builds production bundle to `dist/`.
- `npm run preview` – Previews production build locally.
- `npm run lint` – Runs Oxlint code linter.

---

## 📄 License
ISC
