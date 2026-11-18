
import express from "express";
import pool from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all customer endpoints
router.use(authMiddleware);

// GET: Retrieve all customers
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT data FROM customers ORDER BY id"
    );

    res.json(result.rows.map(row => row.data));

  } catch (error) {
    console.error("Fetch customers:", error.message);
    res.status(500).json({
      message: "Unable to retrieve customers."
    });
  }
});

// GET: Retrieve one customer
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT data FROM customers WHERE record_id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found."
      });
    }

    res.json(result.rows[0].data);

  } catch (error) {
    console.error("Fetch customer:", error.message);
    res.status(500).json({
      message: "Unable to retrieve customer."
    });
  }
});

// POST: Add a new customer
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        message: "Name, email and phone are required."
      });
    }

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO customers (data)
       VALUES ($1::jsonb)
       RETURNING id`,
      [JSON.stringify({ name, email, phone })]
    );

    const id = result.rows[0].id;

    const customer = { id, name, email, phone };

    await client.query(
      `UPDATE customers
       SET record_id = $1, data = $2::jsonb
       WHERE id = $3`,
      [String(id), JSON.stringify(customer), id]
    );

    await client.query("COMMIT");

    res.status(201).json(customer);

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create customer:", error.message);

    res.status(500).json({
      message: "Unable to create customer."
    });

  } finally {
    client.release();
  }
});

// PUT: Replace customer details
router.put("/:id", async (req, res) => {
  try {
    const existing = await pool.query(
      "SELECT data FROM customers WHERE record_id = $1",
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found."
      });
    }

    const customer = {
      ...req.body,
      id: existing.rows[0].data.id
    };

    const result = await pool.query(
      `UPDATE customers
       SET data = $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE record_id = $2
       RETURNING data`,
      [JSON.stringify(customer), req.params.id]
    );

    res.json(result.rows[0].data);

  } catch (error) {
    console.error("Update customer:", error.message);
    res.status(500).json({
      message: "Unable to update customer."
    });
  }
});

// PATCH: Update selected customer fields
router.patch("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE customers
       SET data = data || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE record_id = $2
       RETURNING data`,
      [JSON.stringify(req.body), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found."
      });
    }

    res.json(result.rows[0].data);

  } catch (error) {
    console.error("Patch customer:", error.message);
    res.status(500).json({
      message: "Unable to update customer."
    });
  }
});

// DELETE: Remove a customer
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM customers WHERE record_id = $1 RETURNING data",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found."
      });
    }

    res.json({
      message: "Customer deleted successfully.",
      customer: result.rows[0].data
    });

  } catch (error) {
    console.error("Delete customer:", error.message);
    res.status(500).json({
      message: "Unable to delete customer."
    });
  }
});

export default router;
