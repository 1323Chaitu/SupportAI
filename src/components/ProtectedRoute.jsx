
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem("supportai_token");

      if (!token) {
        setAuthenticated(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          sessionStorage.removeItem("supportai_token");
          sessionStorage.removeItem("supportai_user");
          setAuthenticated(false);
          return;
        }

        const data = await response.json();

        sessionStorage.setItem(
          "supportai_user",
          JSON.stringify(data.user)
        );

        setAuthenticated(true);

      } catch (error) {
        console.error("Authentication verification failed:", error);
        setAuthenticated(false);
      }
    };

    verifyToken();
  }, []);

  if (authenticated === null) {
    return <p style={{ padding: "30px" }}>Verifying authentication...</p>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
