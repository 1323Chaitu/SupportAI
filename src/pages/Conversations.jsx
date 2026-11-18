
import { useState, useEffect } from "react";
import {
  MessageSquare,
  User,
  Bot,
  RefreshCw
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = `${API_URL}/api/conversations`;

function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // JWT authentication headers
  const getHeaders = () => ({
    Authorization: `Bearer ${sessionStorage.getItem("supportai_token")}`
  });

  // Fetch conversations from PostgreSQL
  const fetchConversations = async () => {
    setLoading(true);

    try {
      const response = await fetch(API, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error("Unable to load conversations");
      }

      const data = await response.json();

      setConversations(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Group messages by customer
  const groupedConversations = conversations.reduce(
    (groups, conversation) => {
      const name = conversation.customer || "Guest Customer";

      if (!groups[name]) {
        groups[name] = [];
      }

      groups[name].push(conversation);

      return groups;
    },
    {}
  );

  const customerNames = Object.keys(groupedConversations);

  const activeMessages = selectedCustomer
    ? groupedConversations[selectedCustomer] || []
    : [];

  return (
    <div className="page-container">

      <div className="page-heading">
        <h2>Conversation Monitoring</h2>
        <p>Monitor customer and chatbot interactions.</p>
      </div>

      <div className="conversation-layout">

        {/* Customer List */}

        <div className="conversation-list">

          <div className="conversation-list-header">
            <h3>Customers</h3>

            <button
              onClick={fetchConversations}
              disabled={loading}
              title="Refresh conversations"
            >
              <RefreshCw size={17} />
            </button>
          </div>

          {loading ? (
            <p>Loading conversations...</p>
          ) : customerNames.length === 0 ? (
            <p>No conversations available.</p>
          ) : (

            customerNames.map((name) => (

              <button
                key={name}
                className={`conversation-customer ${
                  selectedCustomer === name ? "selected" : ""
                }`}
                onClick={() => setSelectedCustomer(name)}
              >

                <User size={21} />

                <div>
                  <strong>{name}</strong>
                  <small>
                    {groupedConversations[name].length} messages
                  </small>
                </div>

              </button>

            ))

          )}

        </div>

        {/* Message History */}

        <div className="conversation-details">

          {!selectedCustomer ? (

            <div className="empty-conversation">
              <MessageSquare size={45} />
              <h3>Select a conversation</h3>
              <p>Choose a customer to view their chat history.</p>
            </div>

          ) : (

            <>

              <div className="conversation-details-header">
                <User size={24} />

                <div>
                  <strong>{selectedCustomer}</strong>
                  <p>Conversation History</p>
                </div>
              </div>

              <div className="conversation-history">

                {activeMessages.map((message) => (

                  <div
                    key={message.id}
                    className={`monitor-message ${
                      message.sender === "customer"
                        ? "customer-message"
                        : "bot-message"
                    }`}
                  >

                    {message.sender === "bot" ? (
                      <Bot size={18} />
                    ) : (
                      <User size={18} />
                    )}

                    <div className="monitor-message-content">

                      <small>
                        {message.sender === "bot"
                          ? "SupportAI Assistant"
                          : selectedCustomer}
                      </small>

                      <p>{message.message}</p>

                      {message.timestamp && (
                        <time>
                          {new Date(message.timestamp).toLocaleString()}
                        </time>
                      )}

                    </div>

                  </div>

                ))}

              </div>

            </>

          )}

        </div>

      </div>

    </div>
  );
}

export default Conversations;
