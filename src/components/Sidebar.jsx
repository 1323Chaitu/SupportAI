
import {
  LayoutDashboard,
  Ticket,
  Users,
  MessageSquare,
  MessagesSquare,
  BookOpen,
  BarChart3,
  Settings,
  Bot
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Tickets", path: "/tickets", icon: Ticket },
    { name: "Customers", path: "/customers", icon: Users },
    { name: "Live Chat", path: "/live-chat", icon: MessageSquare },
    { name: "Conversations", path: "/conversations", icon: MessagesSquare },
    { name: "Knowledge Base", path: "/knowledge-base", icon: BookOpen },
    { name: "Analytics", path: "/analytics", icon: BarChart3 }
  ];

  return (
    <aside className="sidebar">

      <div className="logo">
        <Bot size={28} />
        <h2>SupportAI</h2>
      </div>

      <p className="menu-title">MAIN MENU</p>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              to={item.path}
              key={item.name}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <Settings size={20} />
        <span>Settings</span>
      </div>

    </aside>
  );
}

export default Sidebar;
