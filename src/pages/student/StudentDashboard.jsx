import { useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  Search,
  Bookmark,
  BriefcaseBusiness,
  MapPin,
  Clock,
  ArrowLeft,
} from "lucide-react";
import "./StudentDashboard.css";

const opportunities = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "Sample Tech Studio",
    type: "Internship",
    pay: "₹10,000 / month",
    location: "Remote",
    duration: "3 months",
    skills: ["HTML", "CSS", "React"],
  },
  {
    id: 2,
    title: "Business Website Design",
    company: "Sample Creative Agency",
    type: "Freelance",
    pay: "₹8,000 / project",
    location: "Remote",
    duration: "2 weeks",
    skills: ["Web Design", "JavaScript"],
  },
  {
    id: 3,
    title: "Social Media Assistant",
    company: "Sample Retail Company",
    type: "Part-time",
    pay: "₹6,000 / month",
    location: "Hybrid",
    duration: "2 months",
    skills: ["Canva", "Content Writing"],
  },
];

export default function StudentDashboard() {
  const [section, setSection] = useState("dashboard");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState([]);
  const [announcement, setAnnouncement] = useState("");

  function toggleSaved(opportunity) {
    const isSaved = savedIds.includes(opportunity.id);

    setSavedIds((current) =>
      isSaved
        ? current.filter((id) => id !== opportunity.id)
        : [...current, opportunity.id]
    );

    setAnnouncement(
      `${opportunity.title} ${isSaved ? "removed from" : "added to"} saved opportunities.`
    );
  }

  const visibleOpportunities = opportunities.filter((opportunity) => {
    const matchesSection =
      section !== "saved" || savedIds.includes(opportunity.id);

    const matchesType =
      filter === "All" || opportunity.type === filter;

    const searchableText = [
      opportunity.title,
      opportunity.company,
      ...opportunity.skills,
    ].join(" ").toLowerCase();

    return (
      matchesSection &&
      matchesType &&
      searchableText.includes(search.trim().toLowerCase())
    );
  });

  const title =
    section === "saved"
      ? "Saved Opportunities"
      : section === "explore"
        ? "Explore Opportunities"
        : "Your next opportunity starts here";

  return (
    <div className="student-dashboard">
      <aside className="sd-sidebar">
        <Link to="/" className="sd-brand">
          <GraduationCap size={28} aria-hidden="true" />
          TalentBridge
        </Link>

        <div className="sd-user">
          <div className="sd-avatar" aria-hidden="true">S</div>
          <strong>Student Preview</strong>
          <span>Your career journey starts here</span>
        </div>

        <nav className="sd-navigation" aria-label="Student dashboard">
            <Link to="/student/profile" className="sd-profile-link">
  <GraduationCap size={19} aria-hidden="true" />
  My Profile
</Link>
          <button
            type="button"
            className={section === "dashboard" ? "active" : ""}
            aria-pressed={section === "dashboard"}
            onClick={() => setSection("dashboard")}
          >
            <LayoutDashboard size={19} aria-hidden="true" />
            Dashboard
          </button>

          <button
            type="button"
            className={section === "explore" ? "active" : ""}
            aria-pressed={section === "explore"}
            onClick={() => setSection("explore")}
          >
            <Search size={19} aria-hidden="true" />
            Explore Opportunities
          </button>

          <button
            type="button"
            className={section === "saved" ? "active" : ""}
            aria-pressed={section === "saved"}
            onClick={() => setSection("saved")}
          >
            <Bookmark size={19} aria-hidden="true" />
            Saved Opportunities
            <span className="sd-count">{savedIds.length}</span>
          </button>
        </nav>

        <Link to="/" className="sd-home">
          <ArrowLeft size={18} aria-hidden="true" />
          Home
        </Link>
      </aside>

      <main className="sd-main">
        <div className="sd-preview">
          UI preview · Fictional opportunities · Saved items reset on refresh
        </div>

        <header className="sd-header">
          <div>
            <p className="sd-eyebrow">STUDENT SPACE</p>
            <h1>{title}</h1>
            <p>Discover work that fits your skills and college schedule.</p>
          </div>
        </header>

        {section === "dashboard" && (
          <>
            <section className="sd-stats" aria-label="Dashboard summary">
              <article>
                <span>Sample opportunities</span>
                <strong>{opportunities.length}</strong>
              </article>

              <article>
                <span>Saved opportunities</span>
                <strong>{savedIds.length}</strong>
              </article>

              <article>
                <span>Applications</span>
                <strong>0</strong>
              </article>
            </section>

            <section className="sd-welcome">
              <div>
                <h2>Let your projects speak for you</h2>
                <p>
                  Your student profile will bring together your skills,
                  education and completed work.
                </p>
              </div>
              <GraduationCap size={60} aria-hidden="true" />
            </section>
          </>
        )}

        <section className="sd-opportunities">
          <h2>
            {section === "saved" ? "Your saved list" : "Find an opportunity"}
          </h2>

          <label className="sd-search-label" htmlFor="sd-search">
            Search by title, company or skill
          </label>

          <div className="sd-search">
            <Search size={20} aria-hidden="true" />
            <input
              id="sd-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try React, design or content..."
            />
          </div>

          <div className="sd-filters" aria-label="Opportunity type">
            {["All", "Internship", "Freelance", "Part-time"].map((type) => (
              <button
                key={type}
                type="button"
                className={filter === type ? "active" : ""}
                aria-pressed={filter === type}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <p className="sd-announcement" role="status">
            {announcement}
          </p>

          <div className="sd-cards">
            {visibleOpportunities.map((opportunity) => {
              const isSaved = savedIds.includes(opportunity.id);

              return (
                <article className="sd-opportunity" key={opportunity.id}>
                  <div className="sd-card-top">
                    <div className="sd-job-icon">
                      <BriefcaseBusiness size={24} aria-hidden="true" />
                    </div>
                    <span className="sd-type">{opportunity.type}</span>
                  </div>

                  <h3>{opportunity.title}</h3>
                  <p className="sd-company">{opportunity.company}</p>
                  <strong className="sd-pay">{opportunity.pay}</strong>

                  <div className="sd-meta">
                    <span>
                      <MapPin size={15} aria-hidden="true" />
                      {opportunity.location}
                    </span>
                    <span>
                      <Clock size={15} aria-hidden="true" />
                      {opportunity.duration}
                    </span>
                  </div>

                  <div className="sd-skills">
                    {opportunity.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={`sd-save ${isSaved ? "is-saved" : ""}`}
                    aria-pressed={isSaved}
                    aria-label={`${isSaved ? "Unsave" : "Save"} ${opportunity.title}`}
                    onClick={() => toggleSaved(opportunity)}
                  >
                    <Bookmark
                      size={17}
                      fill={isSaved ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                    {isSaved ? "Saved" : "Save Opportunity"}
                  </button>
                </article>
              );
            })}
          </div>

          {visibleOpportunities.length === 0 && (
            <div className="sd-empty">
              <Bookmark size={32} aria-hidden="true" />
              <h3>No opportunities to show</h3>
              <p>
                {section === "saved" && savedIds.length === 0
                  ? "Save an opportunity from Explore to see it here."
                  : "Try another search or select a different filter."}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}