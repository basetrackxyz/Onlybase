import React from "react";
import { useNavigate } from "react-router-dom";
import { SealCheck, ArrowRight, ShieldCheck, Lightning, Lock } from "@phosphor-icons/react";
import ThemeToggle from "../components/ThemeToggle";

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-black flex items-stretch justify-center transition-colors" data-testid="onboarding-page">
      <div className="relative w-full max-w-md min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex-1 flex flex-col px-6 pt-16 pb-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-2xl tracking-tight text-black dark:text-white">OnlyBase</span>
              <SealCheck weight="fill" size={22} className="text-[#0052FF]" />
            </div>
            <ThemeToggle />
          </div>

          <div className="mb-auto">
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 dark:text-zinc-500 mb-4">
              Creator economy · Onchain
            </div>
            <h1 className="font-display text-[44px] leading-[1.05] font-bold tracking-tight mb-5 text-black dark:text-white">
              A free feed.<br />
              Paid DMs.<br />
              <span className="text-[#0052FF]">All on Base.</span>
            </h1>
            <p className="text-[15px] text-gray-600 dark:text-zinc-400 leading-relaxed mb-8 max-w-sm">
              Follow verified creators, trade any token on Base, and subscribe to DM the ones you love.
              No gatekeeping. No adult content. Just onchain culture.
            </p>

            <div className="space-y-3 mb-10">
              <Feature Icon={SealCheck} title="Blue-check creators" sub="Subscribe to the platform to earn onchain." iconClass="text-[#0052FF]" />
              <Feature Icon={Lightning} title="Swap any Base token" sub="ETH, cbBTC, AERO, DEGEN & more. Instant." iconClass="text-black dark:text-white" />
              <Feature Icon={Lock} title="Private DMs" sub="Message creators by subscribing at their price." iconClass="text-black dark:text-white" />
              <Feature Icon={ShieldCheck} title="Zero adult content" sub="NSFW posts = permanent ban. No recovery." iconClass="text-black dark:text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-black dark:bg-white text-white dark:text-black rounded-full py-4 font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-[0.98] transition-all"
              data-testid="onboarding-get-started"
            >
              Get started
              <ArrowRight size={18} weight="bold" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full border border-gray-200 dark:border-zinc-700 text-black dark:text-white rounded-full py-4 font-semibold text-[15px] hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
              data-testid="onboarding-connect-wallet"
            >
              Sign in
            </button>
            <p className="text-[11px] text-center text-gray-400 dark:text-zinc-500 pt-2 leading-relaxed">
              By continuing, you agree to the content policy.<br />
              Adult content results in permanent account termination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ Icon, title, sub, iconClass }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 flex items-center justify-center shrink-0">
        <Icon size={18} weight="fill" className={iconClass} />
      </div>
      <div className="pt-0.5">
        <div className="font-semibold text-[14px] text-black dark:text-white">{title}</div>
        <div className="text-xs text-gray-500 dark:text-zinc-500">{sub}</div>
      </div>
    </div>
  );
}
