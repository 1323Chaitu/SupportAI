
import express from "express";
import pool from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// GET all articles
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT data FROM articles ORDER BY id"
    );

    res.json(result.rows.map((row) => row.data));
  } catch (error) {
    console.error("Get articles error:", error.message);
    res.status(500).json({
      message: "Unable to retrieve articles"
    });
  }
});

// GET one article
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT data FROM articles WHERE record_id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Article not found"
      });
    }

    res.json(result.rows[0].data);
  } catch (error) {
    console.error("Get article error:", error.message);
    res.status(500).json({
      message: "Unable to retrieve article"
    });
  }
});

// CREATE an article
router.post("/", async (req, res) => {
  try {
    const { title, category, content } = req.body;

    if (!title || !category || !content) {
      return res.status(400).json({
        message: "Title, category and content are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO articles (data)
       VALUES ($1::jsonb)
       RETURNING id`,
      [JSON.stringify({ title, category, content })]
    );

    const id = result.rows[0].id;

    const article = {
      id: String(id),
      title,
      category,
      content
    };

    await pool.query(
      `UPDATE articles
       SET record_id = $1, data = $2::jsonb
       WHERE id = $3`,
      [String(id), JSON.stringify(article), id]
    );

    res.status(201).json(article);
  } catch (error) {
    console.error("Create article error:", error.message);
    res.status(500).json({
      message: "Unable to create article"
    });
  }
});

// UPDATE an article
router.put("/:id", async (req, res) => {
  try {
    const { title, category, content } = req.body;

    if (!title || !category || !content) {
      return res.status(400).json({
        message: "Title, category and content are required"
      });
    }

    const article = {
      id: req.params.id,
      title,
      category,
      content
    };

    const result = await pool.query(
      `UPDATE articles
       SET data = $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE record_id = $2
       RETURNING data`,
      [JSON.stringify(article), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Article not found"
      });
    }

    res.json(result.rows[0].data);
  } catch (error) {
    console.error("Update article error:", error.message);
    res.status(500).json({
      message: "Unable to update article"
    });
  }
});

// DELETE an article
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM articles WHERE record_id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Article not found"
      });
    }

    res.json({
      message: "Article deleted successfully"
    });
  } catch (error) {
    console.error("Delete article error:", error.message);
    res.status(500).json({
      message: "Unable to delete article"
    });
  }
});

export default router;
