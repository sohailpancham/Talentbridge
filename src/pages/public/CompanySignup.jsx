import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Eye, EyeOff } from "lucide-react";

export default function CompanySignup() {
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
      "Form checked successfully. This preview does not create an account yet."
    );
  }

  return (
    <main className="login-page signup-page company-signup">
      <Link to="/" className="back-link">
        Home
      </Link>

      <section className="login-card signup-card">
        <Link to="/" className="login-brand">
          <Building2 size={34} aria-hidden="true" />
          TalentBridge
        </Link>

        <p className="login-tagline">
          Where Student Talent Meets Opportunity
        </p>

        <h1>Create Your Company Account</h1>
        <p className="login-subtitle">
          Find student talent for your next opportunity.
        </p>

        <form onSubmit={handleSubmit} onChange={() => setMessage("")}>
          <div className="signup-grid">
            <div>
              <label htmlFor="company-recruiter">Recruiter name</label>
              <input
                id="company-recruiter"
                name="recruiter"
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label htmlFor="company-name">Company name</label>
              <input
                id="company-name"
                name="companyName"
                type="text"
                placeholder="Your company name"
                autoComplete="organization"
                required
              />
            </div>

            <div>
              <label htmlFor="company-email">Work email</label>
              <input
                id="company-email"
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="company-phone">
                Mobile number (optional)
              </label>
              <input
                id="company-phone"
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
              <label htmlFor="company-industry">Industry</label>
              <select
                id="company-industry"
                name="industry"
                defaultValue=""
                required
              >
                <option value="" disabled>Select industry</option>
                <option value="technology">IT / Technology</option>
                <option value="marketing">Marketing / Advertising</option>
                <option value="education">Education</option>
                <option value="retail">Retail / E-commerce</option>
                <option value="hospitality">Hospitality / Tourism</option>
                <option value="finance">Finance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="company-website">
                Website (optional)
              </label>
              <input
                id="company-website"
                name="website"
                type="url"
                placeholder="https://example.com"
                autoComplete="url"
              />
            </div>

            <div>
              <label htmlFor="company-password">Password</label>
              <div className="password-field">
                <input
                  id="company-password"
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
              <label htmlFor="company-confirm">Confirm password</label>
              <input
                id="company-confirm"
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
            Create Company Account
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