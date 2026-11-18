
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

app.use(cors({
  origin: process.env.CLIENT_URL
}));

app.use(express.json());

// Authentication routes
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
    console.error(error.message);

    res.status(500).json({
      message: "Database connection failed"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.get("/api/check-users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Unable to retrieve users"
    });
  }
});

app.listen(PORT, () => {
  console.log(`SupportAI backend running on port ${PORT}`);
});
