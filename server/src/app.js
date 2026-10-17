const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const healthRoutes = require("./routes/health.routes");

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use("/health", healthRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = { app };
