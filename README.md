# Booking.go - Web Application

Frontend web application for **Booking.go** — a multi-tenant SaaS platform for slot-based booking management. Built with Next.js 15, React 19, and TypeScript.

---

## Tech Stack

| Layer          | Technology                           |
|----------------|--------------------------------------|
| Framework      | Next.js 15                           |
| UI Library     | React 19                             |
| Language       | TypeScript 5                         |
| Styling        | Tailwind CSS 3                       |
| State          | Zustand 5                            |
| Data Fetching  | TanStack React Query 5               |
| HTTP Client    | Axios                                |
| Auth           | NextAuth v5 (Auth.js)                |
| Forms          | React Hook Form + Zod                |
| Icons          | Lucide React                         |
| Notifications  | React Hot Toast                      |

---

## Project Structure

```
src/
  lib/            # API client and utilities
  pages/          # Next.js pages (routes)
  store/          # Zustand state stores
  styles/         # Global CSS (Tailwind)
  types/          # TypeScript type definitions
docs/             # Design documents
```

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Backend API** running at `http://localhost:8000` ([booking-go-engine](https://github.com/Booking-Go/booking-go-engine))

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Booking-Go/booking-go-web.git
cd booking-go-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

### 4. Start the development server

```bash
npm run dev
```

App starts at `http://localhost:3000`

---

## Scripts

| Command          | Description                   |
|------------------|-------------------------------|
| `npm run dev`    | Start dev server              |
| `npm run build`  | Production build              |
| `npm start`      | Run production build          |
| `npm run lint`   | Lint with ESLint              |
| `npm run format` | Format with Prettier          |

---

## Related Repositories

| Repository | Description |
|------------|-------------|
| [booking-go-engine](https://github.com/Booking-Go/booking-go-engine) | Backend API (Node.js + Express + TypeScript) |

---

## Branch Strategy

| Branch    | Purpose                              |
|-----------|--------------------------------------|
| `main`    | Production releases                  |
| `staging` | Pre-production (PRs from dev)        |
| `dev`     | Active development (PRs from local)  |

Feature branches are created from `dev` and merged back via pull requests.

---

## License

MIT
