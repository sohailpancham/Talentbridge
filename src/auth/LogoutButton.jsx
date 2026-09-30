import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "./AuthContext";

export default function LogoutButton() {
  const { completeLogout } = useAuth();
  const navigate = useNavigate();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "X-TalentBridge-Request": "1" },
      });
      if (!response.ok) throw new Error("Logout failed");
      completeLogout();
      navigate("/login", { replace: true });
    } catch {
      setError("Could not log out. Check your connection and try again.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="sl-logout">
      <button
        type="button"
        className="sl-button"
        disabled={busy}
        onClick={logout}
      >
        <LogOut size={19} aria-hidden="true" />
        {busy ? "Logging out…" : "Logout"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
