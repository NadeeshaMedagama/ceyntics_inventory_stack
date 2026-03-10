# Ceyntics Inventory Management System
## Microservices Architecture + SOLID Principles

---

## Architecture Overview

```
ceyntics-inventory-stack/
├── services/
│   ├── auth-service/          ← Port 8001 — Laravel 11
│   ├── user-service/          ← Port 8002 — Laravel 11
│   ├── inventory-service/     ← Port 8003 — Laravel 11
│   ├── borrow-service/        ← Port 8004 — Laravel 11
│   └── audit-service/         ← Port 8005 — Laravel 11
├── api-gateway/               ← Port 8000 — Nginx (reverse proxy)
├── frontend/                  ← Port 3000 — Next.js 14
├── docker-compose.yml
└── .env.example
```

---

## Microservices Breakdown

| Service | Domain Responsibility | Port | DB Schema |
|---|---|---|---|
| **auth-service** | Login, Logout, Token Validation | 8001 | `auth_db` |
| **user-service** | User CRUD, Role Management | 8002 | `user_db` |
| **inventory-service** | Cupboards, Places, Items | 8003 | `inventory_db` |
| **borrow-service** | Borrow & Return Records | 8004 | `borrow_db` |
| **audit-service** | Activity Logs (receives events) | 8005 | `audit_db` |

---

## SOLID Principles Application (per service)

### S — Single Responsibility
- Each microservice owns exactly ONE domain
- Within each service: Controller → Service → Repository (each has one job)

### O — Open/Closed
- All services expose versioned REST APIs (`/api/v1/...`)
- New functionality = new endpoints, not modification of existing
- Strategy pattern for item status transitions

### L — Liskov Substitution
- Repository interfaces: `ItemRepositoryInterface` → `EloquentItemRepository`
- Any repo implementation can replace another without breaking consumers

### I — Interface Segregation
- `CanBeBorrowed` interface (not all items need to be borrowable)
- `HasAuditLog` interface
- `Storable` interface for place assignment

### D — Dependency Inversion
- Controllers depend on `ServiceInterface`, not concrete class
- Services depend on `RepositoryInterface`, not Eloquent models directly
- Bound in `AppServiceProvider`

---

## Per-Service Internal Structure (Clean Architecture)

```
service-name/
└── app/
    ├── Http/
    │   ├── Controllers/V1/    ← Thin controllers only
    │   ├── Requests/          ← Form Requests (validation)
    │   ├── Resources/         ← API Resources (response shaping)
    │   └── Middleware/        ← Auth, Role checks
    ├── Services/              ← Business Logic (S of SOLID)
    │   └── Contracts/         ← Service Interfaces (D of SOLID)
    ├── Repositories/          ← Data access layer
    │   └── Contracts/         ← Repository Interfaces (D of SOLID)
    ├── Models/                ← Eloquent models
    ├── Events/                ← Domain events
    └── Observers/             ← Model observers → publish to audit-service
```

---

## Inter-Service Communication

```
Frontend → API Gateway (Nginx) → Correct Microservice
                                          ↘
                                    Audit Service (HTTP event push)
```

- **Auth validation**: Services call `auth-service/api/v1/validate-token`
- **Audit events**: Services POST to `audit-service/api/v1/events` (async-style fire-and-forget)
- **Cross-service data**: Inventory-service does NOT call user-service; User ID is stored directly

---

## Docker Compose Services

```yaml
services:
  postgres: Single PostgreSQL with multiple databases
  auth-service:    php artisan serve --port=8001
  user-service:    php artisan serve --port=8002
  inventory-service: php artisan serve --port=8003
  borrow-service:  php artisan serve --port=8004
  audit-service:   php artisan serve --port=8005
  nginx:           API Gateway on port 8000
  frontend:        Next.js on port 3000
```

---

## API Gateway (Nginx) Routing

```
POST   /api/v1/auth/*          → auth-service:8001
GET    /api/v1/users/*         → user-service:8002
POST   /api/v1/users/*         → user-service:8002
GET    /api/v1/cupboards/*     → inventory-service:8003
GET    /api/v1/places/*        → inventory-service:8003
GET    /api/v1/items/*         → inventory-service:8003
GET    /api/v1/borrow-records/*→ borrow-service:8004
GET    /api/v1/audit-logs/*    → audit-service:8005
```

---

## Database Schemas

### auth_db
- `personal_access_tokens` (Sanctum)

### user_db
- `users` (id, name, email, password, role, created_by, is_active)

### inventory_db
- `cupboards` (id, name, description, location)
- `places` (id, name, cupboard_id, description)
- `items` (id, name, code, quantity, serial_number, image_path, description, place_id, status)

### borrow_db
- `borrow_records` (id, item_id, item_name, item_code, borrower_name, contact, borrow_date, expected_return_date, qty_borrowed, returned_at, status, notes, created_by_user_id)

### audit_db
- `activity_logs` (id, service, action, entity_type, entity_id, user_id, user_name, old_values, new_values, metadata, created_at)

---

## Frontend Pages

| Route | Component | Access |
|---|---|---|
| `/` | Redirect → `/dashboard` | Protected |
| `/login` | LoginPage | Public |
| `/dashboard` | DashboardPage | All |
| `/users` | UsersPage | Admin |
| `/users/new` | CreateUserPage | Admin |
| `/storage` | CupboardsPage | All |
| `/storage/[cupboardId]` | PlacesPage | All |
| `/items` | ItemsPage | All |
| `/items/new` | CreateItemPage | Staff/Admin |
| `/items/[id]` | ItemDetailPage | All |
| `/borrow-records` | BorrowRecordsPage | All |
| `/borrow-records/new` | CreateBorrowPage | All |
| `/audit-logs` | AuditLogsPage | Admin |

---

## Implementation Checklist

### Infrastructure
- [x] docker-compose.yml
- [ ] Nginx config (api-gateway)
- [ ] .env files per service
- [ ] PostgreSQL multi-database init script

### Auth Service
- [ ] Laravel project
- [ ] Sanctum config
- [ ] LoginController, LogoutController
- [ ] TokenValidationController (for other services)
- [ ] AuthService + AuthServiceInterface
- [ ] UserAuthRepository + Interface

### User Service
- [ ] Laravel project
- [ ] UserController (admin-only CRUD)
- [ ] UserService + Interface
- [ ] UserRepository + Interface
- [ ] Role middleware (admin guard)

### Inventory Service
- [ ] Laravel project
- [ ] CupboardController, PlaceController, ItemController
- [ ] Service + Repository layer for each
- [ ] Image upload (Intervention Image)
- [ ] Quantity adjustment endpoint
- [ ] Status management (Strategy pattern)
- [ ] Observer → POST audit events

### Borrow Service
- [ ] Laravel project
- [ ] BorrowRecordController
- [ ] Return flow
- [ ] Calls inventory-service to adjust qty (via HTTP client)
- [ ] Observer → POST audit events

### Audit Service
- [ ] Laravel project
- [ ] ActivityLogController (receive events + list)
- [ ] ActivityLogService + Repository

### Frontend (Next.js)
- [ ] Auth context + token management
- [ ] Protected route HOC
- [ ] API client (axios with interceptors)
- [ ] Dashboard with KPIs
- [ ] All pages listed above
- [ ] Role-based UI rendering
