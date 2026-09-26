import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  Search,
  BriefcaseBusiness,
  UserRound,
  Bookmark,
  Menu,
  ArrowLeft,
  Settings,
  CircleHelp,
} from "lucide-react";
import { StudentActivityProvider, useStudentActivity } from "./StudentActivity";
import { StudentPreferencesProvider } from "./StudentPreferences";
import "./StudentLayout.css";

function StudentShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activity, , storage] = useStudentActivity();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const navigation = [
    {
      path: "/student/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      path: "/student/explore",
      label: "Explore Opportunities",
      icon: Search,
    },
    {
      path: "/student/applications",
      label: "My Applications",
      icon: BriefcaseBusiness,
      count: activity.applications.length,
    },
    {
      path: "/student/profile",
      label: "My Profile",
      icon: UserRound,
    },
    {
      path: "/student/saved",
      label: "Saved Opportunities",
      icon: Bookmark,
      count: activity.savedIds.length,
    },
    { path: "/student/settings", label: "Settings", icon: Settings },
    { path: "/student/help", label: "Help & Support", icon: CircleHelp },
  ];

  return (
    <div className="student-layout">
      <a className="sl-skip" href="#student-content">
        Skip to content
      </a>

      <aside className="sl-sidebar">
        <div className="sl-brand-row">
          <Link to="/" className="sl-brand">
            <GraduationCap size={28} aria-hidden="true" />
            TalentBridge
          </Link>

          <button
            type="button"
            className="sl-menu-toggle sl-button"
            aria-expanded={menuOpen}
            aria-controls="student-navigation"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <Menu size={20} aria-hidden="true" />
            Menu
          </button>
        </div>

        <p className="sl-caption">STUDENT SPACE</p>

        <nav
          id="student-navigation"
          className={`sl-navigation ${menuOpen ? "is-open" : ""}`}
          aria-label="Student navigation"
        >
          {navigation.map(({ path, label, icon: Icon, count }) => (
            <NavLink
              key={path}
              to={path}
              end
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => {
                const exploring =
                  path === "/student/explore" &&
                  pathname.startsWith("/student/opportunities/");

                return `sl-button sl-nav-link ${isActive || exploring ? "is-active" : ""}`;
              }}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{label}</span>
              {count !== undefined && (
                <span className="sl-count">{storage.ready ? count : "…"}</span>
              )}
            </NavLink>
          ))}

          <Link to="/" className="sl-button sl-home">
            <ArrowLeft size={18} aria-hidden="true" />
            Home
          </Link>
        </nav>
      </aside>

      <div className="sl-content" id="student-content" tabIndex={-1}>
        <Outlet />
      </div>
    </div>
  );
}

export default function StudentLayout() {
  return (
    <StudentActivityProvider>
      <StudentPreferencesProvider>
        <StudentShell />
      </StudentPreferencesProvider>
    </StudentActivityProvider>
  );
}
