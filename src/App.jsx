import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import "./styles/global.css";
import StudentSignup from "./pages/public/StudentSignup";
import CompanySignup from "./pages/public/CompanySignup";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student/signup" element={<StudentSignup />} />
        <Route path="/company/signup" element={<CompanySignup />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />

        <Route
          path="*"
          element={
            <main className="section">
              <h1>Page not found</h1>
              <Link to="/">Return to Home</Link>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}