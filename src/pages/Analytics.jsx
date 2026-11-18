
import { useState, useEffect } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import {
  Ticket,
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Analytics() {
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = sessionStorage.getItem("supportai_token");

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const responses = await Promise.all([
          fetch(`${API_URL}/api/tickets`, { headers }),
          fetch(`${API_URL}/api/customers`, { headers }),
          fetch(`${API_URL}/api/conversations`, { headers })
        ]);

        if (responses.some(response => !response.ok)) {
          throw new Error("Unable to load analytics data");
        }

        const [ticketData, customerData, chatData] =
          await Promise.all(
            responses.map(response => response.json())
          );

        setTickets(ticketData);
        setCustomers(customerData);
        setConversations(chatData);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Calculate ticket statistics

  const openTickets = tickets.filter(
    t => t.status === "Open"
  ).length;

  const pendingTickets = tickets.filter(
    t => t.status === "Pending"
  ).length;

  const resolvedTickets = tickets.filter(
    t => t.status === "Resolved"
  ).length;

  const resolutionRate = tickets.length
    ? Math.round((resolvedTickets / tickets.length) * 100)
    : 0;

  // Ticket status chart

  const statusData = [
    { name: "Open", value: openTickets },
    { name: "Pending", value: pendingTickets },
    { name: "Resolved", value: resolvedTickets }
  ];

  // Priority chart

  const priorityData = [
    {
      name: "High",
      value: tickets.filter(t => t.priority === "High").length
    },
    {
      name: "Medium",
      value: tickets.filter(t => t.priority === "Medium").length
    },
    {
      name: "Low",
      value: tickets.filter(t => t.priority === "Low").length
    }
  ];

  const colors = ["#2563eb", "#f59e0b", "#16a34a"];

  // Statistics cards

  const stats = [
    {
      title: "Total Tickets",
      value: tickets.length,
      icon: Ticket
    },
    {
      title: "Total Customers",
      value: customers.length,
      icon: Users
    },
    {
      title: "Total Conversations",
      value: conversations.length,
      icon: MessageSquare
    },
    {
      title: "Resolved Tickets",
      value: resolvedTickets,
      icon: CheckCircle
    },
    {
      title: "Open Tickets",
      value: openTickets,
      icon: Clock
    },
    {
      title: "Resolution Rate",
      value: resolutionRate + "%",
      icon: TrendingUp
    }
  ];

  if (loading) {
    return <p>Loading analytics...</p>;
  }

  return (
    <div className="page-container">

      <div className="page-heading">
        <h2>Support Analytics</h2>
        <p>Analyze customer support performance and ticket statistics.</p>
      </div>

      {/* Statistics Cards */}

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

      {/* Charts */}

      <div className="analytics-grid">

        {/* Ticket Status Chart */}

        <div className="table-container chart-card">

          <h3>Ticket Status Distribution</h3>

          {tickets.length === 0 ? (
            <p>No ticket data available.</p>
          ) : (

            <ResponsiveContainer width="100%" height={280}>

              <BarChart data={statusData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          )}

        </div>

        {/* Priority Chart */}

        <div className="table-container chart-card">

          <h3>Ticket Priority Distribution</h3>

          {tickets.length === 0 ? (
            <p>No ticket data available.</p>
          ) : (

            <ResponsiveContainer width="100%" height={280}>

              <PieChart>

                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  label
                >

                  {priorityData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={colors[index]}
                    />
                  ))}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          )}

        </div>

      </div>

      {/* Performance Summary */}

      <div className="table-container analytics-summary">

        <h3>Performance Summary</h3>

        <div className="summary-row">
          <span>Total Support Tickets</span>
          <strong>{tickets.length}</strong>
        </div>

        <div className="summary-row">
          <span>Resolved Tickets</span>
          <strong>{resolvedTickets}</strong>
        </div>

        <div className="summary-row">
          <span>Pending Tickets</span>
          <strong>{pendingTickets}</strong>
        </div>

        <div className="summary-row">
          <span>Open Tickets</span>
          <strong>{openTickets}</strong>
        </div>

        <div className="summary-row">
          <span>Resolution Rate</span>
          <strong>{resolutionRate}%</strong>
        </div>

      </div>

    </div>
  );
}

export default Analytics;
