import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
// import { loginUser, saveAuthSession } from "../services/authApi";
import {
    loginUser,
    verifyOTP,
    saveAuthSession,
} from "../services/authApi";
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
    otp: "",
  });

  const [otpStep, setOtpStep] = useState(false);

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
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      setOtpStep(true);

      setStatus({
        loading: false,
        error: "",
        success: response.message,
      });

    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Failed to login.",
        success: "",
      });
    }
  };

  // Backend verify api next step me connect karenge
const handleVerifyOTP = async (event) => {
    event.preventDefault();

    setStatus({
        loading: true,
        error: "",
        success: "",
    });

    try {
        const response = await verifyOTP({
            email: formData.email,
            otp: formData.otp,
        });

        saveAuthSession(response.data);

        setStatus({
            loading: false,
            error: "",
            success: "Login successful!",
        });

        setTimeout(() => {
            navigate("/");
        }, 800);

    } catch (error) {
        setStatus({
            loading: false,
            error: error.message || "OTP verification failed",
            success: "",
        });
    }
};

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-intro">
          <button
            className="auth-brand auth-brand-button"
            onClick={() => navigate("/")}
            type="button"
          >
            <span className="auth-brand-mark">D</span>
            <span>DevHub</span>
          </button>

          <h1>Pick up where your work left off.</h1>

          <p>
            Return to your posts, project updates, and community threads in a
            layout built for developers.
          </p>

          <ul className="auth-benefits">
            {benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="auth-card">
          <h2>Sign in</h2>

          <p>
            Stay visible to collaborators, hiring teams, and the communities
            you care about.
          </p>

          <form
            className="auth-form"
            onSubmit={otpStep ? handleVerifyOTP : handleSubmit}
          >
            <label>Email</label>

            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              disabled={otpStep}
            />

            <label>Password</label>

            <div className="auth-password-row">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                disabled={otpStep}
              />

              <button
                type="button"
                className="auth-inline-action"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {otpStep && (
              <>
                <label>OTP</label>

                <input
                  name="otp"
                  type="text"
                  maxLength={6}
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            {status.error && (
              <div className="form-message form-message-error">
                {status.error}
              </div>
            )}

            {status.success && (
              <div className="form-message form-message-success">
                {status.success}
              </div>
            )}

            <button
              className="register-submit"
              type="submit"
              disabled={status.loading}
            >
              {status.loading
                ? "Please wait..."
                : otpStep
                ? "Verify OTP"
                : "Sign In"}
            </button>
          </form>

          <div className="auth-meta">
            <NavLink className="auth-link" to="/register">
              New to DevHub? Join now
            </NavLink>

            <button
              className="auth-link-button"
              onClick={() => navigate("/")}
              type="button"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}