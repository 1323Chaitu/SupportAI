
import express from "express";
import pool from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Require login for every ticket endpoint
router.use(authMiddleware);

// GET all tickets
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT data FROM tickets ORDER BY id"
    );

    res.json(result.rows.map((row) => row.data));
  } catch (error) {
    console.error("Get tickets error:", error.message);
    res.status(500).json({ message: "Unable to retrieve tickets" });
  }
});

// GET one ticket
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT data FROM tickets WHERE record_id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(result.rows[0].data);
  } catch (error) {
    console.error("Get ticket error:", error.message);
    res.status(500).json({ message: "Unable to retrieve ticket" });
  }
});

// CREATE a ticket
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const { customer, subject, priority, status } = req.body;

    if (!customer || !subject || !priority || !status) {
      return res.status(400).json({
        message: "Customer, subject, priority and status are required"
      });
    }

    await client.query("BEGIN");

    const result = await client.query(
      "INSERT INTO tickets (data) VALUES ($1::jsonb) RETURNING id",
      [JSON.stringify({ customer, subject, priority, status })]
    );

    const id = result.rows[0].id;
    const ticket = { id: String(id), customer, subject, priority, status };

    await client.query(
      "UPDATE tickets SET record_id = $1, data = $2::jsonb WHERE id = $3",
      [String(id), JSON.stringify(ticket), id]
    );

    await client.query("COMMIT");

    res.status(201).json(ticket);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create ticket error:", error.message);
    res.status(500).json({ message: "Unable to create ticket" });
  } finally {
    client.release();
  }
});

// REPLACE a ticket
router.put("/:id", async (req, res) => {
  try {
    const { customer, subject, priority, status } = req.body;

    if (!customer || !subject || !priority || !status) {
      return res.status(400).json({
        message: "Customer, subject, priority and status are required"
      });
    }

    const ticket = {
      id: req.params.id,
      customer,
      subject,
      priority,
      status
    };

    const result = await pool.query(
      "UPDATE tickets SET data = $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE record_id = $2 RETURNING data",
      [JSON.stringify(ticket), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(result.rows[0].data);
  } catch (error) {
    console.error("Update ticket error:", error.message);
    res.status(500).json({ message: "Unable to update ticket" });
  }
});

// PARTIALLY UPDATE a ticket
router.patch("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE tickets
       SET data = data || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE record_id = $2
       RETURNING data`,
      [JSON.stringify(req.body), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(result.rows[0].data);
  } catch (error) {
    console.error("Patch ticket error:", error.message);
    res.status(500).json({ message: "Unable to update ticket" });
  }
});

// DELETE a ticket
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM tickets WHERE record_id = $1 RETURNING data",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Delete ticket error:", error.message);
    res.status(500).json({ message: "Unable to delete ticket" });
  }
});

export default router;
