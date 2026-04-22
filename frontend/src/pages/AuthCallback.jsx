import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Processes the Google OAuth fragment (#session_id=...).
 * Called once from AppRouter when the URL hash contains session_id.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { completeGoogle } = useAuth();
  const processed = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate("/login", { replace: true });
      return;
    }
    const sessionId = decodeURIComponent(match[1]);

    (async () => {
      try {
        await completeGoogle(sessionId);
        // Clean the hash & redirect to feed
        window.history.replaceState({}, "", "/feed");
        navigate("/feed", { replace: true });
      } catch (e) {
        setError("Google sign-in failed. Please try again.");
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      }
    })();
  }, [completeGoogle, navigate]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-black flex items-center justify-center text-black dark:text-white">
      <div className="text-center">
        <div className="font-display text-2xl font-bold mb-2">Signing you in…</div>
        <div className="text-sm text-gray-500 dark:text-zinc-500">
          {error || "Connecting your Google account"}
        </div>
      </div>
    </div>
  );
}
