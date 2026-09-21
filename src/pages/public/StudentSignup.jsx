import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";

export default function StudentSignup() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    if (data.get("password") !== data.get("confirmPassword")) {
      setMessage("Your passwords do not match.");
      form.elements.namedItem("confirmPassword").focus();
      return;
    }

    setMessage(
      "Your details passed validation. Account creation will be available once the backend is connected. Nothing has been saved yet."
    );
  }

  return (
    <main className="login-page signup-page">
      <Link to="/" className="back-link">
        Home
      </Link>

      <section className="login-card signup-card">
        <Link to="/" className="login-brand">
          <GraduationCap size={34} aria-hidden="true" />
          TalentBridge
        </Link>

        <p className="login-tagline">
          Where Student Talent Meets Opportunity
        </p>

        <h1>Create Your Student Account</h1>
        <p className="login-subtitle">
          Show your talent. Find your next opportunity.
        </p>

        <form
          onSubmit={handleSubmit}
          onChange={() => setMessage("")}
        >
          <div className="signup-grid">
            <div>
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                name="fullName"
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="signup-phone">
                Mobile number (optional)
              </label>
              <input
                id="signup-phone"
                name="phone"
                type="tel"
                placeholder="10-digit mobile number"
                autoComplete="tel-national"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                title="Enter a 10-digit mobile number without +91."
              />
            </div>

            <div>
              <label htmlFor="signup-college">
                College / University
              </label>
              <input
                id="signup-college"
                name="college"
                type="text"
                placeholder="Your college name"
                required
              />
            </div>

            <div>
              <label htmlFor="signup-course">Course / Branch</label>
              <input
                id="signup-course"
                name="course"
                type="text"
                placeholder="e.g. BCA, B.Com, B.Tech"
                required
              />
            </div>

            <div>
              <label htmlFor="signup-year">Current year</label>
              <select
                id="signup-year"
                name="year"
                defaultValue=""
                required
              >
                <option value="" disabled>Select your year</option>
                <option value="1">First year</option>
                <option value="2">Second year</option>
                <option value="3">Third year</option>
                <option value="4">Fourth year</option>
                <option value="5+">Fifth year or above</option>
              </select>
            </div>

            <div>
              <label htmlFor="signup-password">Password</label>
              <div className="password-field">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 12 characters"
                  autoComplete="new-password"
                  minLength={12}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide passwords" : "Show passwords"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="signup-confirm">Confirm password</label>
              <input
                id="signup-confirm"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password again"
                autoComplete="new-password"
                minLength={12}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-submit">
            Create Student Account
          </button>

          <p className="login-message" role="status">
            {message}
          </p>
        </form>

        <p className="signup-login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}