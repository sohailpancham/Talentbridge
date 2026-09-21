import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(
      "The login form is ready. Account sign-in will work after we connect the backend."
    );
  }

  return (
    <main className="login-page">
      <Link to="/" className="back-link">
  Home
</Link>

      <section className="login-card">
        <Link to="/" className="login-brand">
          <GraduationCap size={34} aria-hidden="true" />
          TalentBridge
        </Link>

        <p className="login-tagline">
          Where Student Talent Meets Opportunity
        </p>

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
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          <button type="submit" className="login-submit">
            Login
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