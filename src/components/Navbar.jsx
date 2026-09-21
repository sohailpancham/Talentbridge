import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function Navbar() {
  return (
    <header className="navbar">
      <Link className="brand navbar-brand" to="/">
        <GraduationCap size={30} aria-hidden="true" />
        TalentBridge
      </Link>

      <nav aria-label="Main navigation">
        <a href="#opportunities">Explore Opportunities</a>
        <a href="#students">For Students</a>
        <a href="#companies">For Companies</a>
      </nav>

      <Link className="button blue" to="/login">
        Login
      </Link>
    </header>
  );
}