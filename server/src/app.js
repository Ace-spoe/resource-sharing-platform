const express = require("express");
const cors = require("cors")
const { clientUrl } = require('./config/env') 
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const healthRoutes = require("./routes/health.routes");
const courseRoutes = require("./routes/course.routes");
const authRoutes = require("./routes/auth.routes");


const app = express();

app.disable("x-powered-by");
app.use(cors({
  origin: clientUrl 
}))
app.use(express.json({ limit: "1mb" }));
app.use("/health", healthRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/auth", authRoutes)
app.use(notFound);
app.use(errorHandler);

module.exports = { app };
