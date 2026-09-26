import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  UserRound,
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
            <p>Demo version · Your saved work stays in this browser.</p>
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

      {category?.id === "security" && (
        <section className="ss-card">
          <span className="st-status">Not connected yet</span>
          <h2>Protect your account</h2>
          <p>
            This demo does not have authenticated student accounts yet. Password
            changes, two-step verification, active sessions, and sign out will
            become available when sign-in is connected.
          </p>
          <p>
            Your current profile and applications are stored in this browser.
            Use your own browser profile on a shared device.
          </p>
        </section>
      )}

      {category?.id === "visibility" && (
        <section className="ss-card">
          <h2>Profile visibility</h2>
          <p>
            Your profile is currently a local preview. It is not published to
            companies or other students.
          </p>
          <h2>What your application includes</h2>
          <p>
            When applying, you choose whether to attach a copy of your profile.
            That copy includes your profile details and projects at the time of
            submission. It does not include your photo.
          </p>
          <p>
            Applications are saved locally in this demo and are not sent to
            companies. Public profile visibility controls will be added when
            accounts are connected.
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
            Your profile, photos, saved opportunities, applications, and
            preferences are saved in this browser when saving succeeds. They do
            not sync to another device.
          </p>
          <h2>Keeping your work</h2>
          <p>
            Wait for the saved status before closing a page. Clearing this
            site’s browser data can remove your work. Private browsing may
            remove it when the session ends.
          </p>
          <h2>Resetting preferences</h2>
          <p>
            The reset option under Account preferences restores only your
            browsing preferences. It keeps your profile, photos, saved
            opportunities, and applications.
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
