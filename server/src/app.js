const express = require("express");
const cors = require("cors")
const { clientUrl } = require('./config/env') 
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const healthRoutes = require("./routes/health.routes");
const courseRoutes = require("./routes/course.routes");
const authRoutes = require("./routes/auth.routes");
const userRouter = require("./routes/user.routes");


const app = express();

app.disable("x-powered-by");
console.log("CORS client URL is:", clientUrl);
app.use(cors({
  origin: clientUrl,
  credentials : true 
}))
app.use(express.json({ limit: "1mb" }));
app.use("/health", healthRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/auth", authRoutes)
app.use("/api/users", userRouter)
app.use(notFound);
app.use(errorHandler);


module.exports = { app };
