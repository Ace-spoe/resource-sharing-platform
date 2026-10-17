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

2. Create a local environment file from the example, then set `DATABASE_URL` to
   your PostgreSQL connection string:

   ```sh
   Copy-Item .env.example .env
   ```

3. Create the database named in `DATABASE_URL`. To create the tables from the
   existing SQL schema, run this from the `server` directory:

   ```sh
   psql "$env:DATABASE_URL" -f schema.sql
   ```

   Use `schema.sql` when initializing a database so its PostgreSQL `CHECK`
   constraints are applied. Prisma's model does not represent those checks;
   `npm run db:push` is available for rapid prototyping but will not create
   those constraints in a new database.

4. Generate the Prisma client and start the development server:

   ```sh
   npm run db:generate
   npm run dev
   ```

The Prisma client is generated into `server/generated/prisma` (outside
`node_modules`). The start and development scripts load its TypeScript output
with `tsx`; regenerate the client after changing the Prisma schema.

The API listens on port `3000` by default (configurable with `PORT`). `GET
/health` checks the PostgreSQL connection and returns `{"status":"ok"}` when
the database is reachable.

## Prisma commands

- `npm run db:validate` validates the Prisma schema.
- `npm run db:push` synchronizes the Prisma models to the database.
- `npm run db:migrate` creates/applies a development migration.
- `npm run db:studio` opens Prisma Studio.

Do not commit `.env`; it contains local credentials. `bcrypt` is available for
hashing passwords before they are stored in the `users.password` column.
