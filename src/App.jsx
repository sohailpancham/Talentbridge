import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import StudentSignup from "./pages/public/StudentSignup";
import CompanySignup from "./pages/public/CompanySignup";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import StudentSettings from "./pages/student/StudentSettings";
import StudentHelp from "./pages/student/StudentHelp";
import { StudentStart } from "./pages/student/StudentPreferences";
import StudentLayout from "./pages/student/StudentLayout";
import StudentApplications, {
  OpportunityDetails,
} from "./pages/student/StudentApplications";
import "./styles/global.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student/signup" element={<StudentSignup />} />
        <Route path="/company/signup" element={<CompanySignup />} />

        <Route element={<StudentLayout />}>
          <Route path="/student" element={<StudentStart />} />
          <Route path="/student/settings" element={<StudentSettings />} />
          <Route path="/student/help" element={<StudentHelp />} />
          <Route
            path="/student/dashboard"
            element={<StudentDashboard key="dashboard" />}
          />
          <Route
            path="/student/explore"
            element={<StudentDashboard key="explore" section="explore" />}
          />
          <Route
            path="/student/saved"
            element={<StudentDashboard key="saved" section="saved" />}
          />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route
            path="/student/applications"
            element={<StudentApplications />}
          />
          <Route
            path="/student/opportunities/:id"
            element={<OpportunityDetails />}
          />
          <Route
            path="/student/opportunities/:id/apply"
            element={<OpportunityDetails applicationPage />}
          />
        </Route>

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
