
import { Search, Bell, UserCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const storedUser = sessionStorage.getItem("supportai_user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const handleLogout = () => {
    sessionStorage.removeItem("supportai_token");
    sessionStorage.removeItem("supportai_user");

    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <div>
        <h3>Customer Support Dashboard</h3>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      <div className="navbar-right">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Search..." />
        </div>

        <Bell size={21} className="notification-icon" />

        <div className="profile">
          <UserCircle size={32} />

          <div>
            <strong>{user?.name || "User"}</strong>
            <small>{user?.email || "Registered User"}</small>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
