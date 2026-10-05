import ProfileAvatar from "./ProfileAvatar";
import { useState } from "react";
import useServerProfile from "./useServerProfile";
import { studyYears, yearLabel } from "./profileApi";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  Clock,
  LoaderCircle,
  MapPin,
  GraduationCap,
  BriefcaseBusiness,
  FolderOpen,
  ArrowUpRight,
} from "lucide-react";
import "./StudentProfile.css";
import "./StudentProfileApi.css";

const emptyProject = {
  title: "",
  description: "",
  link: "",
};

export default function StudentProfile() {
  const [draft, setDraft, storage] = useServerProfile();
  const profile = draft?.profile;
  const projects = draft?.projects || [];
  const setProfile = (update) =>
    setDraft((current) => ({
      ...current,
      profile: typeof update === "function" ? update(current.profile) : update,
    }));
  const setProjects = (update) =>
    setDraft((current) => ({
      ...current,
      projects:
        typeof update === "function" ? update(current.projects) : update,
    }));

  const [editing, setEditing] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [project, setProject] = useState(emptyProject);
  const [message, setMessage] = useState("");

  function updateProfile(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  async function previewProfile(event) {
    event.preventDefault();

    if (!profile.name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (
      project.title.trim() ||
      project.description.trim() ||
      project.link.trim()
    ) {
      setMessage(
        "Click Add Project first to include the project you are typing, or clear those fields.",
      );
      return;
    }
    if (await storage.save()) {
      setEditing(false);
      setMessage("");
    }
  }

  function addProject(event) {
    event.preventDefault();

    if (storage.saving) return;
    if (projects.length >= 10) {
      setMessage("You can include up to 10 projects.");
      return;
    }
    if (!project.title.trim() || !project.description.trim()) {
      setMessage("Enter a project title and description.");
      return;
    }

    let safeLink = "";

    if (project.link.trim()) {
      try {
        const url = new URL(project.link.trim());

        if (!["https:", "http:"].includes(url.protocol)) {
          throw new Error("Unsupported link");
        }

        safeLink = url.href;
      } catch {
        setMessage("Use a full project URL starting with https:// or http://.");
        return;
      }
    }

    setProjects((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title: project.title.trim(),
        description: project.description.trim(),
        link: safeLink,
      },
    ]);

    setProject(emptyProject);
    setMessage(
      "Project added to this editor. Click Save Profile to save it to your account.",
    );
  }

  if (!storage.ready) {
    return (
      <main className="student-profile">
        <p role="status">{storage.status}</p>
        {storage.error && <p role="alert">{storage.error}</p>}
        {!storage.loading && (
          <button type="button" className="sp-primary" onClick={storage.reload}>
            Try again
          </button>
        )}
      </main>
    );
  }

  const skills = [
    ...new Set(
      profile.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    ),
  ];

  function showSection(section) {
    setActiveSection(section);
    document.getElementById(`sp-${section}`)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    document.getElementById(`sp-${section}`)?.focus({ preventScroll: true });
  }

  const statusText = storage.saving
    ? "Saving changes…"
    : storage.error
      ? "Needs attention"
      : storage.dirty
        ? "Unsaved changes"
        : "All changes saved";
  const StatusIcon = storage.saving
    ? LoaderCircle
    : storage.dirty || storage.error
      ? Clock
      : Check;

  return (
    <main className="student-profile sp-reference">
      <div className="sp-page-title">
        <div>
          <p className="sp-eyebrow">YOUR STUDENT SPACE</p>
          <h1>My Profile</h1>
        </div>
        <span
          className={`sp-save-status ${storage.dirty || storage.error ? "is-pending" : ""}`}
          role="status"
        >
          <StatusIcon size={15} aria-hidden="true" />
          {statusText}
        </span>
      </div>

      <nav className="sp-section-nav" aria-label="Profile sections">
        {["overview", "education", "skills", "projects"].map((section) => (
          <button
            key={section}
            type="button"
            className={activeSection === section ? "is-current" : ""}
            aria-current={activeSection === section ? "location" : undefined}
            onClick={() => showSection(section)}
          >
            {section[0].toUpperCase() + section.slice(1)}
          </button>
        ))}
      </nav>

      {storage.error && (
        <p className="sp-save-error" role="alert">
          {storage.error}
        </p>
      )}
      <p className="sp-message" role="status">
        {message}
      </p>

      <fieldset className="sp-api-fieldset" disabled={storage.saving}>
        <legend className="sp-api-hidden">Profile editor and projects</legend>
        <section
          className="sp-card sp-intro"
          id="sp-overview"
          tabIndex={-1}
          aria-label="Profile overview"
        >
          <div className="sp-photo-area">
            <ProfileAvatar name={profile.name} />
            <p className="sp-photo-note">Photo stored on this browser</p>
          </div>
          <div className="sp-intro-text">
            <p className="sp-profile-kind">Student profile</p>
            <h2>{profile.name.trim() || "Your Name"}</h2>
            <p className="sp-headline">
              {profile.headline || "Add a headline about your skills"}
            </p>
            <p className="sp-intro-bio">
              {profile.bio ||
                "Tell your story: your interests, strengths, and what you want to build."}
            </p>
            <div className="sp-profile-meta">
              {profile.location && (
                <span>
                  <MapPin size={15} aria-hidden="true" />
                  {profile.location}
                </span>
              )}
              {profile.availability && (
                <span>
                  <BriefcaseBusiness size={15} aria-hidden="true" />
                  {profile.availability}
                </span>
              )}
            </div>
          </div>
          <div className="sp-header-actions">
            <button
              type="button"
              className="sp-secondary"
              onClick={() => setEditing(!editing)}
              aria-expanded={editing}
              aria-controls="sp-editor"
            >
              <Pencil size={16} aria-hidden="true" />
              {editing ? "View Profile" : "Edit Profile"}
            </button>
            {(editing || storage.dirty) && (
              <button
                className="sp-primary"
                type="button"
                onClick={previewProfile}
                disabled={storage.conflict}
              >
                Save Profile
              </button>
            )}
            {(editing || storage.conflict) && (
              <details className="sp-data-options">
                <summary>Saved profile options</summary>
                <button
                  className="sp-text-button"
                  type="button"
                  onClick={storage.reload}
                >
                  Reload saved profile
                </button>
                {storage.canImport && (
                  <button
                    className="sp-text-button"
                    type="button"
                    onClick={() => {
                      storage.importBrowserDraft();
                      setEditing(true);
                    }}
                  >
                    Import browser draft
                  </button>
                )}
              </details>
            )}
          </div>
        </section>

        {editing && (
          <section className="sp-card" id="sp-editor">
            <h2>Edit your profile</h2>
            <p className="sp-muted">
              Update your details, then choose Save Profile. Add your projects
              below before saving.
            </p>
            <form onSubmit={previewProfile}>
              <div className="sp-form-grid">
                <div>
                  <label htmlFor="sp-name">Full name</label>
                  <input
                    id="sp-name"
                    minLength={2}
                    maxLength={120}
                    name="name"
                    value={profile.name}
                    onChange={updateProfile}
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="sp-headline">Headline</label>
                  <input
                    id="sp-headline"
                    maxLength={160}
                    name="headline"
                    placeholder="BCA student · Frontend developer"
                    value={profile.headline}
                    onChange={updateProfile}
                  />
                </div>

                <div>
                  <label htmlFor="sp-college">College</label>
                  <input
                    id="sp-college"
                    required
                    minLength={2}
                    maxLength={200}
                    name="college"
                    value={profile.college}
                    onChange={updateProfile}
                  />
                </div>

                <div>
                  <label htmlFor="sp-course">Course</label>
                  <input
                    id="sp-course"
                    required
                    minLength={2}
                    maxLength={120}
                    name="course"
                    placeholder="e.g. BCA"
                    value={profile.course}
                    onChange={updateProfile}
                  />
                </div>

                <div>
                  <label htmlFor="sp-year">Current year</label>
                  <select
                    id="sp-year"
                    required
                    name="year"
                    value={profile.year}
                    onChange={updateProfile}
                  >
                    <option value="">Select year</option>
                    {studyYears.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="sp-location">City / State</label>
                  <input
                    id="sp-location"
                    maxLength={120}
                    name="location"
                    placeholder="e.g. Ponda, Goa"
                    value={profile.location}
                    onChange={updateProfile}
                  />
                </div>
              </div>

              <label htmlFor="sp-availability">Availability</label>
              <input
                id="sp-availability"
                maxLength={160}
                name="availability"
                placeholder="e.g. Remote · 10 hours per week"
                value={profile.availability}
                onChange={updateProfile}
              />

              <label htmlFor="sp-bio">About you</label>
              <textarea
                id="sp-bio"
                maxLength={4000}
                name="bio"
                rows={4}
                placeholder="Describe your interests and what you can help with."
                value={profile.bio}
                onChange={updateProfile}
              />

              <label htmlFor="sp-skills">Skills separated by commas</label>
              <input
                id="sp-skills"
                maxLength={1000}
                name="skills"
                placeholder="HTML, CSS, JavaScript, React"
                value={profile.skills}
                onChange={updateProfile}
              />

              <button
                className="sp-primary"
                type="submit"
                disabled={storage.conflict}
              >
                Save Profile
              </button>
            </form>
          </section>
        )}

        <div className="sp-columns">
          <section
            className="sp-card"
            id="sp-education"
            tabIndex={-1}
            aria-labelledby="sp-education-title"
          >
            <h2 id="sp-education-title">
              <GraduationCap size={20} aria-hidden="true" />
              Education
            </h2>
            <h3>{profile.course || "Add your course"}</h3>
            <p>{profile.college || "Add your college"}</p>
            <p className="sp-muted">
              {yearLabel(profile.year) || "Add your current year"}
            </p>
          </section>
          <section
            className="sp-card"
            id="sp-skills"
            tabIndex={-1}
            aria-labelledby="sp-skills-title"
          >
            <h2 id="sp-skills-title">Top Skills</h2>
            <div className="sp-skills">
              {skills.length ? (
                skills.map((skill) => <span key={skill}>{skill}</span>)
              ) : (
                <p className="sp-muted">Add your skills using Edit Profile.</p>
              )}
            </div>
          </section>
        </div>
        <section
          className="sp-card"
          id="sp-projects"
          tabIndex={-1}
          aria-labelledby="sp-projects-title"
        >
          <div className="sp-card-heading">
            <div>
              <h2 id="sp-projects-title">
                <FolderOpen size={20} aria-hidden="true" />
                My Projects{" "}
                <span className="sp-project-count">{projects.length}</span>
              </h2>
              <p className="sp-muted">A closer look at what you have built.</p>
            </div>
            {!editing && (
              <button
                className="sp-text-button"
                type="button"
                onClick={() => setEditing(true)}
              >
                <Plus size={16} aria-hidden="true" />
                Add project
              </button>
            )}
          </div>
          {projects.length === 0 && (
            <p className="sp-empty">
              Your projects will appear here. Add a project to show your work.
            </p>
          )}

          <div className="sp-projects">
            {projects.map((item) => (
              <article className="sp-project" key={item.id}>
                <h3>{item.title}</h3>
                <p className="sp-description">{item.description}</p>

                <div className="sp-project-actions">
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Project <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  )}

                  {editing && (
                    <button
                      type="button"
                      className="sp-remove"
                      aria-label={`Remove ${item.title}`}
                      onClick={() => {
                        setProjects((current) =>
                          current.filter((entry) => entry.id !== item.id),
                        );
                        setMessage(
                          "Project removed from this editor. Click Save Profile to save the change.",
                        );
                      }}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      Remove
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          {editing && (
            <form className="sp-project-form" onSubmit={addProject}>
              <h3>Add a project</h3>

              <label htmlFor="sp-project-title">Project title</label>
              <input
                id="sp-project-title"
                maxLength={120}
                value={project.title}
                onChange={(event) =>
                  setProject({ ...project, title: event.target.value })
                }
                placeholder="e.g. College Event Website"
                required
              />

              <label htmlFor="sp-project-description">
                Description and your contribution
              </label>
              <textarea
                id="sp-project-description"
                maxLength={2000}
                rows={3}
                value={project.description}
                onChange={(event) =>
                  setProject({ ...project, description: event.target.value })
                }
                placeholder="What did you build? Which technologies did you use?"
                required
              />

              <label htmlFor="sp-project-link">
                GitHub or live website link (optional)
              </label>
              <input
                id="sp-project-link"
                maxLength={2048}
                type="url"
                placeholder="https://..."
                value={project.link}
                onChange={(event) =>
                  setProject({ ...project, link: event.target.value })
                }
              />

              <button className="sp-primary" type="submit">
                <Plus size={18} aria-hidden="true" />
                Add Project
              </button>
            </form>
          )}
          {editing && (
            <div className="sp-bottom-save">
              <span className="sp-muted">
                Save your profile after adding or removing projects.
              </span>
              <button
                className="sp-primary"
                type="button"
                onClick={previewProfile}
                disabled={storage.conflict}
              >
                Save Profile
              </button>
            </div>
          )}
        </section>
      </fieldset>
    </main>
  );
}
