import ProfileAvatar from "./ProfileAvatar";
import { useState } from "react";
import useBrowserDraft from "./useBrowserDraft";
import { Link } from "react-router-dom";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import "./StudentProfile.css";

const emptyProject = {
  title: "",
  description: "",
  link: "",
};

export default function StudentProfile() {
  const [draft, setDraft, storage] = useBrowserDraft("talentbridge-student-profile-v1", {
    profile: {
    name: "",
    headline: "",
    college: "",
    course: "",
    year: "",
    location: "",
    availability: "",
    bio: "",
    skills: "",
    },
    projects: [],
  });
  const { profile, projects } = draft;
  const setProfile = (update) => setDraft(current => ({
    ...current, profile: typeof update === "function" ? update(current.profile) : update,
  }));
  const setProjects = (update) => setDraft(current => ({
    ...current, projects: typeof update === "function" ? update(current.projects) : update,
  }));

  const [editing, setEditing] = useState(true);
  const [project, setProject] = useState(emptyProject);
  const [message, setMessage] = useState("");

  function updateProfile(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  function previewProfile(event) {
    event.preventDefault();

    if (!profile.name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    setEditing(false);
    setMessage("Profile updated. Check the saving status above.");
  }

  function addProject(event) {
    event.preventDefault();

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
    setMessage("Project added.");
  }

  if (!storage.ready) {
    return <main className="student-profile"><p role="status">{storage.error || storage.status}</p></main>;
  }

  const skills = [
    ...new Set(
      profile.skills.split(",").map((skill) => skill.trim()).filter(Boolean)
    ),
  ];

  return (
    <main className="student-profile">
      <header className="sp-header">
        <Link to="/" className="sp-brand">
          <GraduationCap size={28} aria-hidden="true" />
          TalentBridge
        </Link>
        <Link to="/student/dashboard" className="sp-secondary">
  ← Dashboard
</Link>
      </header>

      <div className="sp-notice">
        {storage.status} · Local preview on this browser only.
        {storage.error && <p role="alert">{storage.error}</p>}
      </div>

      <section className="sp-card sp-intro">
        <ProfileAvatar name={profile.name} />

        <div className="sp-intro-text">
          <h1>{profile.name.trim() || "Your Name"}</h1>
          <p>{profile.headline || "Add a headline about your skills"}</p>
          <p className="sp-muted">
            {[profile.college, profile.location].filter(Boolean).join(" · ")}
          </p>
        </div>

        <button
          type="button"
          className="sp-secondary"
          onClick={() => setEditing(!editing)}
          aria-expanded={editing}
          aria-controls="sp-editor"
        >
          {editing ? "Close Editor" : "Edit Profile"}
        </button>
      </section>

      <p className="sp-message" role="status">{message}</p>

      {editing && (
        <section className="sp-card" id="sp-editor">
          <h2>Edit your profile</h2>
          <form onSubmit={previewProfile}>
            <div className="sp-form-grid">
              <div>
                <label htmlFor="sp-name">Full name</label>
                <input
                  id="sp-name"
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
                  name="college"
                  value={profile.college}
                  onChange={updateProfile}
                />
              </div>

              <div>
                <label htmlFor="sp-course">Course</label>
                <input
                  id="sp-course"
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
                  name="year"
                  value={profile.year}
                  onChange={updateProfile}
                >
                  <option value="">Select year</option>
                  <option>First year</option>
                  <option>Second year</option>
                  <option>Third year</option>
                  <option>Fourth year</option>
                  <option>Fifth year or above</option>
                </select>
              </div>

              <div>
                <label htmlFor="sp-location">City / State</label>
                <input
                  id="sp-location"
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
              name="availability"
              placeholder="e.g. Remote · 10 hours per week"
              value={profile.availability}
              onChange={updateProfile}
            />

            <label htmlFor="sp-bio">About you</label>
            <textarea
              id="sp-bio"
              name="bio"
              rows={4}
              placeholder="Describe your interests and what you can help with."
              value={profile.bio}
              onChange={updateProfile}
            />

            <label htmlFor="sp-skills">Skills separated by commas</label>
            <input
              id="sp-skills"
              name="skills"
              placeholder="HTML, CSS, JavaScript, React"
              value={profile.skills}
              onChange={updateProfile}
            />

            <button className="sp-primary" type="submit">
              Preview Profile
            </button>
          </form>
        </section>
      )}

      <div className="sp-columns">
        <section className="sp-card">
          <h2>About</h2>
          <p className="sp-description">
            {profile.bio || "Your introduction will appear here."}
          </p>

          <h3>Education</h3>
          <p>{profile.college || "Add your college"}</p>
          <p className="sp-muted">
            {[profile.course, profile.year].filter(Boolean).join(" · ")}
          </p>

          <h3>Availability</h3>
          <p>{profile.availability || "Not added yet"}</p>
        </section>

        <section className="sp-card">
          <h2>Skills</h2>
          <div className="sp-skills">
            {skills.length ? (
              skills.map((skill) => <span key={skill}>{skill}</span>)
            ) : (
              <p className="sp-muted">Add your skills using Edit Profile.</p>
            )}
          </div>
        </section>
      </div>

      <section className="sp-card">
        <h2>My Projects</h2>
        <p className="sp-muted">
          Show companies what you have built and explain your contribution.
        </p>

        {projects.length === 0 && (
          <p className="sp-empty">No projects yet. Add your first project below.</p>
        )}

        <div className="sp-projects">
          {projects.map((item) => (
            <article className="sp-project" key={item.id}>
              <h3>{item.title}</h3>
              <p className="sp-description">{item.description}</p>

              <div className="sp-project-actions">
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    View Project ↗
                  </a>
                )}

                <button
                  type="button"
                  className="sp-remove"
                  aria-label={`Remove ${item.title}`}
                  onClick={() => {
                    setProjects((current) =>
                      current.filter((entry) => entry.id !== item.id)
                    );
                    setMessage("Project removed.");
                  }}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        <form className="sp-project-form" onSubmit={addProject}>
          <h3>Add a project</h3>

          <label htmlFor="sp-project-title">Project title</label>
          <input
            id="sp-project-title"
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
      </section>
    </main>
  );
}