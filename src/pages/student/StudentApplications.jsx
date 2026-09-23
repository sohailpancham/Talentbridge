import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { opportunities } from "./opportunities";
import { useStudentActivity } from "./StudentActivity";
import "./StudentApplications.css";

function PageLayout({ children }) {
  return (
    <main className="student-activity">
      <p className="sa-notice">
        Demo opportunities · Applications stay in this browser and are not sent
        to companies.
      </p>

      {children}
    </main>
  );
}

function StorageStatus({ storage }) {
  return (
    <>
      <p className="sa-muted" role="status">
        {storage.status}
      </p>
      {storage.error && <p role="alert">{storage.error}</p>}
    </>
  );
}
function readProfileAttachment() {
  const saved = JSON.parse(
    localStorage.getItem("talentbridge-student-profile-v1") || "null",
  );

  const profile = saved?.profile;

  if (
    !profile ||
    typeof profile.name !== "string" ||
    !profile.name.trim() ||
    typeof profile.skills !== "string" ||
    !profile.skills.split(",").some((skill) => skill.trim())
  ) {
    throw new Error(
      "Complete your name and skills in My Profile before attaching it.",
    );
  }

  const fields = [
    "name",
    "headline",
    "college",
    "course",
    "year",
    "location",
    "availability",
    "bio",
    "skills",
  ];

  return {
    profile: Object.fromEntries(
      fields.map((field) => [
        field,
        typeof profile[field] === "string" ? profile[field] : "",
      ]),
    ),
    projects: Array.isArray(saved.projects)
      ? saved.projects.map((project) => ({
          title: typeof project.title === "string" ? project.title : "",
          description:
            typeof project.description === "string" ? project.description : "",
        }))
      : [],
    attachedAt: new Date().toISOString(),
  };
}

