
import { useState, useEffect } from "react";

import {
  Users,
  Ticket,
  Clock,
  CheckCircle,
  MessageSquare,
  TrendingUp
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = sessionStorage.getItem("supportai_token");

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [customerRes, ticketRes, chatRes] =
          await Promise.all([
            fetch(`${API_URL}/api/customers`, { headers }),
            fetch(`${API_URL}/api/tickets`, { headers }),
            fetch(`${API_URL}/api/conversations`, { headers })
          ]);

        if (!customerRes.ok || !ticketRes.ok || !chatRes.ok) {
          throw new Error("Unable to load dashboard data");
        }

        const [customerData, ticketData, chatData] =
          await Promise.all([
            customerRes.json(),
            ticketRes.json(),
            chatRes.json()
          ]);

        setCustomers(customerData);
        setTickets(ticketData);
        setConversations(chatData);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const openTickets = tickets.filter(
    ticket => ticket.status === "Open"
  ).length;

  const resolvedTickets = tickets.filter(
    ticket => ticket.status === "Resolved"
  ).length;

  const stats = [
    {
      title: "Total Customers",
      value: customers.length,
      icon: Users
    },
    {
      title: "Total Tickets",
      value: tickets.length,
      icon: Ticket
    },
    {
      title: "Open Tickets",
      value: openTickets,
      icon: Clock
    },
    {
      title: "Resolved Tickets",
      value: resolvedTickets,
      icon: CheckCircle
    },
    {
      title: "Total Messages",
      value: conversations.length,
      icon: MessageSquare
    },
    {
      title: "Resolution Rate",
      value: tickets.length
        ? Math.round((resolvedTickets / tickets.length) * 100) + "%"
        : "0%",
      icon: TrendingUp
    }
  ];

  const recentTickets = [...tickets].slice(-5).reverse();

  const recentConversations = [...conversations]
    .slice(-5)
    .reverse();

  return (
    <div className="page-container">

      <div className="page-heading">
        <h2>Agent Dashboard</h2>
        <p>Monitor customer support activities and performance.</p>
      </div>

      {loading ? (
        <p>Loading dashboard information...</p>
      ) : (

        <>

          {/* Statistics */}

          <div className="stats-grid">

            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div className="stat-card" key={item.title}>

                  <div className="stat-icon">
                    <Icon size={24} />
                  </div>

                  <div>
                    <p>{item.title}</p>
                    <h2>{item.value}</h2>
                  </div>

                </div>
              );
            })}

          </div>

          {/* Recent Tickets */}

          <div className="table-container dashboard-section">

            <h3>Recent Support Tickets</h3>

            {recentTickets.length === 0 ? (
              <p>No tickets available.</p>
            ) : (

              <table>

                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Customer</th>
                    <th>Subject</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {recentTickets.map((ticket) => (

                    <tr key={ticket.id}>

                      <td>#{ticket.id}</td>
                      <td>{ticket.customer}</td>
                      <td>{ticket.subject}</td>

                      <td>
                        <span className={`priority ${ticket.priority.toLowerCase()}`}>
                          {ticket.priority}
                        </span>
                      </td>

                      <td>
                        <span className={`status ${ticket.status.toLowerCase()}`}>
                          {ticket.status}
                        </span>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

          {/* Recent Conversations */}

          <div className="table-container dashboard-section">

            <h3>Recent Customer Conversations</h3>

            {recentConversations.length === 0 ? (
              <p>No conversations available.</p>
            ) : (

              <table>

                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Sender</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {recentConversations.map((chat) => (

                    <tr key={chat.id}>

                      <td>{chat.customer}</td>
                      <td>{chat.sender}</td>
                      <td>{chat.message}</td>
                      <td>{chat.status}</td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>

        </>

      )}

    </div>
  );
}

export default Dashboard;
