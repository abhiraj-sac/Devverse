import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { registerUser, saveAuthSession } from "../services/authApi";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setStatus({
        loading: false,
        error: "Passwords do not match",
        success: "",
      });
      return;
    }

    if (!formData.terms) {
      setStatus({
        loading: false,
        error: "Please accept the terms to continue",
        success: "",
      });
      return;
    }

    setStatus({
      loading: true,
      error: "",
      success: "",
    });

    try {
      const response = await registerUser({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        bio: `${formData.fullName} joined DevHub.`,
      });

      saveAuthSession(response.data);
      setStatus({
        loading: false,
        error: "",
        success: "Account created! Redirecting...",
      });

      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to register.",
        success: "",
      });
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-shell auth-shell-wide">
        <div className="auth-intro">
          <button className="auth-brand auth-brand-button" onClick={() => navigate("/")} type="button">
            <span className="auth-brand-mark">D</span>
            <span>DevHub</span>
          </button>
          <h1>Build a profile that feels like a living body of work.</h1>
          <p>
            Set up your account once, then use it to publish progress, show projects, and connect
            with people who actually work in your stack.
          </p>
        </div>

        <div className="auth-card auth-card-wide">
          <h2>Join DevHub</h2>
          <p>Create your profile in a few steps.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              name="fullName"
              placeholder="Linus Torvalds"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
            />

            <div className="dual-fields">
              <div className="auth-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  placeholder="linus_t"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="dual-fields">
              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label className="check-row" htmlFor="terms">
              <input id="terms" name="terms" type="checkbox" checked={formData.terms} onChange={handleChange} />
              <span>
                I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
              </span>
            </label>

            {status.error && <div className="form-message form-message-error">{status.error}</div>}
            {status.success && (
              <div className="form-message form-message-success">{status.success}</div>
            )}

            <button className="register-submit" type="submit" disabled={status.loading}>
              {status.loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="auth-meta">
            <NavLink className="auth-link" to="/login">
              Already on DevHub? Sign in
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
