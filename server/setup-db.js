
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const createTables = async () => {
  try {
    console.log("Creating SupportAI database tables...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const collections = [
      "customers",
      "tickets",
      "articles",
      "conversations"
    ];

    for (const table of collections) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${table} (
          id BIGSERIAL PRIMARY KEY,
          record_id TEXT UNIQUE,
          data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    console.log("All five tables created successfully!");
  } catch (error) {
    console.error("Database table creation failed:", error.message);
  } finally {
    await pool.end();
  }
};

createTables();
