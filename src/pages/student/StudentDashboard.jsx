import { useState } from "react";
import { Link } from "react-router-dom";
import { opportunities } from "./opportunities";
import { useStudentActivity } from "./StudentActivity";
import {
  GraduationCap,
  Search,
  Bookmark,
  BriefcaseBusiness,
  MapPin,
  Clock,
} from "lucide-react";
import { useStudentPreferences } from "./StudentPreferences";
import "./StudentDashboard.css";

export default function StudentDashboard({ section = "dashboard" }) {
  const { preferences, storage } = useStudentPreferences();
  if (!storage.ready && !storage.error)
    return <p role="status">Loading preferences…</p>;
  return (
    <StudentDashboardContent
      section={section}
      defaultType={preferences.opportunityType}
    />
  );
}

function StudentDashboardContent({ section, defaultType }) {
  const [filter, setFilter] = useState(defaultType);
  const [search, setSearch] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [activity, setActivity, storage] = useStudentActivity();
  const { savedIds, applications } = activity;

  function toggleSaved(opportunity) {
    if (!storage.ready) return;
    const wasSaved = savedIds.includes(opportunity.id);
    setActivity((current) => ({
      ...current,
      savedIds: current.savedIds.includes(opportunity.id)
        ? current.savedIds.filter((id) => id !== opportunity.id)
        : [...current.savedIds, opportunity.id],
    }));
    setAnnouncement(
      `${opportunity.title} ${wasSaved ? "removed from" : "added to"} saved opportunities. Check the saving status above.`,
    );
  }

  const visibleOpportunities = opportunities.filter((opportunity) => {
    const matchesSection =
      section !== "saved" || savedIds.includes(opportunity.id);
    const matchesType = filter === "All" || opportunity.type === filter;
    const searchableText = [
      opportunity.title,
      opportunity.company,
      ...opportunity.skills,
    ]
      .join(" ")
      .toLowerCase();
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
      <main className="sd-main">
        <div className="sd-preview">
          Demo opportunities · Saved items and applications stay in this
          browser.
          <span role="status"> {storage.status}</span>
          {storage.error && <p role="alert">{storage.error}</p>}
        </div>
        <header className="sd-header">
          <p className="sd-eyebrow">STUDENT SPACE</p>
          <h1>{title}</h1>
          <p>Discover work that fits your skills and college schedule.</p>
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
                <strong>{storage.ready ? savedIds.length : "…"}</strong>
              </article>
              <article>
                <span>Applications</span>
                <strong>{storage.ready ? applications.length : "…"}</strong>
              </article>
            </section>
            <section className="sd-welcome">
              <div>
                <h2>Let your projects speak for you</h2>
                <p>
                  Your student profile brings together your skills, education
                  and completed work.
                </p>
              </div>
              <GraduationCap size={60} aria-hidden="true" />
            </section>
          </>
        )}
        <section className="sd-opportunities" aria-busy={!storage.ready}>
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
            {(section === "saved" && !storage.ready
              ? []
              : visibleOpportunities
            ).map((opportunity) => {
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
                  <div className="sd-card-actions">
                    <Link
                      to={`/student/opportunities/${opportunity.id}`}
                      className="sd-details-link"
                    >
                      View Details
                    </Link>
                    <button
                      type="button"
                      className={`sd-save ${isSaved ? "is-saved" : ""}`}
                      disabled={!storage.ready}
                      aria-pressed={isSaved}
                      aria-label={`${isSaved ? "Unsave" : "Save"} ${opportunity.title}`}
                      title={
                        isSaved
                          ? "Remove from saved opportunities"
                          : "Save opportunity"
                      }
                      onClick={() => toggleSaved(opportunity)}
                    >
                      <Bookmark
                        size={20}
                        fill={isSaved ? "currentColor" : "none"}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  <p className="sd-save-caption">
                    {isSaved
                      ? "Saved to your list"
                      : "Bookmark to save for later"}
                  </p>
                </article>
              );
            })}
          </div>
          {storage.ready && visibleOpportunities.length === 0 && (
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
