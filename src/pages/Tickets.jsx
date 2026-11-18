
import { useState, useEffect } from "react";
import {
  Ticket,
  Clock,
  CheckCircle,
  Plus,
  Trash2
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = `${API_URL}/api/tickets`;

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newTicket, setNewTicket] = useState({
    customer: "",
    subject: "",
    priority: "Medium",
    status: "Open"
  });

  // Get JWT authentication headers
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionStorage.getItem("supportai_token")}`
  });

  // READ: Fetch tickets
  const fetchTickets = async () => {
    try {
      const response = await fetch(API, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      setTickets(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // CREATE: Add new ticket
  const addTicket = async (e) => {
    e.preventDefault();

    if (!newTicket.customer.trim() || !newTicket.subject.trim()) {
      alert("Please enter customer name and subject");
      return;
    }

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(newTicket)
      });

      if (!response.ok) {
        throw new Error("Unable to add ticket");
      }

      const savedTicket = await response.json();

      setTickets((previous) => [...previous, savedTicket]);

      setNewTicket({
        customer: "",
        subject: "",
        priority: "Medium",
        status: "Open"
      });

      alert("Ticket created successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  // UPDATE: Change ticket status
  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error("Unable to update ticket");
      }

      const updatedTicket = await response.json();

      setTickets((previous) =>
        previous.map((ticket) =>
          String(ticket.id) === String(id)
            ? updatedTicket
            : ticket
        )
      );
    } catch (error) {
      alert(error.message);
    }
  };

  // DELETE: Remove ticket
  const deleteTicket = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error("Unable to delete ticket");
      }

      setTickets((previous) =>
        previous.filter(
          (ticket) => String(ticket.id) !== String(id)
        )
      );

      alert("Ticket deleted successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  const openCount = tickets.filter(
    (t) => t.status === "Open"
  ).length;

  const pendingCount = tickets.filter(
    (t) => t.status === "Pending"
  ).length;

  const resolvedCount = tickets.filter(
    (t) => t.status === "Resolved"
  ).length;

  return (
    <div className="page-container">

      <div className="page-heading">
        <h2>Support Tickets</h2>
        <p>Manage and track customer support requests.</p>
      </div>

      {/* Ticket Statistics */}

      <div className="mini-stats">

        <div className="mini-card">
          <Ticket />
          <h3>{tickets.length}</h3>
          <p>Total Tickets</p>
        </div>

        <div className="mini-card">
          <Clock />
          <h3>{openCount + pendingCount}</h3>
          <p>Active Tickets</p>
        </div>

        <div className="mini-card">
          <CheckCircle />
          <h3>{resolvedCount}</h3>
          <p>Resolved Tickets</p>
        </div>

      </div>

      {/* Add Ticket Form */}

      <div className="table-container ticket-form">

        <h3>Create New Ticket</h3>

        <form onSubmit={addTicket} className="ticket-input-form">

          <input
            type="text"
            placeholder="Customer name"
            value={newTicket.customer}
            onChange={(e) =>
              setNewTicket({
                ...newTicket,
                customer: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Ticket subject"
            value={newTicket.subject}
            onChange={(e) =>
              setNewTicket({
                ...newTicket,
                subject: e.target.value
              })
            }
          />

          <select
            value={newTicket.priority}
            onChange={(e) =>
              setNewTicket({
                ...newTicket,
                priority: e.target.value
              })
            }
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <button type="submit" className="primary-button">
            <Plus size={18} /> Add Ticket
          </button>

        </form>

      </div>

      {/* Tickets Table */}

      <div className="table-container">

        <h3>All Support Tickets</h3>

        {loading ? (
          <p>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p>No tickets found.</p>
        ) : (

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {tickets.map((ticket) => (

                <tr key={ticket.id}>

                  <td>#{ticket.id}</td>
                  <td>{ticket.customer}</td>
                  <td>{ticket.subject}</td>

                  <td>
                    <span
                      className={`priority ${ticket.priority.toLowerCase()}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>

                  <td>
                    <select
                      className="status-select"
                      value={ticket.status}
                      onChange={(e) =>
                        updateStatus(ticket.id, e.target.value)
                      }
                    >
                      <option>Open</option>
                      <option>Pending</option>
                      <option>Resolved</option>
                    </select>
                  </td>

                  <td>
                    <button
                      className="delete-button"
                      onClick={() => deleteTicket(ticket.id)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>
          </table>

        )}

      </div>

    </div>
  );
}

export default Tickets;
