import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SealCheck, EnvelopeSimple, LockKey, User as UserIcon, Warning, ArrowLeft } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import FarcasterLoginButton from "../components/FarcasterLoginButton";

export default function LoginPage({ mode: initialMode = "login" }) {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, formatApiError } = useAuth();
  const [mode, setMode] = useState(initialMode); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/feed", { replace: true });
  }, [isAuthenticated, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ email, password, name });
      }
      navigate("/feed", { replace: true });
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-black flex items-stretch justify-center transition-colors">
      <div className="relative w-full max-w-md min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between px-4 pt-4 pb-3">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center"
            data-testid="login-back"
          >
            <ArrowLeft size={18} weight="bold" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-black text-lg tracking-tight text-black dark:text-white">OnlyBase</span>
            <SealCheck weight="fill" size={16} className="text-[#0052FF]" />
          </div>
          <ThemeToggle />
        </header>

        <div className="flex-1 px-6 pt-4 pb-8 flex flex-col">
          <h1 className="font-display text-[32px] leading-tight font-bold tracking-tight text-black dark:text-white mb-2">
            {mode === "login" ? "Welcome back." : "Join OnlyBase."}
          </h1>
          <p className="text-[14px] text-gray-500 dark:text-zinc-400 mb-6">
            {mode === "login"
              ? "Sign in to browse creators, trade tokens, and message the ones you love."
              : "Create your account. Posts are free. NSFW = permanent ban."}
          </p>

          <form onSubmit={submit} className="space-y-3" data-testid="auth-form">
            {mode === "register" && (
              <InputRow
                Icon={UserIcon}
                placeholder="Display name"
                value={name}
                onChange={setName}
                testid="input-name"
              />
            )}
            <InputRow
              Icon={EnvelopeSimple}
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
              testid="input-email"
            />
            <InputRow
              Icon={LockKey}
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
              testid="input-password"
            />

            {error && (
              <div className="flex items-start gap-2 text-[12px] text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl px-3 py-2">
                <Warning size={14} weight="fill" className="mt-0.5 shrink-0" />
                <span data-testid="auth-error">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-black dark:bg-white text-white dark:text-black rounded-full py-3.5 font-semibold text-[14px] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              data-testid="submit-auth"
            >
              {busy ? "…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-800" />
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 dark:text-zinc-500">
              or continue with
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-800" />
          </div>

          <div className="space-y-2">
            <button
              onClick={continueWithGoogle}
              className="w-full border border-gray-200 dark:border-zinc-700 text-black dark:text-white rounded-full py-3 font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
              data-testid="google-auth-btn"
            >
              <GoogleLogo />
              Continue with Google
            </button>

            <FarcasterLoginButton />
          </div>

          <div className="text-center mb-5 pt-4 text-[13px] text-gray-500 dark:text-zinc-400">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  className="font-semibold text-black dark:text-white hover:underline"
                  data-testid="switch-to-register"
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className="font-semibold text-black dark:text-white hover:underline"
                  data-testid="switch-to-login"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InputRow({ Icon, type = "text", placeholder, value, onChange, testid }) {
  return (
    <div className="relative">
      <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-[14px] text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
        data-testid={testid}
      />
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
