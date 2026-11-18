
import express from "express";
import pool from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// GET all conversations
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT data FROM conversations ORDER BY id"
    );

    res.json(result.rows.map((row) => row.data));
  } catch (error) {
    console.error("Get conversations error:", error.message);
    res.status(500).json({
      message: "Unable to retrieve conversations"
    });
  }
});

// GET conversations for a particular customer
router.get("/customer/:name", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT data FROM conversations
       WHERE data->>'customer' = $1
       ORDER BY id`,
      [req.params.name]
    );

    res.json(result.rows.map((row) => row.data));
  } catch (error) {
    console.error("Customer conversations error:", error.message);
    res.status(500).json({
      message: "Unable to retrieve customer conversations"
    });
  }
});

// CREATE a conversation message
router.post("/", async (req, res) => {
  try {
    const { customer, message, status } = req.body;

    if (!customer || !message) {
      return res.status(400).json({
        message: "Customer and message are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO conversations (data)
       VALUES ($1::jsonb)
       RETURNING id`,
      [
        JSON.stringify({
          customer,
          sender: req.body.sender || "customer",
          message,
          status: status || "Open",
          timestamp: new Date().toISOString()
        })
      ]
    );

    const id = result.rows[0].id;

    const conversation = {
      id: String(id),
      customer,
      sender: req.body.sender || "customer",
      message,
      status: status || "Open",
      timestamp: new Date().toISOString()
    };

    await pool.query(
      `UPDATE conversations
       SET record_id = $1, data = $2::jsonb
       WHERE id = $3`,
      [String(id), JSON.stringify(conversation), id]
    );

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error.message);
    res.status(500).json({
      message: "Unable to create conversation"
    });
  }
});

// UPDATE a conversation
router.put("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE conversations
       SET data = data || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE record_id = $2
       RETURNING data`,
      [JSON.stringify(req.body), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Conversation not found"
      });
    }

    res.json(result.rows[0].data);
  } catch (error) {
    console.error("Update conversation error:", error.message);
    res.status(500).json({
      message: "Unable to update conversation"
    });
  }
});

// DELETE a conversation
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM conversations WHERE record_id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Conversation not found"
      });
    }

    res.json({
      message: "Conversation deleted successfully"
    });
  } catch (error) {
    console.error("Delete conversation error:", error.message);
    res.status(500).json({
      message: "Unable to delete conversation"
    });
  }
});

export default router;
