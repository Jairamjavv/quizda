import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import express from "express";
import bodyParser from "body-parser";
const { json } = bodyParser;
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import quizRoutes from "./routes/quiz.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(json());

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

app.get("/health", (req, res) => res.json({ status: "healthy" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
