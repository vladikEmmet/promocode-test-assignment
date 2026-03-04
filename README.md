# PromoCode Manager

A fullstack application for managing promocodes with analytics, implementing CQRS architecture with separated read and
write stores.

---

## Tech Stack

| Layer            | Technologies                                     |
|------------------|--------------------------------------------------|
| Backend          | NestJS, TypeScript, Mongoose                     |
| Frontend         | React 19, TypeScript, shadcn/ui, Tailwind CSS v4 |
| Databases        | MongoDB 7, ClickHouse 24.3, Redis 7              |
| Tables           | TanStack Table (server-side)                     |
| Forms            | React Hook Form + Zod                            |
| State / Fetching | Zustand, TanStack Query                          |
| Infrastructure   | Docker Compose                                   |

---

## Quick Start

```bash
git clone <repo-url>
cd promo-manager
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`
- Swagger docs: `http://localhost:3000/api/docs`

### Seed (development only)

To populate the database with test data:

```bash
cd backend
npm install
npm run seed
```

Test accounts after seed:

| Email          | Password    |
|----------------|-------------|
| alice@test.com | password123 |
| bob@test.com   | password123 |

---

## Architecture

### CQRS — Separated Stores

The core principle of the application is the separation of write and read paths:

```
Client
  │
  ├── Mutations (POST/PATCH/DELETE)
  │     └── NestJS API → MongoDB (source of truth)
  │                    → sync-on-write → ClickHouse
  │
  └── Analytics (GET /analytics/*)
        └── NestJS API → ClickHouse (read only)
```

**MongoDB** stores the current state of all entities. All mutations go through Mongoose schemas with validation.

**ClickHouse** stores denormalized copies of data for analytics. All frontend tables read exclusively from ClickHouse —
MongoDB is never called when reading analytics.

**Redis** is used for two scenarios:

- Distributed lock when applying a promocode — prevents race conditions
- Analytics query cache with 30s TTL + invalidation after mutations

---

### ClickHouse Tables

| Table          | Engine             | Purpose                                               |
|----------------|--------------------|-------------------------------------------------------|
| `users`        | ReplacingMergeTree | Users. Deduplicated by `updated_at` on merge          |
| `promocodes`   | ReplacingMergeTree | Promocodes. Deduplicated by `updated_at` on merge     |
| `orders`       | MergeTree          | Orders. Partitioned by month (`toYYYYMM(created_at)`) |
| `promo_usages` | MergeTree          | Promocode usage history. Partitioned by month         |

Tables are created automatically on application startup via `ClickHouseMigrationsService.onApplicationBootstrap()`.

**Denormalization:** all tables are self-sufficient. For example, `promo_usages` contains not only `user_id` and
`promocode_id`, but also `user_email`, `user_name`, `promocode_code` — analytics require no joins back to MongoDB.

**FINAL modifier:** `users` and `promocodes` use `ReplacingMergeTree`, which deduplicates records asynchronously. To
read consistent data, all queries to these tables use the `FINAL` modifier.

---

### MongoDB → ClickHouse Synchronization

**Sync-on-write** pattern via the base class `SyncService`:

```
Mutation in MongoDB
      ↓
syncAndInvalidate()
      ├── withRetry() → ClickHouse INSERT (3 attempts, 500/1000/1500ms delay)
      └── invalidateCache() → Redis DEL by key pattern
```

- Sync errors do not block the main operation — wrapped in try/catch
- Retry logic: 3 attempts with exponential backoff
- After each mutation the Redis cache for related analytics tables is invalidated
- All operations are covered: create, update, deactivate

---

### Redis: Distributed Lock

A distributed lock is used when applying a promocode to prevent race conditions:

```
Request A: SET lock:promocode:SAVE20:userId NX EX 10  → OK
Request B: SET lock:promocode:SAVE20:userId NX EX 10  → nil (locked)
Request A: validates limits → applies → DEL lock
```

The lock stores a UUID value for safe deletion — prevents accidental deletion of another request's lock.

---

### Server-side Table Operations

All three analytics tables support:

- **Pagination** — `LIMIT / OFFSET` on the ClickHouse side, no full data loading
- **Sorting** — `ORDER BY` with a whitelist of allowed fields (prevents SQL injection)
- **Date filter** — `WHERE field >= dateFrom AND field <= dateTo`, passed as a parameter
- **Search** — `ILIKE` with a parameterized value
- **Debounce** — search requests are debounced by 400ms on the frontend

