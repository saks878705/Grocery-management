# Grocery Store Management Backend

Backend for a grocery store catalog, stock, and order management system, with an automated
low-stock alert pipeline for admins.

## Tech stack

- Node.js + Express
- PostgreSQL (Sequelize) — core transactional/relational data
- MongoDB (Mongoose) — notifications and login activity
- JWT auth + Google OAuth (Passport)
- node-cron for the low-stock alert job
- Nodemailer for admin email alerts

## Why two databases

PostgreSQL holds everything that is relational and needs strong consistency: users,
categories, products, stock levels, orders, order items, and reported issues. Order placement
in particular needs row-level locking and transactions so two customers can't both buy the
last unit of a product — that's a job for a relational database, not a document store.

MongoDB holds notifications and login activity: high-write, schema-light, append-mostly data
that's read as a feed rather than joined against other tables. Nothing in this data needs a
foreign key into Postgres beyond a plain `userId` string, so a document store is a better fit
and keeps that traffic off the primary transactional database.

## Features

- JWT-based auth (signup/login/refresh) plus Google OAuth, with ADMIN/CUSTOMER roles
- Password reset flow (token + expiry)
- Category and product CRUD, with categories grouping products
- Stock management, including a configurable per-product low-stock threshold
- Order placement using a Postgres transaction with row-level locks on stock, so a product
  that runs out between selection and checkout is caught and rejected instead of oversold
- Order lifecycle: status updates, item modification, rescheduling, cancellation — each
  restores/deducts stock correctly and notifies the customer
- Customer issue reporting, with an admin notification on submission
- Notification feed (list + mark-as-read) for both admins and customers
- Daily cron job that emails admins and creates in-app notifications when stock drops below
  its configured threshold
- Analytics endpoints: product consumption trends and login-activity trends over time
- Request validation (express-validator) and rate limiting on auth endpoints

## Local database setup (macOS, Homebrew)

If you don't already have Postgres/MongoDB running locally:

```bash
brew install postgresql@16
brew tap mongodb/brew
brew install mongodb-community@7.0

brew services start postgresql@16
brew services start mongodb-community@7.0

# create the postgres role + database used by .env.example
/opt/homebrew/opt/postgresql@16/bin/psql -U "$(whoami)" -d postgres -c \
  "CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'change_me';"
/opt/homebrew/opt/postgresql@16/bin/psql -U "$(whoami)" -d postgres -c \
  "CREATE DATABASE grocery_db OWNER postgres;"
```

MongoDB needs no manual database/user setup — `mongoose.connect()` creates the database on
first write. Any other Postgres/MongoDB install (Docker, a hosted instance, etc.) works too;
just point `.env` at it.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in real values (Postgres/Mongo connection info,
   a JWT secret, SMTP credentials for the low-stock emails, and Google OAuth credentials if
   you want OAuth login):
   ```bash
   cp .env.example .env
   ```
3. Make sure a Postgres database and a MongoDB instance are reachable using the values in
   `.env`. The app creates/updates Postgres tables automatically on startup
   (`sequelize.sync({ alter: true })`) — no separate migration step is required.
4. Run the server:
   ```bash
   npm run dev   # nodemon, for local development
   npm start     # plain node, for production
   ```

No Docker is required to run the project; a Postgres and MongoDB instance (local or hosted)
are the only external dependencies.

**macOS note:** the default `PORT` is `5050`, not `5000` — on macOS, port 5000 is claimed by
the AirPlay Receiver service (`ControlCenter`), which silently intercepts requests instead of
letting the app bind to it. If you change `PORT`, avoid 5000 for the same reason (or turn off
AirPlay Receiver in System Settings → General → AirDrop & Handoff).

## API overview

All routes are mounted under `/api/v1`. Every route except `/health` and the auth routes
requires a `Bearer` JWT; admin-only routes additionally require an ADMIN-role account.

- `auth` — signup, login, refresh, forgot/reset password, Google OAuth
- `categories` — CRUD, admin-only writes
- `products` — CRUD + search/filter/pagination, admin-only writes
- `stocks` — CRUD, including updating a product's low-stock threshold, admin-only writes
- `orders` — place, list own, update status, modify items, reschedule, cancel
- `issues` — customers report issues, admins list/update status
- `notifications` — list own notifications, mark as read
- `analytics` — product consumption and login-activity trends (admin-only)

## Notes on design decisions

- Order placement, modification, and cancellation all run inside a single Postgres
  transaction with `SELECT ... FOR UPDATE` locks on the relevant stock rows, so concurrent
  requests against the same product serialize correctly instead of racing.
- Notification creation (email + Mongo record) never blocks or rolls back an already-committed
  order — a Mongo/SMTP failure is logged, not surfaced to the customer as a failed order.
- Legacy CRUD controllers (category/product/stock/auth) keep a simple try/catch-per-controller
  error style; new endpoints added later use a shared `AppError` type and a single global error
  handler for a more consistent error response shape going forward.
