import { GraduationCap, BriefcaseBusiness, Laptop } from "lucide-react";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";

const opportunities = [
  {
    title: "Frontend Developer Intern",
    type: "Internship",
    pay: "₹10,000 / month",
    details: "Remote · 3 months",
    Icon: GraduationCap,
  },
  {
    title: "Business Website Design",
    type: "Freelance Project",
    pay: "₹8,000 / project",
    details: "Remote · 2 weeks",
    Icon: Laptop,
  },
  {
    title: "Social Media Assistant",
    type: "Part-time Job",
    pay: "₹6,000 / month",
    details: "Hybrid · 2 months",
    Icon: BriefcaseBusiness,
  },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">BUILT FOR STUDENT TALENT</p>

            <h1>
              Connect Talent
              <br />
              <span>With Opportunity</span>
            </h1>

            <p className="hero-description">
              Find freelance projects, internships and part-time jobs.
              Show your skills, gain experience and earn while you learn.
            </p>

            <div className="hero-actions">
              <Link className="button blue" to="/student/signup">
  Join as a Student
</Link>
             <Link className="button purple" to="/company/signup">
  Join as a Company
</Link>
            </div>
          </div>

          <div className="hero-panel">
            <GraduationCap size={64} aria-hidden="true" />
            <h2>Your skills. Your next opportunity.</h2>
            <p>Connecting college students and companies across India.</p>
            <span>Learn · Build · Earn</span>
          </div>
        </section>

        <section className="section" id="opportunities">
          <h2>Explore Opportunities</h2>
          <p className="muted">
            Sample opportunities for our website preview—not live listings.
          </p>

          <div className="cards">
            {opportunities.map(({ title, type, pay, details, Icon }) => (
              <article className="card" key={title}>
                <Icon className="card-icon" size={30} aria-hidden="true" />
                <p className="opportunity-type">{type}</p>
                <h3>{title}</h3>
                <strong>{pay}</strong>
                <p className="muted">{details}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="how-it-works">
          <h2>Where Student Talent Meets Opportunity</h2>

          <div className="audience-grid">
            <article className="card" id="students">
              <h3>For Students</h3>
              <p>
                Build your portfolio, showcase projects and apply for
                opportunities that fit your college schedule.
              </p>
            </article>

            <article className="card" id="companies">
              <h3>For Companies</h3>
              <p>
                Post your requirements, explore student portfolios and
                find the right talent for your next project.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} TalentBridge · Learn. Build. Grow.
      </footer>
    </>
  );
}