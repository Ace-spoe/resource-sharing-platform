require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma/client.ts");
const { Pool } = require("pg");

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to seed the database when NODE_ENV=production.");
}

const databaseUrl = process.env.DATABASE_URL;
const seedUserPassword = process.env.SEED_USER_PASSWORD;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Set it in server/.env.");
}

if (!seedUserPassword) {
  throw new Error(
    "SEED_USER_PASSWORD is required. Set a throwaway local development password.",
  );
}

const pool = new Pool({ connectionString: databaseUrl, max: 2 });
const adapter = new PrismaPg(pool, { disposeExternalPool: true });
const prisma = new PrismaClient({ adapter });

async function main() {
  const courses = [
    {
      code: "CSC101",
      title: "Introduction to Programming",
      department: "Computer Science",
    },
    {
      code: "MTH101",
      title: "Calculus I",
      department: "Mathematics",
    },
    {
      code: "PHY101",
      title: "General Physics I",
      department: "Physics",
    },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { code: course.code },
      update: { title: course.title, department: course.department },
      create: course,
    });
  }

  const tags = ["lecture notes", "past exam", "revision", "beginner"];

  for (const name of tags) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const passwordHash = await bcrypt.hash(seedUserPassword, 12);

  await prisma.user.upsert({
    where: { email: "seed.user@example.test" },
    update: { name: "Local Test User" },
    create: {
      name: "Local Test User",
      email: "seed.user@example.test",
      password: passwordHash,
    },
  });

  console.log("Seeded 3 courses, 4 tags, and seed.user@example.test.");
}

main()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
