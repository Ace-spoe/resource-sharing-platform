function errorHandler(error, _request, response, _next) {
  if(error.code === "P2002") {
    response.status(409).json({ error: "Email already registered" });
  }
  console.error(error);
  res.status(error.status ?? 500).json({ error: error.message ?? "Internal server error" });
}

module.exports = errorHandler;
