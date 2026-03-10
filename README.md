<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PHP-8.5-777BB4?style=for-the-badge&logo=php&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

# Ceyntics Inventory Management System

> A production-grade, microservices-based inventory management platform built with **Laravel 12**, **Next.js 16**, and **PostgreSQL** — designed with **SOLID principles** and **clean architecture** for enterprise-grade scalability.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Microservices Breakdown](#microservices-breakdown)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Option A — Local Development (Recommended)](#option-a--local-development-recommended)
  - [Option B — Docker Compose](#option-b--docker-compose)
- [Default Credentials](#default-credentials)
- [Project Structure](#project-structure)
- [Design Principles](#design-principles)
- [Frontend Pages](#frontend-pages)
- [Environment Configuration](#environment-configuration)
- [Scripts Reference](#scripts-reference)
- [License](#license)

---

## Architecture Overview

```
┌──────────────┐       ┌──────────────────────────────────────────────────┐
│              │       │              API Gateway (Port 8000)              │
│   Frontend   │──────▶│   Nginx (Docker) / Express Proxy (Local Dev)     │
│  Next.js 16  │       └───────┬─────────┬──────────┬──────────┬─────────┘
│  Port 3000   │               │         │          │          │
└──────────────┘               ▼         ▼          ▼          ▼
                         ┌─────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
                         │  Auth   │ │  User  │ │  Inv.  │ │ Borrow │ │ Audit  │
                         │ :8001   │ │ :8002  │ │ :8003  │ │ :8004  │ │ :8005  │
                         └────┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
                              │          │          │          │          │
                              ▼          ▼          ▼          ▼          ▼
                         ┌──────────────────────────────────────────────────┐
                         │          PostgreSQL 16 (Docker) / SQLite         │
                         │     auth_db · user_db · inventory_db · etc.      │
                         └──────────────────────────────────────────────────┘
```

All authenticated services validate Bearer tokens by calling the **Auth Service** internally. CRUD operations emit audit events to the **Audit Service** via HTTP.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | Next.js, React, Tailwind CSS, Zustand, Recharts | 16.1, 19.2, 4.x |
| **Backend** | Laravel (× 5 microservices) | 12.x |
| **Language** | PHP, TypeScript | 8.5, 5.x |
| **Database** | PostgreSQL (Docker) / SQLite (Local Dev) | 16 |
| **Auth** | Laravel Sanctum (token-based) | — |
| **API Gateway** | Nginx (Docker) / Express + http-proxy-middleware (Local) | — |
| **Containerization** | Docker, Docker Compose | — |
| **Validation** | Zod 4 + React Hook Form | 4.3, 7.x |

---

## Microservices Breakdown

| Service | Responsibility | Port | Database | Key Endpoints |
|---|---|---|---|---|
| **auth-service** | Authentication, token issuance & validation | `8001` | `auth_db` | `POST /auth/login`, `POST /auth/validate-token` |
| **user-service** | User CRUD, role management (admin only) | `8002` | `user_db` | `GET /users`, `POST /users`, `PUT /users/:id` |
| **inventory-service** | Cupboards, places, items, dashboard stats | `8003` | `inventory_db` | `CRUD /items`, `CRUD /cupboards`, `GET /stats` |
| **borrow-service** | Borrow & return records | `8004` | `borrow_db` | `CRUD /borrow-records`, `POST /:id/return` |
| **audit-service** | Activity logging (event receiver + query) | `8005` | `audit_db` | `POST /events`, `GET /audit-logs` |

> All endpoints are prefixed with `/api/v1/` and routed through the API Gateway on port `8000`.

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Login with email & password |
| `POST` | `/api/v1/auth/logout` | Bearer | Invalidate current token |
| `GET` | `/api/v1/auth/me` | Bearer | Get authenticated user profile |
| `POST` | `/api/v1/auth/validate-token` | Bearer | Internal token validation |

### Users (Admin Only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/users` | List all users |
| `POST` | `/api/v1/users` | Create new user |
| `GET` | `/api/v1/users/:id` | Get user by ID |
| `PUT` | `/api/v1/users/:id` | Update user |
| `DELETE` | `/api/v1/users/:id` | Soft-delete user |

### Inventory

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/items` | List items (paginated, filterable) |
| `POST` | `/api/v1/items` | Create item |
| `GET` | `/api/v1/items/:id` | Get item detail |
| `PUT` | `/api/v1/items/:id` | Update item |
| `DELETE` | `/api/v1/items/:id` | Soft-delete item |
| `POST` | `/api/v1/items/:id/adjust-quantity` | Adjust stock quantity |
| `GET` | `/api/v1/stats` | Dashboard statistics |
| `CRUD` | `/api/v1/cupboards` | Cupboard management |
| `CRUD` | `/api/v1/places` | Place management |

### Borrow Records

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/borrow-records` | List all records |
| `POST` | `/api/v1/borrow-records` | Issue item to borrower |
| `GET` | `/api/v1/borrow-records/:id` | Get record detail |
| `PUT` | `/api/v1/borrow-records/:id` | Update record |
| `POST` | `/api/v1/borrow-records/:id/return` | Mark item as returned |

### Audit Logs (Admin Only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/audit-logs` | List activity logs |
| `GET` | `/api/v1/audit-logs/:id` | Get log detail |
| `POST` | `/api/v1/events` | Receive audit event (internal) |

---

## Database Schema

### `auth_db`
| Table | Description |
|---|---|
| `users` | Admin user records with Sanctum tokens |
| `personal_access_tokens` | Laravel Sanctum token store |

### `user_db`
| Table | Columns |
|---|---|
| `users` | `id`, `name`, `email`, `password`, `role` (admin/staff), `is_active`, `created_by`, `soft_deletes` |

### `inventory_db`
| Table | Columns |
|---|---|
| `cupboards` | `id`, `name`, `description`, `location`, `soft_deletes` |
| `places` | `id`, `name`, `cupboard_id` (FK), `description`, `soft_deletes` |
| `items` | `id`, `name`, `code` (unique), `quantity`, `serial_number`, `image_path`, `description`, `place_id` (FK), `status`, `created_by_user_id`, `soft_deletes` |

### `borrow_db`
| Table | Columns |
|---|---|
| `borrow_records` | `id`, `item_id`, `item_name`, `item_code`, `borrower_name`, `contact`, `borrow_date`, `expected_return_date`, `qty_borrowed`, `returned_at`, `status`, `notes`, `created_by_user_id` |

### `audit_db`
| Table | Columns |
|---|---|
| `activity_logs` | `id`, `service`, `action`, `entity_type`, `entity_id`, `user_id`, `user_name`, `old_values` (JSON), `new_values` (JSON), `metadata` (JSON), `created_at` |

---

## Getting Started

### Prerequisites

| Requirement | Version | Purpose |
|---|---|---|
| **Node.js** | 20+ | Frontend & local API gateway |
| **PHP** | 8.2+ | Laravel backend services |
| **Composer** | 2.x | PHP dependency management |
| **Docker** _(optional)_ | Latest | Containerized deployment |

### Option A — Local Development (Recommended)

This runs all services natively with SQLite databases — no Docker required.

```bash
# 1. Clone the repository
git clone <repository-url>
cd ceyntics-inventory-stack

# 2. Install root dependencies (gateway + concurrently)
npm install

# 3. Install PHP dependencies for all services
npm run install:backend

# 4. Generate environment files for local development
npm run setup:env

# 5. Run database migrations for all services
npm run migrate:all

# 6. Seed the default admin user
npm run seed:all

# 7. Install frontend dependencies
cd frontend && npm install && cd ..

# 8. Start everything (gateway + 5 services + frontend)
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:8000

### Option B — Docker Compose

Runs all services in containers with PostgreSQL.

```bash
# 1. Build and start all containers
docker-compose up -d --build

# 2. Run migrations (first time only)
docker-compose exec auth-service php artisan migrate:fresh --seed
docker-compose exec user-service php artisan migrate:fresh
docker-compose exec inventory-service php artisan migrate:fresh
docker-compose exec borrow-service php artisan migrate:fresh
docker-compose exec audit-service php artisan migrate:fresh
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:8000

---

## Default Credentials

| Field | Value |
|---|---|
| **Email** | `admin@ceyntics.com` |
| **Password** | `Admin@1234!` |
| **Role** | Administrator |

---

## Project Structure

```
ceyntics-inventory-stack/
├── api-gateway/                  # Nginx reverse proxy configuration
│   └── nginx.conf
├── frontend/                     # Next.js 16 + React 19 + Tailwind CSS 4
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── dashboard/        # Dashboard with KPIs & charts
│   │   │   ├── items/            # Inventory management
│   │   │   ├── users/            # User administration
│   │   │   ├── borrow-records/   # Borrowing system
│   │   │   └── login/            # Authentication
│   │   ├── components/
│   │   │   ├── layout/           # Sidebar navigation
│   │   │   ├── modals/           # AddItem, CreateUser, IssueBorrow
│   │   │   └── ui/               # Reusable components (Modal)
│   │   ├── lib/                  # Axios API client, utilities
│   │   └── store/                # Zustand auth store
│   └── package.json
├── services/
│   ├── auth-service/             # Authentication & token management
│   ├── user-service/             # User CRUD & role management
│   ├── inventory-service/        # Items, cupboards, places, stats
│   ├── borrow-service/           # Borrow & return records
│   └── audit-service/            # Activity logging
├── docker-compose.yml            # Full-stack container orchestration
├── local-gateway.js              # Express-based API proxy for local dev
├── setup-env.js                  # Auto-generates .env files for local dev
├── init-db.sh                    # PostgreSQL multi-database init script
└── package.json                  # Root scripts & dev dependencies
```

### Per-Service Architecture (Clean Architecture)

```
service/
└── app/
    ├── Http/
    │   ├── Controllers/V1/       # Thin REST controllers
    │   ├── Requests/             # Form Request validation (Zod-like rules)
    │   ├── Resources/            # API Resource transformers
    │   └── Middleware/            # Auth token validation, role guards
    ├── Services/                 # Business logic layer
    │   └── Contracts/            # Service interfaces
    ├── Repositories/             # Data access layer
    │   └── Contracts/            # Repository interfaces
    ├── Models/                   # Eloquent models
    └── Providers/                # Dependency injection bindings
```

---

## Design Principles

### SOLID Architecture

| Principle | Implementation |
|---|---|
| **S** — Single Responsibility | Each microservice owns exactly one domain. Internally: Controller → Service → Repository. |
| **O** — Open/Closed | Versioned REST APIs (`/api/v1/`). New features extend, never modify existing contracts. |
| **L** — Liskov Substitution | Repository interfaces allow swapping implementations (e.g., `EloquentItemRepository` → `CacheItemRepository`). |
| **I** — Interface Segregation | Fine-grained interfaces per concern — services only implement what they need. |
| **D** — Dependency Inversion | Controllers depend on `ServiceInterface`, services depend on `RepositoryInterface` — bound via `AppServiceProvider`. |

### Security

- **Token-based authentication** via Laravel Sanctum
- **Inter-service token validation** — every request is verified against the Auth Service
- **Role-based access control** — Admin and Staff roles with middleware guards
- **CORS protection** — configured at the API Gateway level
- **Rate limiting** — Nginx rate-limiting zones for login and API endpoints
- **Input validation** — Laravel Form Requests (backend) + Zod schemas (frontend)

---

## Frontend Pages

| Route | Page | Access | Description |
|---|---|---|---|
| `/login` | Login | Public | Email/password authentication |
| `/dashboard` | Dashboard | Protected | KPIs, item status chart, system overview |
| `/items` | Inventory Log | Protected | Full item management with CRUD modals |
| `/users` | Organization Access | Admin | User provisioning & audit pipeline |
| `/borrow-records` | Borrowing System | Protected | Issue, track, and return items |

---

## Environment Configuration

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Backend Services (auto-generated by `setup:env`)

```env
# Database (SQLite for local, PostgreSQL for Docker)
DB_CONNECTION=sqlite

# Inter-service communication
AUTH_SERVICE_URL=http://127.0.0.1:8001
INVENTORY_SERVICE_URL=http://127.0.0.1:8003
AUDIT_SERVICE_URL=http://127.0.0.1:8005
```

> Run `npm run setup:env` to auto-generate all service `.env` files with correct local URLs.

---

## Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Start the entire stack (backend + frontend) |
| `npm run dev:backend` | Start gateway + all 5 PHP services |
| `npm run dev:frontend` | Start Next.js frontend only |
| `npm run gateway` | Start the local Express API gateway |
| `npm run setup:env` | Generate `.env` files for all services |
| `npm run install:backend` | Run `composer install` in all services |
| `npm run migrate:all` | Run `migrate:fresh` on all services |
| `npm run seed:all` | Seed default admin user (auth-service) |
| `npm run serve:auth` | Start auth-service on port 8001 |
| `npm run serve:user` | Start user-service on port 8002 |
| `npm run serve:inventory` | Start inventory-service on port 8003 |
| `npm run serve:borrow` | Start borrow-service on port 8004 |
| `npm run serve:audit` | Start audit-service on port 8005 |

---

## License

This project is proprietary software developed for **Ceyntics Systems**. All rights reserved.
