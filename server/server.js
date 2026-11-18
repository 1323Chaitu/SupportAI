
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/customers.js";
import ticketRoutes from "./routes/tickets.js";
import conversationRoutes from "./routes/conversations.js";
import articleRoutes from "./routes/articles.js";

dotenv.config();

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean)
];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    }
  })
);

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/articles", articleRoutes);

// Backend health check
app.get("/", (req, res) => {
  res.json({
    message: "SupportAI backend is running"
  });
});

// PostgreSQL connection test
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS current_time"
    );

    res.json({
      message: "PostgreSQL connected successfully!",
      databaseTime: result.rows[0].current_time
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      message: "Database connection failed"
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SupportAI backend running on port ${PORT}`);
});
