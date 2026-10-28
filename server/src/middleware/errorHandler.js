function errorHandler(error, _request, response, _next) {
  console.error(error);

  if (error.code === "P2002") {
    return response.status(409).json({ error: "Email already registered" });
  }

  const status = error.status ?? 500;
  const message = status === 500 ? "Internal server error" : error.message;

  return response.status(status).json({ error: message });
}

module.exports = errorHandler;