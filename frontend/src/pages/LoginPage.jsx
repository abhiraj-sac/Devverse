import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { loginUser, saveAuthSession } from "../services/authApi";

const benefits = [
  "Keep your developer profile up to date",
  "Share posts and project milestones",
  "Discover builders in your tech stack",
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({
      loading: true,
      error: "",
      success: "",
    });

    try {
      const response = await loginUser(formData);
      saveAuthSession(response.data);
      setStatus({
        loading: false,
        error: "",
        success: "Login successful! Redirecting...",
      });

      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to log in.",
        success: "",
      });
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-intro">
          <button className="auth-brand auth-brand-button" onClick={() => navigate("/")} type="button">
            <span className="auth-brand-mark">D</span>
            <span>DevHub</span>
          </button>
          <h1>Pick up where your work left off.</h1>
          <p>
            Return to your posts, project updates, and community threads in a layout built for
            developers, not generic networking.
          </p>
          <ul className="auth-benefits">
            {benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="auth-card">
          <h2>Sign in</h2>
          <p>Stay visible to collaborators, hiring teams, and the communities you care about.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
            />

            <label htmlFor="password">Password</label>
            <div className="auth-password-row">
              <input
                id="password"
                name="password"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
              />
              <button
                className="auth-inline-action"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {status.error && <div className="form-message form-message-error">{status.error}</div>}
            {status.success && (
              <div className="form-message form-message-success">{status.success}</div>
            )}

            <button className="register-submit" type="submit" disabled={status.loading}>
              {status.loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="auth-meta">
            <NavLink className="auth-link" to="/register">
              New to DevHub? Join now
            </NavLink>
            <button className="auth-link-button" onClick={() => navigate("/")} type="button">
              Back to home
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
