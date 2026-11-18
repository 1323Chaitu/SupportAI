
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bot, Mail, Lock, Eye, EyeOff } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
    
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password
          })
        }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login failed.");
      return;
    }

    sessionStorage.setItem("supportai_token", data.token);
    sessionStorage.setItem(
      "supportai_user",
      JSON.stringify(data.user)
    );

    navigate("/", { replace: true });

      } catch (error) {
        console.error("Login error:", error);
        setError("Unable to connect to the backend.");
      } finally {
        setLoading(false);
      }
    };


  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <Bot size={38} />
          <h2>SupportAI</h2>
        </div>

        <h2>Welcome Back!</h2>

        <p className="login-description">
          Sign in to access your customer support dashboard.
        </p>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>

          <div className="login-input">
            <Mail size={19} />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>

          <div className="login-input">
            <Lock size={19} />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Create Account</Link>
        </p>

        <div className="login-footer">
          AI-Powered Customer Support Platform
        </div>
      </div>
    </div>
  );
}

export default Login;
