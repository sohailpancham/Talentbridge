import { useAuth } from "../../auth/AuthContext";
import LogoutButton from "../../auth/LogoutButton";
import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  UserRound,
  Palette,
  LockKeyhole,
  Eye,
  ShieldCheck,
  Bell,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import {
  startingPages,
  opportunityTypes,
  useStudentPreferences,
} from "./StudentPreferences";
import "./StudentSupport.css";
import "./StudentSettings.css";

const categories = [
  {
    id: "appearance",
    title: "Appearance",
    description: "Choose light or dark mode",
    icon: Palette,
  },
  {
    id: "account",
    title: "Account preferences",
    description: "Profile details and browsing preferences",
    icon: UserRound,
  },
  {
    id: "security",
    title: "Sign in & security",
    description: "Password, sign-in methods, and account access",
    icon: LockKeyhole,
  },
  {
    id: "visibility",
    title: "Visibility",
    description: "Your profile and what an application shares",
    icon: Eye,
  },
  {
    id: "privacy",
    title: "Data privacy",
    description: "Understand where your information is stored",
    icon: ShieldCheck,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Application updates and opportunity alerts",
    icon: Bell,
  },
];

export default function StudentSettings() {
  const { user } = useAuth();
  const { preferences, updatePreference, resetPreferences, storage } =
    useStudentPreferences();
  const [params] = useSearchParams();
  const category = categories.find((item) => item.id === params.get("section"));
  const heading = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, [category?.id]);

  return (
    <main className="student-support student-settings">
      {category && (
        <Link className="sl-button st-back" to="/student/settings">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to Settings
        </Link>
      )}
      <header className="ss-heading">
        <p className="ss-eyebrow">STUDENT SPACE</p>
        <h1 ref={heading} tabIndex={-1}>
          {category?.title || "Settings"}
        </h1>
        <p>
          {category
            ? category.description
            : "Manage your profile, preferences, and privacy."}
        </p>
      </header>

      {!category && (
        <>
          <nav className="st-category-list" aria-label="Settings categories">
            {categories.map(({ id, title, description, icon: Icon }) => (
              <div className="st-category" key={id}>
                <span className="st-icon">
                  <Icon size={26} aria-hidden="true" />
                </span>
                <div className="st-category-text">
                  <h2>{title}</h2>
                  <p>{description}</p>
                </div>
                <Link
                  className="sl-button st-open"
                  to={`/student/settings?section=${id}`}
                  aria-label={`Open ${title}`}
                >
                  Open <ChevronRight size={18} aria-hidden="true" />
                </Link>
              </div>
            ))}
          </nav>
          <footer className="st-footer">
            <Link className="sl-button" to="/student/help">
              Help &amp; Support
            </Link>
            <p>
              Demo version · Profiles save to your account; applications stay in
              this browser.
            </p>
          </footer>
        </>
      )}

      {category?.id === "account" && (
        <>
          <section className="ss-card">
            <h2>Profile information</h2>
            <p>
              Update your name, education, skills, projects, and profile photo.
            </p>
            <Link className="sl-button" to="/student/profile">
              Edit my profile
            </Link>
          </section>
          <section className="ss-card" aria-labelledby="ss-preferences-title">
            <h2 id="ss-preferences-title">Browsing preferences</h2>
            <p>Changes save automatically in this browser.</p>
            <fieldset disabled={!storage.ready}>
              <legend className="ss-visually-hidden">
                Choose your browsing preferences
              </legend>
              <label htmlFor="ss-start">Preferred starting page</label>
              <select
                id="ss-start"
                value={preferences.startingPage}
                aria-describedby="ss-start-help"
                onChange={(event) =>
                  updatePreference("startingPage", event.target.value)
                }
              >
                {startingPages.map((page) => (
                  <option key={page.value} value={page.value}>
                    {page.label}
                  </option>
                ))}
              </select>
              <p id="ss-start-help">
                Choose where “Open my starting page” takes you. Your sidebar
                links keep their usual destinations.
              </p>
              <label htmlFor="ss-type">Default opportunity type</label>
              <select
                id="ss-type"
                value={preferences.opportunityType}
                aria-describedby="ss-type-help"
                onChange={(event) =>
                  updatePreference("opportunityType", event.target.value)
                }
              >
                {opportunityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <p id="ss-type-help">
                Applied when you open Dashboard, Explore, or Saved
                Opportunities. You can change the filter on those pages at any
                time.
              </p>
              <div className="ss-actions">
                <button
                  className="sl-button"
                  type="button"
                  onClick={resetPreferences}
                >
                  Reset preferences
                </button>
                <Link className="sl-button" to="/student">
                  Open my starting page
                </Link>
              </div>
            </fieldset>
            <p role="status">{storage.status}</p>
            {storage.error && <p role="alert">{storage.error}</p>}
          </section>
        </>
      )}

      {category?.id === "appearance" && (
        <section className="ss-card">
          <h2>Colour mode</h2>
          <p>
            Choose how your student pages look. This preference saves for your
            account in this browser.
          </p>
          <fieldset disabled={!storage.ready} className="st-theme-options">
            <legend>Choose a theme</legend>
            {["light", "dark"].map((theme) => (
              <label key={theme} className="st-theme-choice">
                <input
                  type="radio"
                  name="theme"
                  value={theme}
                  checked={preferences.theme === theme}
                  onChange={() => updatePreference("theme", theme)}
                />
                {theme === "light" ? "Light mode" : "Dark mode"}
              </label>
            ))}
          </fieldset>
          <p role="status">{storage.status}</p>
          {storage.error && <p role="alert">{storage.error}</p>}
        </section>
      )}
      {category?.id === "security" && (
        <section className="ss-card">
          <span className="st-status">Signed in</span>
          <h2>Your account</h2>
          <p>
            {user.fullName} · {user.email}
          </p>
          <p>
            You are signed in using a server-managed session. Logout ends this
            session in this browser.
          </p>
          <LogoutButton />
          <h2>Password and account recovery</h2>
          <p>
            Password changes, password recovery, and two-step verification are
            not available yet.
          </p>
        </section>
      )}
      {category?.id === "visibility" && (
        <section className="ss-card">
          <h2>Profile visibility</h2>
          <p>
            Your saved profile is stored in your account. It is not published to
            companies or other students.
          </p>
          <h2>What your application includes</h2>
          <p>
            When applying, you choose whether to attach a copy of your profile.
            That copy includes your saved profile details and projects at the
            time of submission. It does not include your photo.
          </p>
          <p>
            Applications are saved locally in this demo and are not sent to
            companies. Public profile visibility controls are not available yet.
          </p>
          <Link className="sl-button" to="/student/applications">
            Review my applications
          </Link>
        </section>
      )}

      {category?.id === "privacy" && (
        <section className="ss-card">
          <h2>Where your information lives</h2>
          <p>
            Your signup details and password hash are stored in the server
            database. Your password is not saved in browser storage.
          </p>
          <p>
            Profile details and projects save to the database when you click
            Save Profile. Sign in to the same account on another browser
            connected to the same server to load them. Photos, saved
            opportunities, applications, and preferences remain in this browser,
            separated by account. You can import the browser profile draft for
            your account from My Profile. Older unassigned demo drafts are not
            automatically imported.
          </p>
          <p>
            Account separation in the app does not encrypt browser drafts. Use a
            private browser profile on shared devices.
          </p>
          <h2>Keeping your work</h2>
          <p>
            Click Save Profile before leaving the profile editor. Clearing
            browser data can remove photos, demo applications, saved
            opportunities, and preferences, but does not delete your database
            profile. Private browsing may remove browser-only work when the
            session ends.
          </p>
          <h2>Resetting preferences</h2>
          <p>
            The reset option under Account preferences restores only your
            browsing preferences and light mode. It keeps your profile, photos,
            saved opportunities, and applications.
          </p>
          <Link className="sl-button" to="/student/settings?section=account">
            Manage preferences
          </Link>
        </section>
      )}

      {category?.id === "notifications" && (
        <section className="ss-card">
          <span className="st-status">Not connected yet</span>
          <h2>Application updates and opportunity alerts</h2>
          <p>
            Email, push notifications, and company application updates are not
            connected in this demo. Notification preferences will become
            available with those services.
          </p>
          <p>You can review your saved demo applications at any time.</p>
          <Link className="sl-button" to="/student/applications">
            My Applications
          </Link>
        </section>
      )}
    </main>
  );
}
