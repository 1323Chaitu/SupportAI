
import { useState, useEffect } from "react";
import { BookOpen, Plus, Trash2, Pencil } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = `${API_URL}/api/articles`;

function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    category: "",
    content: ""
  });

  // JWT authentication headers
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("supportai_token")}`
  });

  // READ
  const fetchArticles = async () => {
    try {
      const response = await fetch(API, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error("Failed to load articles");
      }

      const data = await response.json();
      setArticles(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // CREATE AND UPDATE
  const saveArticle = async (e) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !form.content.trim()
    ) {
      alert("Please enter article title, category and content");
      return;
    }

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API}/${editingId}` : API,
        {
          method: isEditing ? "PUT" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(form)
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save article");
      }

      const savedArticle = await response.json();

      if (isEditing) {
        setArticles((previous) =>
          previous.map((article) =>
            String(article.id) === String(editingId)
              ? savedArticle
              : article
          )
        );
      } else {
        setArticles((previous) => [...previous, savedArticle]);
      }

      resetForm();

      alert(
        isEditing
          ? "Article updated successfully!"
          : "Article added successfully!"
      );
    } catch (error) {
      alert(error.message);
    }
  };

  // EDIT
  const editArticle = (article) => {
    setEditingId(article.id);

    setForm({
      title: article.title,
      category: article.category,
      content: article.content
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // DELETE
  const deleteArticle = async (id) => {
    if (!window.confirm("Delete this article?")) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error("Unable to delete article");
      }

      setArticles((previous) =>
        previous.filter(
          (article) => String(article.id) !== String(id)
        )
      );

      if (String(editingId) === String(id)) {
        resetForm();
      }

      alert("Article deleted successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  // RESET FORM
  const resetForm = () => {
    setForm({
      title: "",
      category: "",
      content: ""
    });

    setEditingId(null);
  };

  return (
    <div className="page-container">

      <div className="page-heading">
        <h2>Knowledge Base</h2>
        <p>Manage articles and information for customer support.</p>
      </div>

      {/* Article Form */}

      <div className="table-container article-form">

        <h3>
          {editingId !== null ? "Edit Article" : "Add New Article"}
        </h3>

        <form onSubmit={saveArticle}>

          <input
            type="text"
            placeholder="Article title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Category (Account, Orders, Payments...)"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          />

          <textarea
            placeholder="Enter article content..."
            rows="4"
            value={form.content}
            onChange={(e) =>
              setForm({ ...form, content: e.target.value })
            }
          />

          <div className="form-actions">

            <button type="submit" className="primary-button">
              <Plus size={18} />
              {editingId !== null ? "Update Article" : "Add Article"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

      {/* Articles List */}

      <div className="article-grid">

        {loading ? (
          <p>Loading articles...</p>
        ) : articles.map((article) => (

          <div className="article-card" key={article.id}>

            <BookOpen size={25} />

            <h3>{article.title}</h3>

            <span>{article.category || "General"}</span>

            <p className="article-content">
              {article.content}
            </p>

            <div className="article-actions">

              <button
                className="edit-button"
                onClick={() => editArticle(article)}
              >
                <Pencil size={16} /> Edit
              </button>

              <button
                className="delete-button"
                onClick={() => deleteArticle(article.id)}
              >
                <Trash2 size={16} /> Delete
              </button>

            </div>

          </div>

        ))}

      </div>

      {!loading && articles.length === 0 && (
        <p>No knowledge-base articles available.</p>
      )}

    </div>
  );
}

export default KnowledgeBase;
