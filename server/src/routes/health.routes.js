const express = require("express");
const { prisma } = require("../db/prisma");

const router = express.Router();

router.get("/", async (_request, response, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
