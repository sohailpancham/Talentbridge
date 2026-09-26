import { createContext, useContext } from "react";
import { Navigate } from "react-router-dom";
import useBrowserDraft from "./useBrowserDraft";

const PreferencesContext = createContext(null);
export const startingPages = [
  { value: "/student/dashboard", label: "Dashboard" },
  { value: "/student/explore", label: "Explore Opportunities" },
  { value: "/student/applications", label: "My Applications" },
  { value: "/student/saved", label: "Saved Opportunities" },
];
export const opportunityTypes = ["All", "Internship", "Freelance", "Part-time"];
export const defaultPreferences = {
  startingPage: "/student/dashboard",
  opportunityType: "All",
};

export function StudentPreferencesProvider({ children }) {
  const [saved, setSaved, storage] = useBrowserDraft(
    "talentbridge-student-preferences-v1",
    defaultPreferences,
  );
  // Only accept values supported by our routes and filters.
  const preferences = {
    startingPage: startingPages.some(
      (page) => page.value === saved?.startingPage,
    )
      ? saved.startingPage
      : defaultPreferences.startingPage,
    opportunityType: opportunityTypes.includes(saved?.opportunityType)
      ? saved.opportunityType
      : defaultPreferences.opportunityType,
  };

  function updatePreference(key, value) {
    if (!storage.ready) return;
    if (
      key === "startingPage" &&
      !startingPages.some((page) => page.value === value)
    )
      return;
    if (key === "opportunityType" && !opportunityTypes.includes(value)) return;
    if (!Object.hasOwn(defaultPreferences, key)) return;
    setSaved((current) => ({ ...current, [key]: value }));
  }

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        resetPreferences: () => {
          if (storage.ready) setSaved({ ...defaultPreferences });
        },
        storage,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function useStudentPreferences() {
  const context = useContext(PreferencesContext);
  if (!context)
    throw new Error("Student preferences require StudentPreferencesProvider.");
  return context;
}

export function StudentStart() {
  const { preferences, storage } = useStudentPreferences();
  if (storage.error)
    return <p role="alert">{storage.error} Use the sidebar to open a page.</p>;
  if (!storage.ready) return <p role="status">Loading your starting page…</p>;
  return <Navigate to={preferences.startingPage} replace />;
}
