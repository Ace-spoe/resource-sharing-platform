const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prisma } = require("../db/prisma");
const { jwtSecret } = require("../config/env");

class AuthError extends Error {
  constructor(message = "Invalid email or password") {
    super(message);
    this.name = "AuthError";
    this.status = 401;
  }
}


const register = async (name, email, password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  const { password: _pw, ...safeUser } = newUser;
  return safeUser;
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AuthError();

  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) throw new AuthError();

  const token = jwt.sign(
    { id: user.id, role: user.role },
    jwtSecret,
    { expiresIn: "15m" }
  );

  const { password: _pw, ...safeUser } = user;
  return { token, user: safeUser };
};

module.exports = { register, login };