export function OpportunityDetails({ applicationPage = false }) {
  const { id } = useParams();
  const opportunity = opportunities.find((item) => item.id === Number(id));

  const [activity, setActivity, storage] = useStudentActivity();
  const [introduction, setIntroduction] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [message, setMessage] = useState("");
  const [attachProfile, setAttachProfile] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMessage("");
  }, [id, applicationPage]);

  if (!opportunity) {
    return (
      <PageLayout>
        <h1>Opportunity not found</h1>
        <Link to="/student/dashboard">Return to opportunities</Link>
      </PageLayout>
    );
  }

  const application = activity.applications.find(
    (item) => item.opportunityId === opportunity.id,
  );
  const isSaved = activity.savedIds.includes(opportunity.id);

  function toggleSaved() {
    if (!storage.ready) return;
    setActivity((current) => ({
      ...current,
      savedIds: current.savedIds.includes(opportunity.id)
        ? current.savedIds.filter((savedId) => savedId !== opportunity.id)
        : [...current.savedIds, opportunity.id],
    }));
  }

  function apply(event) {
    event.preventDefault();
    if (!storage.ready || application) return;

    setMessage("");

    let profileAttachment = null;

    if (attachProfile) {
      try {
        profileAttachment = readProfileAttachment();
      } catch {
        setMessage(
          "We couldn’t attach your profile. Open My Profile, complete your name and skills, and wait for “Saved in this browser”. Then try again.",
        );
        return;
      }
    }

    let safePortfolio = "";

    if (portfolio.trim()) {
      try {
        const url = new URL(portfolio.trim());

        if (!["https:", "http:"].includes(url.protocol)) {
          throw new Error("Invalid URL");
        }

        safePortfolio = url.href;
      } catch {
        setMessage("Use a portfolio URL starting with https:// or http://.");
        return;
      }
    }

    if (!profileAttachment && !introduction.trim() && !safePortfolio) {
      setMessage(
        "Attach your profile, write a message, or add a portfolio URL before submitting.",
      );
      return;
    }

    const newApplication = {
      id: crypto.randomUUID(),
      opportunityId: opportunity.id,
      profileAttachment,
      introduction: introduction.trim(),
      portfolio: safePortfolio,
      appliedAt: new Date().toISOString(),
      status: "Applied",
    };

    setActivity((current) => {
      if (
        current.applications.some(
          (item) => item.opportunityId === opportunity.id,
        )
      ) {
        return current;
      }

      return {
        ...current,
        applications: [...current.applications, newApplication],
      };
    });

    setMessage("Demo application added. Check the saving status below.");
  }
  return (
    <PageLayout>
      <Link
        className="sa-back-button"
        to={
          applicationPage
            ? `/student/opportunities/${id}`
            : "/student/dashboard"
        }
      >
        {applicationPage
          ? "← Back to opportunity details"
          : "← Back to opportunities"}
      </Link>

      {!applicationPage && (
        <section className="sa-card">
          <div className="sa-title-row">
            <div>
              <span className="sa-tag">{opportunity.type}</span>
              <h1>{opportunity.title}</h1>
              <p className="sa-muted">{opportunity.company}</p>
            </div>
            <strong className="sa-pay">{opportunity.pay}</strong>
          </div>

          <div className="sa-tags">
            <span>{opportunity.location}</span>
            <span>{opportunity.duration}</span>
          </div>

          <h2>About the role</h2>
          <p>{opportunity.description}</p>

          <h2>What you’ll do</h2>
          <ul>
            {opportunity.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2>Required skills</h2>
          <div className="sa-tags">
            {opportunity.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>

          <div className="sa-actions">
            {application ? (
              <Link className="sa-primary" to="/student/applications">
                View My Application
              </Link>
            ) : (
              <Link
                className="sa-primary"
                to={`/student/opportunities/${opportunity.id}/apply`}
              >
                Apply Now
              </Link>
            )}

            <button
              type="button"
              className="sa-secondary"
              disabled={!storage.ready}
              aria-pressed={isSaved}
              onClick={toggleSaved}
            >
              {isSaved ? "Saved" : "Save Opportunity"}
            </button>
          </div>
        </section>
      )}

      {applicationPage && storage.ready && !application && (
        <section className="sa-card">
          <h1>Apply for {opportunity.title}</h1>
          <p className="sa-muted">
            {opportunity.company} · {opportunity.location}
          </p>
          <p>
            Share your profile, introduce yourself, or include a link to your
            work.
          </p>
          <form onSubmit={apply}>
            <div className="sa-profile-attachment">
              <label className="sa-attach-label" htmlFor="sa-attach-profile">
                <input
                  id="sa-attach-profile"
                  type="checkbox"
                  checked={attachProfile}
                  onChange={(event) => setAttachProfile(event.target.checked)}
                />
                <span>Attach my TalentBridge profile</span>
              </label>

              <p className="sa-muted">
                Include a copy of your name, education, skills, availability,
                introduction and projects.
              </p>

              <Link
                to="/student/profile"
                target="_blank"
                rel="noopener noreferrer"
              >
                View or complete my profile ↗
              </Link>

              <p className="sa-muted">
                Opens in a new tab so you can keep this application open.
                Profile photos are not included in this demo attachment.
              </p>
            </div>

            <label htmlFor="sa-introduction">
              Description or message to the company (optional)
            </label>
            <textarea
              id="sa-introduction"
              rows={4}
              maxLength={2000}
              value={introduction}
              onChange={(event) => setIntroduction(event.target.value)}
              placeholder="Tell the company why you’re interested or when you’re available."
            />

            <label htmlFor="sa-portfolio">
              GitHub or portfolio URL (optional)
            </label>
            <input
              id="sa-portfolio"
              type="url"
              value={portfolio}
              onChange={(event) => setPortfolio(event.target.value)}
              placeholder="https://..."
            />

            <div className="sa-actions">
              <button
                type="submit"
                className="sa-primary"
                disabled={!storage.ready}
              >
                Submit Demo Application
              </button>
              <Link
                className="sa-secondary"
                to={`/student/opportunities/${opportunity.id}`}
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>
      )}

      {applicationPage && storage.ready && application && (
        <section className="sa-card">
          <span className="sa-tag">Application recorded</span>
          <h1>Your demo application</h1>
          <p>
            You have applied for {opportunity.title} at {opportunity.company}.
          </p>
          <p className="sa-muted">
            This application has not been sent to the company. Check the browser
            saving status below.
          </p>
          <div className="sa-actions">
            <Link className="sa-primary" to="/student/applications">
              View My Applications
            </Link>
            <Link className="sa-secondary" to="/student/dashboard">
              Explore Opportunities
            </Link>
          </div>
        </section>
      )}

      <p role="status">{message}</p>
      <StorageStatus storage={storage} />
    </PageLayout>
  );
}

export default function StudentApplications() {
  const [activity, , storage] = useStudentActivity();

  return (
    <PageLayout>
      <h1>My Applications</h1>
      <p className="sa-muted">
        Review the opportunities you have applied for in this demo.
      </p>

      <StorageStatus storage={storage} />

      {storage.ready && activity.applications.length === 0 && (
        <section className="sa-card sa-empty">
          <h2>No applications yet</h2>
          <p>
            Explore opportunities and apply for one that matches your skills.
          </p>
          <Link className="sa-primary" to="/student/dashboard">
            Explore Opportunities
          </Link>
        </section>
      )}

      {storage.ready &&
        [...activity.applications].reverse().map((application) => {
          const opportunity = opportunities.find(
            (item) => item.id === application.opportunityId,
          );

          return (
            <article className="sa-card" key={application.id}>
              <div className="sa-title-row">
                <div>
                  <h2>{opportunity?.title || "Unavailable opportunity"}</h2>
                  <p className="sa-muted">{opportunity?.company}</p>
                </div>
                <span className="sa-tag">{application.status}</span>
              </div>

              <p className="sa-muted">
                Applied on{" "}
                {new Date(application.appliedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <details>
                <summary>View my application</summary>

                {application.profileAttachment ? (
                  <section className="sa-attached-profile">
                    <h3>Attached TalentBridge profile</h3>
                    <p className="sa-muted">
                      Copy attached when you applied. Later profile edits do not
                      change this attachment.
                    </p>

                    <h3>{application.profileAttachment.profile.name}</h3>
                    <p>{application.profileAttachment.profile.headline}</p>

                    <p>
                      {[
                        application.profileAttachment.profile.college,
                        application.profileAttachment.profile.course,
                        application.profileAttachment.profile.year,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>

                    <p>{application.profileAttachment.profile.location}</p>

                    <h4>Skills</h4>
                    <p>{application.profileAttachment.profile.skills}</p>

                    {application.profileAttachment.profile.bio && (
                      <>
                        <h4>About</h4>
                        <p className="sa-introduction">
                          {application.profileAttachment.profile.bio}
                        </p>
                      </>
                    )}

                    {application.profileAttachment.profile.availability && (
                      <>
                        <h4>Availability</h4>
                        <p>
                          {application.profileAttachment.profile.availability}
                        </p>
                      </>
                    )}

                    {application.profileAttachment.projects.length > 0 && (
                      <>
                        <h4>Projects</h4>
                        {application.profileAttachment.projects.map(
                          (project, index) => (
                            <div key={index}>
                              <strong>{project.title}</strong>
                              <p className="sa-introduction">
                                {project.description}
                              </p>
                            </div>
                          ),
                        )}
                      </>
                    )}
                  </section>
                ) : (
                  <p className="sa-muted">
                    No profile was attached to this application.
                  </p>
                )}

                {application.introduction && (
                  <>
                    <h3>Message to the company</h3>
                    <p className="sa-introduction">
                      {application.introduction}
                    </p>
                  </>
                )}

                {application.portfolio && (
                  <a
                    href={application.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open GitHub or portfolio ↗
                  </a>
                )}
              </details>

              {opportunity && (
                <div className="sa-actions">
                  <Link
                    className="sa-secondary"
                    to={`/student/opportunities/${opportunity.id}`}
                  >
                    Opportunity Details
                  </Link>
                </div>
              )}
            </article>
          );
        })}
    </PageLayout>
  );
}
