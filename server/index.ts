import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import express from "express";
import bodyParser from "body-parser";
const { json } = bodyParser;
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { logger } from "./logger.js";
import { connectRedis } from "./redis.js";

dotenv.config();

import authRoutes from "./routes/authV2.js";
import adminRoutes from "./routes/admin.js";
import quizRoutes from "./routes/quiz.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();

logger.info("Starting Quizda API server...", {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 4000,
});

// CORS configuration for production
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};

logger.info("CORS configured", { allowedOrigin: corsOptions.origin });

app.use(cors(corsOptions));
app.use(json());
app.use(cookieParser());

// Add request logging middleware
app.use((req, res, next) => logger.requestLogger(req, res, next));

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/quizzes", quizRoutes);
app.use("/dashboard", dashboardRoutes);

app.get("/", (req, res) =>
  res.json({
    status: "running",
    message: "Quizda API is running",
    environment: process.env.NODE_ENV || "development",
  })
);

app.get("/health", (req, res) => {
  logger.debug("Health check requested");
  res.json({ status: "healthy" });
});

// Initialize Redis connection
connectRedis().catch((error) => {
  logger.warn("Redis connection failed - continuing without token blacklist", {
    error: error.message,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`✅ Server successfully started`, {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
