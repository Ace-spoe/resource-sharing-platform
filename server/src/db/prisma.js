const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../../generated/prisma/client.ts");
const { Pool } = require("pg");
const { databaseUrl } = require("../config/env");

const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
});

const adapter = new PrismaPg(pool, { disposeExternalPool: true });
const prisma = new PrismaClient({ adapter });

module.exports = { prisma };
