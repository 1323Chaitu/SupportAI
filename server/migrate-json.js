
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../db.json");

const migrateData = async () => {
  const client = await pool.connect();

  try {
    console.log("Reading existing db.json...");

    const fileContent = fs.readFileSync(dbPath, "utf8");
    const jsonData = JSON.parse(fileContent);

    const collections = [
      "customers",
      "tickets",
      "articles",
      "conversations"
    ];

    await client.query("BEGIN");

    for (const table of collections) {
      const records = jsonData[table];

      if (!Array.isArray(records)) {
        throw new Error(`Invalid collection: ${table}`);
      }

      console.log(`Migrating ${table}: ${records.length} records`);

      for (const record of records) {
        if (record.id === undefined || record.id === null) {
          throw new Error(
            `Record in ${table} is missing an ID`
          );
        }

        await client.query(
          `INSERT INTO ${table} (record_id, data)
           VALUES ($1, $2::jsonb)
           ON CONFLICT (record_id) DO NOTHING`,
          [String(record.id), JSON.stringify(record)]
        );
      }
    }

    await client.query("COMMIT");

    console.log("\nMigration completed successfully!");
    console.log("All existing records have been processed.");

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Migration failed:", error.message);

  } finally {
    client.release();
    await pool.end();
  }
};

migrateData();
