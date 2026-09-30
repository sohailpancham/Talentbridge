import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Navigate, Outlet } from "react-router-dom";
import "./Auth.css";

const AuthContext = createContext(null);
const sessionEvent = "talentbridge-session-changed";

function notifyOtherTabs() {
  try {
    localStorage.setItem(sessionEvent, crypto.randomUUID());
  } catch {
    // Session cookies still work when browser storage is unavailable.
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: "loading", user: null });
  const revision = useRef(0);

  const refresh = useCallback(async () => {
    const current = ++revision.current;
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Session check failed");
      const result = await response.json();
      if (!Object.hasOwn(result, "user"))
        throw new Error("Invalid session response");
      if (current === revision.current) {
        setState({ status: "ready", user: result.user });
      }
    } catch {
      if (current === revision.current) {
        setState({ status: "error", user: null });
      }
    }
  }, []);

  useEffect(() => {
    refresh();
    function onStorage(event) {
      if (event.key === sessionEvent) {
        setState({ status: "loading", user: null });
        refresh();
      }
    }
    function onVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      ++revision.current;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  function completeLogin(user) {
    ++revision.current;
    setState({ status: "ready", user });
    notifyOtherTabs();
  }

  function completeLogout() {
    ++revision.current;
    setState({ status: "ready", user: null });
    notifyOtherTabs();
  }

  return (
    <AuthContext.Provider
      value={{ ...state, refresh, completeLogin, completeLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider is required.");
  return context;
}

export function RequireStudent() {
  const { status, user, refresh } = useAuth();
  if (status === "loading")
    return (
      <main className="auth-status" role="status">
        Checking your session…
      </main>
    );
  if (status === "error") {
    return (
      <main className="auth-status">
        <h1>Could not check your session</h1>
        <p role="alert">Check that the backend is running, then try again.</p>
        <button type="button" onClick={refresh}>
          Try again
        </button>
      </main>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "student")
    return (
      <main className="auth-status">This area requires a student account.</main>
    );
  return <Outlet />;
}

export function accountStorageKey(userId, key) {
  if (userId == null)
    throw new Error("An account is required for student storage.");
  return `talentbridge-account-${userId}:${key}`;
}
