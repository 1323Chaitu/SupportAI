
import { useState, useEffect } from "react";
import {
  Users,
  Ticket,
  MessageSquare,
  CheckCircle
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [conversations, setConversations] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = sessionStorage.getItem("supportai_token");

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const responses = await Promise.all([
          fetch(`${API_URL}/api/customers`, { headers }),
          fetch(`${API_URL}/api/tickets`, { headers }),
          fetch(`${API_URL}/api/conversations`, { headers })
        ]);

        if (responses.some(response => !response.ok)) {
          throw new Error("Unable to load customer information.");
        }

        const [customerData, ticketData, chatData] =
          await Promise.all(
            responses.map(response => response.json())
          );

        setCustomers(customerData);
        setTickets(ticketData);
        setConversations(chatData);

      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const customerTickets = selectedCustomer
    ? tickets.filter(t =>
        t.customer?.toLowerCase() ===
        selectedCustomer.name.toLowerCase()
      )
    : [];

  const customerMessages = selectedCustomer
    ? conversations.filter(c =>
        c.customer?.toLowerCase() ===
        selectedCustomer.name.toLowerCase()
      )
    : [];

  const resolvedCount = customerTickets.filter(
    t => t.status === "Resolved"
  ).length;

  return (
    <div className="page-container">

      <div className="page-heading">
        <h2>Customers</h2>
        <p>Manage customers and view their interaction history.</p>
      </div>

      <div className="mini-card customer-total">
        <Users />
        <h3>{customers.length}</h3>
        <p>Total Registered Customers</p>
      </div>

      {loading ? (
        <p>Loading customers...</p>
      ) : error ? (
        <p className="login-error">{error}</p>
      ) : (
        <div className="customer-history-layout">

          {/* Customer Directory */}

          <div className="table-container">
            <h3>Customer Directory</h3>

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>

                    <td>
                      <button
                        className="edit-button"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                ))}

                {customers.length === 0 && (
                  <tr>
                    <td colSpan="4">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Customer History */}

          {selectedCustomer && (
            <div className="table-container customer-history">

              <div className="history-heading">
                <div>
                  <h3>{selectedCustomer.name}</h3>
                  <p>{selectedCustomer.email}</p>
                  <p>{selectedCustomer.phone}</p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Close
                </button>
              </div>

              <div className="history-stats">

                <div>
                  <Ticket />
                  <h3>{customerTickets.length}</h3>
                  <p>Total Tickets</p>
                </div>

                <div>
                  <CheckCircle />
                  <h3>{resolvedCount}</h3>
                  <p>Resolved Tickets</p>
                </div>

                <div>
                  <MessageSquare />
                  <h3>{customerMessages.length}</h3>
                  <p>Chat Messages</p>
                </div>

              </div>

              <h3>Previous Support Tickets</h3>

              {customerTickets.length === 0 ? (
                <p>No tickets found for this customer.</p>
              ) : (
                customerTickets.map(ticket => (
                  <div className="history-item" key={ticket.id}>
                    <strong>
                      #{ticket.id} - {ticket.subject}
                    </strong>
                    <p>Status: {ticket.status}</p>
                    <small>Priority: {ticket.priority}</small>
                  </div>
                ))
              )}

              <h3 className="history-chat-heading">
                Conversation History
              </h3>

              {customerMessages.length === 0 ? (
                <p>No conversations found for this customer.</p>
              ) : (
                customerMessages.map(message => (
                  <div className="history-item" key={message.id}>
                    <strong>{message.sender || "Customer"}</strong>
                    <p>{message.message}</p>
                  </div>
                ))
              )}

            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default Customers;
