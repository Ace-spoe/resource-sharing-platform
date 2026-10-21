const { prisma } = require("../db/prisma");

const getUserData = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    omit: { password: true },
  });
};

module.exports = { getUserData };