All parameters are passed via ClickHouse client `query_params` — no string interpolation of user input anywhere.

---

## API Endpoints

### Auth

| Method | URL                  | Description          |
|--------|----------------------|----------------------|
| POST   | `/api/auth/register` | Register a new user  |
| POST   | `/api/auth/login`    | Login                |
| POST   | `/api/auth/refresh`  | Refresh access token |
| GET    | `/api/auth/me`       | Get current user     |

### Users

| Method | URL              | Description     |
|--------|------------------|-----------------|
| GET    | `/api/users`     | List all users  |
| GET    | `/api/users/:id` | Get user by ID  |
| PATCH  | `/api/users/:id` | Update user     |
| DELETE | `/api/users/:id` | Deactivate user |

### Promocodes

| Method | URL                   | Description          |
|--------|-----------------------|----------------------|
| POST   | `/api/promocodes`     | Create promocode     |
| GET    | `/api/promocodes`     | List all promocodes  |
| GET    | `/api/promocodes/:id` | Get promocode by ID  |
| PATCH  | `/api/promocodes/:id` | Update promocode     |
| DELETE | `/api/promocodes/:id` | Deactivate promocode |

### Orders

| Method | URL                               | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | `/api/orders`                     | Create order             |
| GET    | `/api/orders/my`                  | Get my orders            |
| POST   | `/api/orders/:id/apply-promocode` | Apply promocode to order |

### Analytics (ClickHouse)

| Method | URL                           | Description                 |
|--------|-------------------------------|-----------------------------|
| GET    | `/api/analytics/users`        | Users with aggregated stats |
| GET    | `/api/analytics/promocodes`   | Promocodes with metrics     |
| GET    | `/api/analytics/promo-usages` | Promocode usage history     |

Query parameters for analytics: `page`, `limit`, `sortBy`, `sortOrder`, `dateFrom`, `dateTo`, `search`.

---

## Promocode Validation

When applying a promocode to an order, all conditions are checked:

1. Order exists
2. Order belongs to the current user
3. Promocode has not already been applied to this order
4. Promocode exists
5. Promocode is active (`isActive: true`)
6. Validity period has not expired (`dateFrom` / `dateTo`)
7. Global usage limit not exceeded (`usageLimit`)
8. Per-user usage limit not exceeded (`perUserLimit`)

---

## Project Structure

```
promo-manager/
├── backend/
│   ├── src/
│   │   ├── common/
│   │   │   ├── decorators/        # @CurrentUser
│   │   │   ├── filters/           # GlobalExceptionFilter
│   │   │   ├── helpers/           # retry.helper, clickhouse-date.helper
│   │   │   └── services/          # SyncService (base class)
│   │   ├── config/                # app, database, jwt configs
│   │   ├── database/
│   │   │   ├── clickhouse/        # ClickHouseModule + migrations
│   │   │   ├── mongo/             # MongoModule
│   │   │   ├── redis/             # RedisModule
│   │   │   └── seed.ts            # Test data
│   │   └── modules/
│   │       ├── analytics/         # GET /analytics/* → ClickHouse
│   │       ├── auth/              # JWT, login, register
│   │       ├── health/            # GET /health
│   │       ├── orders/            # Orders + apply promocode
│   │       ├── promocodes/        # CRUD promocodes
│   │       └── users/             # CRUD users
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/                   # Axios clients + services
│   │   ├── components/
│   │   │   ├── forms/             # PromocodeDialog, UserDialog
│   │   │   ├── layout/            # Sidebar, Header, ProtectedRoute
│   │   │   └── tables/            # DataTable, TableFilters
│   │   ├── hooks/                 # useAuth, useAnalyticsTable, useTableQuery
│   │   ├── pages/
│   │   │   ├── auth/              # LoginPage, RegisterPage
│   │   │   └── dashboard/         # UsersPage, PromocodesPage, OrdersPage, PromoUsagesPage
│   │   ├── store/                 # Zustand auth store
│   │   └── types/                 # TypeScript interfaces
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## Environment Variables

All variables are set in `backend/.env`. Example in `backend/.env.example`:

```env
NODE_ENV=production
PORT=3000

MONGO_URI=mongodb://admin:secret@mongo:27017/promo_manager?authSource=admin

CH_HOST=http://clickhouse:8123
CH_USER=admin
CH_PASSWORD=secret
CH_DB=promo_analytics

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=secret

JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```