import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

export default function Login() {
  const { user, status, completeLogin } = useAuth();
  const navigate = useNavigate();
  const pending = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setMessage("");
    if (data.get("role") !== "student") {
      setMessage("Company login is not available yet.");
      return;
    }
    pending.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-TalentBridge-Request": "1",
        },
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
          role: "student",
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setMessage(result?.message || "Login failed. Please try again.");
        return;
      }
      if (!result?.user?.id || result.user.role !== "student") {
        setMessage("Unexpected server response. Please try again.");
        return;
      }
      form.elements.namedItem("password").value = "";
      setShowPassword(false);
      completeLogin(result.user);
      navigate("/student/dashboard", { replace: true });
    } catch {
      setMessage(
        "Could not reach the server. Check that the backend is running.",
      );
    } finally {
      pending.current = false;
      setIsSubmitting(false);
    }
  }

  if (status === "ready" && user?.role === "student") {
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <main className="login-page">
      <Link to="/" className="back-link">
        Home
      </Link>
      <section className="login-card">
        <Link to="/" className="login-brand">
          <GraduationCap size={34} aria-hidden="true" /> TalentBridge
        </Link>
        <p className="login-tagline">Where Student Talent Meets Opportunity</p>
        <h1>Welcome Back!</h1>
        <p className="login-subtitle">Login to your account</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="login-role">I am a</label>
          <select id="login-role" name="role" defaultValue="student">
            <option value="student">Student</option>
            <option value="company">Company</option>
          </select>
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="username"
            required
          />
          <label htmlFor="login-password">Password</label>
          <div className="password-field">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff size={20} aria-hidden="true" />
              ) : (
                <Eye size={20} aria-hidden="true" />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in…" : "Login"}
          </button>
          <p className="login-message" role="status">
            {message}
          </p>
        </form>
        <div className="signup-options">
          <p>New to TalentBridge? Create an account</p>
          <div className="signup-option-buttons">
            <Link to="/student/signup" className="signup-choice student-choice">
              Student Signup
            </Link>
            <Link to="/company/signup" className="signup-choice company-choice">
              Company Signup
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
