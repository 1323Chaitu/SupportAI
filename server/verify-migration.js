
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const verifyMigration = async () => {
  try {
    const tables = [
      "customers",
      "tickets",
      "articles",
      "conversations"
    ];

    console.log("SupportAI Migration Verification\n");

    for (const table of tables) {
      const result = await pool.query(
        `SELECT COUNT(*) AS total FROM ${table}`
      );

      console.log(
        `${table}: ${result.rows[0].total} records`
      );
    }

  } catch (error) {
    console.error("Verification failed:", error.message);

  } finally {
    await pool.end();
  }
};

verifyMigration();
