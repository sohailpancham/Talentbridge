import { createContext, useContext } from "react";
import useBrowserDraft from "./useBrowserDraft";

const StudentActivityContext = createContext(null);

export function StudentActivityProvider({ children }) {
  const activity = useBrowserDraft("talentbridge-student-activity-v1", {
    savedIds: [],
    applications: [],
  });

  return (
    <StudentActivityContext.Provider value={activity}>
      {children}
    </StudentActivityContext.Provider>
  );
}

export function useStudentActivity() {
  const activity = useContext(StudentActivityContext);

  if (!activity) {
    throw new Error("Student pages must be inside StudentActivityProvider.");
  }

  return activity;
}
