
import { useState, useEffect, useRef } from "react";
import { Bot, User, Send, Sparkles } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const CHAT_API = `${API_URL}/api/conversations`;
const ARTICLE_API = `${API_URL}/api/articles`;
const TICKET_API = `${API_URL}/api/tickets`;

function LiveChat() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! Welcome to SupportAI. I'm your virtual assistant. How can I help you today?"
    }
  ]);

  const [customer, setCustomer] = useState("Guest Customer");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // JWT authentication headers
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("supportai_token")}`
  });

  // Load previous conversation history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(CHAT_API, {
          headers: getHeaders()
        });

        if (!response.ok) {
          throw new Error("Unable to load chat history");
        }

        const data = await response.json();

        const history = data
          .filter(
            (item) =>
              item.customer === (customer.trim() || "Guest Customer")
          )
          .slice(-20)
          .map((item) => ({
            sender: item.sender,
            text: item.message
          }));

        if (history.length > 0) {
          setMessages([
            {
              sender: "bot",
              text: "Welcome back! How can I help you?"
            },
            ...history
          ]);
        } else {
          setMessages([
            {
              sender: "bot",
              text: "Hello! Welcome to SupportAI. I'm your virtual assistant. How can I help you today?"
            }
          ]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadHistory();
  }, [customer]);

  // Scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  // Save conversation to PostgreSQL
  const saveConversation = async (sender, message) => {
    const response = await fetch(CHAT_API, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        customer: customer.trim() || "Guest Customer",
        sender,
        message,
        status: "Open"
      })
    });

    if (!response.ok) {
      throw new Error("Failed to save conversation");
    }

    return response.json();
  };

  // Search the Knowledge Base
  const generateResponse = async (question) => {
    const normalizedQuestion = question.toLowerCase().trim();

    if (/^(hi|hello|hey|good morning|good evening)[!. ]*$/.test(normalizedQuestion)) {
      return {
        answer: "Hello! How can I assist you today?",
        found: true
      };
    }

    const response = await fetch(ARTICLE_API, {
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error("Unable to access Knowledge Base");
    }

    const articles = await response.json();

    const stopWords = [
      "the", "is", "a", "an", "to", "how", "do", "i",
      "my", "me", "can", "you", "your", "what", "for",
      "of", "and", "in", "on", "please", "help", "with"
    ];

    const keywords = normalizedQuestion
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(
        (word) => word.length > 2 && !stopWords.includes(word)
      );

    let bestArticle = null;
    let highestScore = 0;

    articles.forEach((article) => {
      const articleText = (
        article.title + " " +
        article.category + " " +
        article.content
      ).toLowerCase();

      const score = keywords.filter((word) =>
        articleText.includes(word)
      ).length;

      if (score > highestScore) {
        highestScore = score;
        bestArticle = article;
      }
    });

    if (bestArticle && highestScore >= 1) {
      return {
        answer: bestArticle.content,
        found: true
      };
    }

    return {
      answer: "I'm sorry, I couldn't find a suitable answer in our Knowledge Base. I've created a support ticket for our team to assist you. Our support team will review your question.",
      found: false
    };
  };

  // Automatically create support ticket
  const createTicket = async (question) => {
    const response = await fetch(TICKET_API, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        customer: customer.trim() || "Guest Customer",
        subject: "Unresolved chatbot query: " + question,
        priority: "Medium",
        status: "Open"
      })
    });

    if (!response.ok) {
      throw new Error("Unable to create support ticket");
    }

    return response.json();
  };

  // Send customer message
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const question = input.trim();

    const customerMessage = {
      sender: "customer",
      text: question
    };

    setMessages((previous) => [...previous, customerMessage]);
    setInput("");
    setLoading(true);

    try {
      await saveConversation("customer", question);

      const result = await generateResponse(question);

      if (!result.found) {
        await createTicket(question);
      }

      await saveConversation("bot", result.answer);

      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: result.answer
        }
      ]);
    } catch (error) {
      console.error(error);

      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: "Sorry, something went wrong. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">

      <div className="page-heading">
        <h2>AI Customer Support Chatbot</h2>
        <p>Ask questions and get automated support.</p>
      </div>

      <div className="chat-container">

        {/* Chat Header */}

        <div className="chat-header chatbot-header">

          <div className="bot-avatar">
            <Bot size={25} />
          </div>

          <div>
            <strong>SupportAI Assistant</strong>
            <p>
              <span className="online-dot"></span> Online
            </p>
          </div>

          <Sparkles className="chat-sparkle" />

        </div>

        {/* Customer Name */}

        <div className="customer-name-input">
          <label>Customer Name</label>

          <input
            type="text"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        {/* Chat Messages */}

        <div className="chat-messages chatbot-messages">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`chat-message ${
                msg.sender === "customer" ? "agent" : "customer"
              }`}
            >

              {msg.sender !== "customer" && <Bot size={20} />}

              <span>{msg.text}</span>

              {msg.sender === "customer" && <User size={20} />}

            </div>

          ))}

          {loading && (
            <div className="bot-typing">
              <Bot size={18} />
              SupportAI is thinking...
            </div>
          )}

          <div ref={chatEndRef}></div>

        </div>

        {/* Message Input */}

        <form className="chat-input" onSubmit={sendMessage}>

          <input
            type="text"
            placeholder="Ask something about your account, orders or payments..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />

          <button type="submit" disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>

        </form>

      </div>

    </div>
  );
}

export default LiveChat;
