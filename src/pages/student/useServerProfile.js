import { useCallback, useEffect, useRef, useState } from "react";
import { accountStorageKey, useAuth } from "../../auth/AuthContext";
import { requestProfile, studyYears } from "./profileApi";

function readBrowserDraft(userId) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(
        accountStorageKey(userId, "talentbridge-student-profile-v1"),
      ) || "null",
    );
    return saved && typeof saved.profile === "object" && saved.profile !== null
      ? saved
      : null;
  } catch {
    return null;
  }
}

// Explicit saves: loading a profile never writes a blank/default profile to MySQL.
export default function useServerProfile() {
  const { user, refresh } = useAuth();
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(null);
  const [legacy, setLegacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const requestNumber = useRef(0);
  const controller = useRef(null);
  const pendingSave = useRef(false);
  const dirty = Boolean(
    draft && saved && JSON.stringify(draft) !== JSON.stringify(saved),
  );

  const load = useCallback(async () => {
    const current = ++requestNumber.current;
    controller.current?.abort();
    controller.current = new AbortController();
    setLoading(true);
    setError("");
    try {
      const result = await requestProfile(
        user.id,
        null,
        controller.current.signal,
      );
      if (current !== requestNumber.current) return;
      setDraft(result);
      setSaved(result);
      setLegacy(readBrowserDraft(user.id));
      setConflict(false);
    } catch (error) {
      if (current === requestNumber.current && error.name !== "AbortError") {
        setError(error.message || "Could not connect to the server.");
      }
    } finally {
      if (current === requestNumber.current) setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    load();
    return () => {
      ++requestNumber.current;
      controller.current?.abort();
    };
  }, [load]);

  useEffect(() => {
    function warn(event) {
      if (dirty || saving) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    function warnBeforeNavigation(event) {
      const link = event.target.closest?.("a[href]");
      if (
        !link ||
        link.target === "_blank" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const destination = new URL(link.href, window.location.href);
      if (
        destination.href === window.location.href ||
        (destination.hash && destination.pathname === window.location.pathname)
      )
        return;
      if (
        saving ||
        (dirty &&
          !window.confirm(
            "Leave this page without saving your profile changes?",
          ))
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", warnBeforeNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", warnBeforeNavigation, true);
    };
  }, [dirty, saving]);

  async function save() {
    if (!draft || pendingSave.current || conflict) return false;
    pendingSave.current = true;
    setSaving(true);
    setError("");
    const current = ++requestNumber.current;
    const { version, profile, projects } = draft;
    try {
      const result = await requestProfile(user.id, {
        version,
        profile,
        projects,
      });
      if (current !== requestNumber.current) return false;
      setDraft(result);
      setSaved(result);
      // Update the sidebar name through the existing session check.
      if (result.profile.name !== user.fullName) void refresh();
      return true;
    } catch (error) {
      if (current === requestNumber.current) {
        setError(
          error.message || "Could not save. Keep this page open and try again.",
        );
        setConflict(error.status === 409);
      }
      return false;
    } finally {
      pendingSave.current = false;
      if (current === requestNumber.current) setSaving(false);
    }
  }

  function importBrowserDraft() {
    if (!legacy || !draft || saving) return;
    if (
      !window.confirm(
        "Load your browser draft into this editor? This replaces the current unsaved edits. Your database profile changes only after you click Save Profile.",
      )
    )
      return;
    const nextProfile = { ...draft.profile };
    for (const key of Object.keys(nextProfile)) {
      const value = legacy.profile[key];
      // Blank old fields must not erase the signup details loaded from MySQL.
      if (typeof value === "string" && value.trim()) nextProfile[key] = value;
    }
    nextProfile.year =
      studyYears.find(
        ([id, label]) => id === nextProfile.year || label === nextProfile.year,
      )?.[0] || draft.profile.year;
    const projects = Array.isArray(legacy.projects)
      ? legacy.projects.map((item) => ({
          id: crypto.randomUUID(),
          title: typeof item?.title === "string" ? item.title : "",
          description:
            typeof item?.description === "string" ? item.description : "",
          link: typeof item?.link === "string" ? item.link : "",
        }))
      : [];
    setDraft({ ...draft, profile: nextProfile, projects });
    setError("");
  }

  async function reload() {
    if (saving) return;
    if (
      dirty &&
      !window.confirm(
        "Discard unsaved edits and load the latest saved profile?",
      )
    )
      return;
    await load();
  }

  return [
    draft,
    setDraft,
    {
      ready: !loading && Boolean(draft),
      loading,
      saving,
      dirty,
      error,
      conflict,
      status: loading
        ? "Loading your account profile…"
        : saving
          ? "Saving to your account…"
          : dirty
            ? "Unsaved changes — click Save Profile before leaving this page."
            : saved
              ? "Saved to your account"
              : "Profile unavailable",
      canImport: Boolean(legacy),
      save,
      reload,
      importBrowserDraft,
    },
  ];
}
