import React, { useEffect, useRef, useState } from "react";
import { SignInButton, AuthKitProvider } from "@farcaster/auth-kit";
import "@farcaster/auth-kit/styles.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

/**
 * Renders a "Sign in with Farcaster" button. Fetches a nonce from backend,
 * uses AuthKit SignInButton, then sends the signed message to our /api/auth/farcaster.
 */
function FarcasterInner() {
  const navigate = useNavigate();
  const { completeFarcaster, formatApiError } = useAuth();
  const [nonce, setNonce] = useState("");
  const [error, setError] = useState("");
  const processed = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/nonce");
        setNonce(data.nonce);
      } catch {
        setNonce(Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2));
      }
    })();
  }, []);

  const handleSuccess = async (res) => {
    if (processed.current) return;
    processed.current = true;
    try {
      await completeFarcaster({
        fid: res.fid,
        username: res.username,
        displayName: res.displayName,
        bio: res.bio,
        pfpUrl: res.pfpUrl,
        signature: res.signature,
        message: res.message,
        nonce,
      });
      navigate("/feed", { replace: true });
    } catch (err) {
      processed.current = false;
      setError(formatApiError(err.response?.data?.detail) || "Farcaster sign-in failed.");
    }
  };

  if (!nonce) {
    return (
      <button disabled className="w-full border border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-zinc-500 rounded-full py-3 font-semibold text-[13px]">
        Loading Farcaster…
      </button>
    );
  }

  return (
    <div className="onlybase-fc-button" data-testid="farcaster-auth-btn">
      <SignInButton nonce={nonce} onSuccess={handleSuccess} />
      {error && (
        <div className="text-[11px] text-red-500 mt-2 text-center">{error}</div>
      )}
      <style>{`
        .onlybase-fc-button button {
          width: 100% !important;
          border-radius: 9999px !important;
          padding: 12px 16px !important;
          font-size: 0 !important;
          font-weight: 600 !important;
          background: #7C65C1 !important;
          color: white !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          height: 44px !important;
          position: relative !important;
        }
        .onlybase-fc-button button::before {
          content: 'Continue with Farcaster';
          font-size: 13px !important;
          font-weight: 600 !important;
          color: white;
          letter-spacing: 0.01em;
        }
        .onlybase-fc-button button:hover { opacity: 0.9 !important; }
      `}</style>
    </div>
  );
}

export default function FarcasterLoginButton() {
  const config = {
    domain: window.location.hostname,
    siweUri: window.location.origin + "/login",
    rpcUrl: "https://mainnet.optimism.io",
    relay: "https://relay.farcaster.xyz",
  };
  return (
    <AuthKitProvider config={config}>
      <FarcasterInner />
    </AuthKitProvider>
  );
}
