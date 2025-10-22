
---

# E-Commerce Backend (NestJS + Postgres + TypeORM)

A minimal, production-lean NestJS backend demonstrating **users**, **orders**, **order items**, **JWT auth**, and **role-based access** with Swagger docs.

## Stack

* **Node**: 18+ (Node 20+ recommended)
* **NestJS**: 11
* **DB**: Postgres 16 (Docker)
* **ORM**: TypeORM 0.3
* **Auth**: JWT (passport-jwt)
* **Validation**: class-validator + pipes
* **Docs**: Swagger at `/docs`
* **Package manager**: pnpm

---

## 1) Prerequisites

* Node.js **20+** (recommended). If you must use Node 18, add this polyfill at the very top of `src/main.ts`:

  ```ts
  // Polyfill for Node < 20 where global crypto isn't defined
  (global as any).crypto ??= require('node:crypto');
  ```
* Docker Desktop (for Postgres)
* pnpm: `npm i -g pnpm`

---

## 2) Install

```bash
pnpm i
```

---

## 3) Configure Environment

Create a **.env** in project root:

```env
# Postgres
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ecomm

# JWT
JWT_SECRET=super_long_random_secret_change_me
JWT_EXPIRES=1d

# Bcrypt
BCRYPT_ROUNDS=12

# Node env
NODE_ENV=development
```

---

## 4) Start Postgres via Docker

### Option A: docker-compose (recommended)

Create `docker-compose.yml`:

```yaml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ecomm
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

Run:

```bash
docker compose up -d
```

### Option B: plain docker

```bash
docker run --name ecomm-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ecomm -p 5432:5432 -d postgres:16
```

### Connect to psql inside container

```bash
# list containers
docker ps
# connect
docker exec -it <container_name_or_id> psql -U postgres -d ecomm
```

---

## 5) Create Schema (DDL)

> If you’re not using TypeORM migrations, run this once to create tables.

Save as `db.sql`, then execute inside `psql`:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin','customer');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending','paid','shipped','cancelled');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(120) NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  total_amount NUMERIC(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
```

Run:

```bash
docker exec -i <container_name_or_id> psql -U postgres -d ecomm < db.sql
```

---

## 6) Start the App

```bash
pnpm run start:dev
# Swagger:
# http://localhost:3000/docs
```

---

## 7) API Overview

### Auth

* `POST /auth/signup` — register, returns JWT
* `POST /auth/login` — login, returns JWT

### Users (admin only)

* `GET /users` — list users
* `POST /users` — create user (admin)
* `GET /users/:id` — get user
* `PATCH /users/:id` — update user
* `DELETE /users/:id` — delete user

### Orders (auth required)

* `POST /orders` — create order (only for the logged-in user)
* `GET /orders` — admin: all orders, customer: own orders
* `GET /orders/:id` — view single order (owner or admin)
* `PATCH /orders/:id` — update order (owner or admin)
* `DELETE /orders/:id` — delete order (owner or admin)

---

## 8) Example Requests

### Signup (customer)

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aniket Tikone",
    "email": "aniket@example.com",
    "password": "Password123!",
    "role": "customer"
  }'
```

**Response**

```json
{
  "accessToken": "<JWT>",
  "user": { "id": "uuid", "email": "aniket@example.com", "role": "customer" }
}
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aniket@example.com","password":"Password123!"}'
```

### Create Order (authorized)

```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "sku": "SKU-101", "name": "Mechanical Keyboard", "quantity": 1, "unitPrice": 3499.99 },
      { "sku": "SKU-202", "name": "Gaming Mouse", "quantity": 2, "unitPrice": 1299.50 }
    ],
    "status": "pending"
  }'
```

---

## 9) Data Model & Relationships

* **users** `1 ──*` **orders**
  `orders.user_id → users.id` (a user has many orders)

* **orders** `1 ──*` **order_items**
  `order_items.order_id → orders.id` (an order has many items)

* **Cascade rules**

  * Deleting an **order** cascades to **order_items**.
  * Deleting a **user** is **restricted** if orders exist (change to `SET NULL` if you prefer).

> In code, we map snake_case DB columns with `@JoinColumn({ name: 'user_id' | 'order_id' })`, and numeric fields (`total_amount`, `unit_price`) are represented as strings by TypeORM/pg.

---

## 10) Roles & Guards

* **JWT Guard** protects `/users` and `/orders`.
* **RolesGuard** + `@Roles('admin')` limit `/users` to admins.
* **Ownership checks** in `OrdersService` ensure customers access **only** their own orders; admins can access all.

---

## 11) Swagger

* Available at `http://localhost:3000/docs`
* Click **Authorize** and paste `Bearer <JWT>`
* DTOs include examples for quick try-outs.

---

## 12) Scripts

`package.json` includes:

```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "build": "nest build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"{src,tests}/**/*.ts\""
  }
}
```

Run unit tests:

```bash
pnpm test
```

---

## 13) Troubleshooting

* **`crypto is not defined` (Node 18)**: add the polyfill line shown in §1 or upgrade to Node 20+.
* **`column "userId"/"orderId" does not exist`**: the DB uses snake_case (`user_id`, `order_id`). Ensure your entities have:

  ```ts
  @JoinColumn({ name: 'user_id' }) // in Order.user
  @JoinColumn({ name: 'order_id' }) // in OrderItem.order
  @Column({ name: 'total_amount' })
  @Column({ name: 'unit_price' })
  @CreateDateColumn({ name: 'created_at' })
  ```

  Rebuild after changes:

  ```bash
  rm -rf dist && pnpm run start:dev
  ```
* **JWT errors**: ensure `.env` has a strong `JWT_SECRET`.

---

## 14) Notes for Production

* Set `synchronize: false` (already set).
* Use **migrations** for schema changes.
* Add **refresh tokens**, **rate-limiting** on login, and **audit logs** as needed.
* Consider `typeorm-naming-strategies` with `SnakeNamingStrategy` for consistent snake_case generation.

---