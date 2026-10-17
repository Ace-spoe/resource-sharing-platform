# Study Resource Platform API

Express API using Node.js, PostgreSQL, Prisma, and bcrypt.

## Requirements

- Node.js 20.19 or newer
- PostgreSQL

## Setup

1. From this directory, install dependencies:

   ```sh
   npm install
   ```

2. Create `server/.env` and set `DATABASE_URL` to your local PostgreSQL
   connection string, and `PORT=3000`:

   ```dotenv
   PORT=3000
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/study_resource_platform?schema=public"
   ```

   Replace `USER` and `PASSWORD` with your local PostgreSQL credentials. Do not
   commit `.env`; it contains local credentials.

3. Create an empty PostgreSQL database named in `DATABASE_URL`. For a new
   database, generate the client and apply the initial migration:

   ```sh
   npm run db:generate
   npm run db:migrate -- --name init
   ```

   If the database already has the tables from `schema.sql`, do not run the
   initial migration against it as if it were empty. Mark the baseline migration
   as applied instead, after checking its SQL against the existing tables:

   ```sh
   npx prisma migrate resolve --applied 0_init
   ```

   The migration preserves the PostgreSQL `CHECK` constraints for user roles,
   resource types, and rating scores. Prisma does not represent these checks in
   its schema, so keep the SQL migration as the source of truth for them.

4. Seed local development data and start the development server:

   ```sh
   $env:SEED_USER_PASSWORD = "choose-a-throwaway-local-password"
   npx prisma db seed
   npm run dev
   ```

The seed command creates example courses and tags, plus
`seed.user@example.test`. Set `SEED_USER_PASSWORD` to a throwaway password
before seeding; it is stored as a bcrypt hash. Seeding is idempotent, and the
script refuses to run when `NODE_ENV=production`.

The Prisma client is generated into `server/generated/prisma` (outside
`node_modules`). The JavaScript API loads its generated TypeScript output with
`tsx`; the API itself remains JavaScript. Regenerate the client after changing
the Prisma schema.

## Server structure

- `src/server.js` connects to PostgreSQL, starts the HTTP server, and handles
  graceful shutdown.
- `src/app.js` configures Express middleware and mounts routes.
- `src/config/env.js` loads and validates environment variables.
- `src/db/prisma.js` creates the shared Prisma client and PostgreSQL pool.
- `src/routes/health.routes.js` implements `GET /health`.
- `src/middleware/` contains the 404 and error handlers.

The API listens on port `3000` by default (configurable with `PORT`). `GET
/health` checks the PostgreSQL connection and returns `{"status":"ok"}` when
the database is reachable.

## Prisma commands

- `npm run db:validate` validates the Prisma schema.
- `npm run db:push` synchronizes the Prisma models to the database.
- `npm run db:migrate` creates/applies a development migration.
- `npm run db:studio` opens Prisma Studio.
- `npm run db:migrate -- --name <name>` creates and applies a development
  migration. Review generated SQL in `prisma/migrations/` before applying
  changes to an existing database.
- `npx prisma db seed` runs the configured JavaScript seed script.

Do not commit `.env`; it contains local credentials. `bcrypt` is available for
hashing passwords before they are stored in the `users.password` column.
