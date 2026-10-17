require("dotenv").config();

const express = require("express");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("./generated/prisma/client.ts");
const { Pool } = require("pg");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Set it in server/.env.");
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
});
const adapter = new PrismaPg(pool, { disposeExternalPool: true });
const prisma = new PrismaClient({ adapter });
const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_request, response, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

app.use((request, response) => {
  response.status(404).json({ error: "Not found" });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Internal server error" });
});

async function start() {
  await prisma.$connect();

  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  const shutdown = async () => {
    server.close(async (error) => {
      if (error) {
        console.error("Failed to close the HTTP server:", error);
        process.exitCode = 1;
      }

      await prisma.$disconnect();
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

start().catch(async (error) => {
  console.error("Failed to start the server:", error);
  await prisma.$disconnect();
  process.exitCode = 1;
});