import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  SealCheck,
  Gear,
  ArrowUpRight,
  Wallet,
  ShieldCheck,
  CaretRight,
  Warning,
} from "@phosphor-icons/react";
import MobileContainer from "../components/MobileContainer";
import ThemeToggle from "../components/ThemeToggle";
import { currentUser } from "../data/mockData";

export default function ProfilePage() {
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  return (
    <MobileContainer>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800 px-4 pt-4 pb-3 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-black dark:text-white" data-testid="profile-title">
          You
        </h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center"
            data-testid="profile-settings"
          >
            <Gear size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-6 pb-5 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-start justify-between mb-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-[#0A0A0A] shadow-md"
            />
            <button
              className="text-[12px] font-semibold px-4 py-2 rounded-full border border-gray-200 dark:border-zinc-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-900"
              data-testid="edit-profile"
            >
              Edit profile
            </button>
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <h2 className="font-display text-xl font-bold tracking-tight text-black dark:text-white">{currentUser.name}</h2>
            {currentUser.verified && <SealCheck weight="fill" size={18} className="text-[#0052FF]" />}
          </div>
          <p className="text-[13px] text-gray-500 dark:text-zinc-500 mb-3">@{currentUser.handle}</p>
          <p className="text-[13px] text-black dark:text-zinc-200 mb-4">
            Exploring onchain creators. Big fan of Base. Trading is a hobby, collecting is an obsession.
          </p>

          <Link
            to="/swap"
            className="flex items-center gap-3 bg-black dark:bg-[#111111] dark:ring-1 dark:ring-zinc-800 text-white rounded-2xl p-3 active:scale-[0.98] transition-transform"
            data-testid="profile-wallet-card"
          >
            <div className="w-9 h-9 rounded-full bg-[#0052FF] flex items-center justify-center">
              <Wallet size={18} weight="fill" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Wallet balance</div>
              <div className="font-display text-lg font-bold">
                ${currentUser.balance.total_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <ArrowUpRight size={20} />
          </Link>

          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <Stat label="Posts" value="3" />
            <Stat label="Following" value="28" />
            <Stat label="Followers" value="142" />
          </div>
        </div>

        {!currentUser.verified && (
          <div className="px-4 pt-5">
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 bg-gradient-to-br from-white to-gray-50 dark:from-[#111111] dark:to-[#0A0A0A]">
              <div className="absolute -right-6 -bottom-6 opacity-[0.08]">
                <SealCheck weight="fill" size={140} className="text-[#0052FF]" />
              </div>
              <div className="relative">
                <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#0052FF] mb-2">Monetize</div>
                <h3 className="font-display text-xl font-bold tracking-tight mb-2 text-black dark:text-white">
                  Become a verified creator
                </h3>
                <p className="text-[13px] text-gray-600 dark:text-zinc-400 mb-4 leading-relaxed">
                  Subscribe to the platform to earn a blue checkmark, set your DM price, and accept tips
                  from fans — all settled onchain on Base.
                </p>
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="w-full bg-[#0052FF] text-white rounded-full py-3 font-semibold text-[14px] hover:bg-[#0046d6] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  data-testid="get-verified-btn"
                >
                  <SealCheck weight="fill" size={16} />
                  Get verified — 9.99 USDC / month
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 pt-5 space-y-1">
          <MenuRow Icon={Wallet} label="Wallet & Transactions" testid="menu-wallet" />
          <MenuRow Icon={ShieldCheck} label="Content Policy" testid="menu-policy" />
          <MenuRow Icon={Warning} label="Reports & Safety" testid="menu-safety" danger />
        </div>

        <div className="px-5 py-5 text-[11px] text-gray-400 dark:text-zinc-500 leading-relaxed">
          OnlyBase has a strict no-NSFW policy. Posting adult content will result in permanent account
          termination with no recovery. Keep it onchain, keep it clean.
        </div>
      </div>

      {showVerifyModal && (
        <div
          className="absolute inset-0 bg-black/60 flex items-end z-50"
          onClick={() => setShowVerifyModal(false)}
          data-testid="verify-modal"
        >
          <div
            className="w-full bg-white dark:bg-[#0A0A0A] rounded-t-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-5" />
            <div className="text-center mb-6">
              <SealCheck weight="fill" size={56} className="text-[#0052FF] mx-auto mb-3" />
              <h3 className="font-display text-2xl font-bold tracking-tight mb-2 text-black dark:text-white">
                Get the blue checkmark
              </h3>
              <p className="text-[13px] text-gray-600 dark:text-zinc-400 leading-relaxed">
                Pay 9.99 USDC/month onchain to unlock verified creator status.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <Perk label="Blue verified badge across the app" />
              <Perk label="Set your own DM subscription price" />
              <Perk label="Accept tips from fans onchain" />
              <Perk label="Appear in Discover & Trending" />
            </div>

            <button
              className="w-full bg-[#0052FF] text-white rounded-full py-4 font-semibold text-[15px] hover:bg-[#0046d6] active:scale-[0.98] transition-all"
              data-testid="confirm-verify"
            >
              Confirm & pay with USDC
            </button>
            <button
              onClick={() => setShowVerifyModal(false)}
              className="w-full py-3 text-gray-500 dark:text-zinc-400 text-[13px] font-semibold mt-1"
              data-testid="cancel-verify"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </MobileContainer>
  );
}

function Stat({ label, value }) {
  return (
    <div className="py-2">
      <div className="font-display text-lg font-bold text-black dark:text-white">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 font-semibold">{label}</div>
    </div>
  );
}

function MenuRow({ Icon, label, testid, danger }) {
  return (
    <button
      className="w-full flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl active:bg-gray-50 dark:active:bg-zinc-900 transition-colors"
      data-testid={testid}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${danger ? "bg-red-50 dark:bg-red-500/10 text-red-500" : "bg-gray-100 dark:bg-zinc-800 text-black dark:text-white"}`}>
        <Icon size={16} weight="fill" />
      </div>
      <span className={`flex-1 text-left text-[14px] font-semibold ${danger ? "text-red-500" : "text-black dark:text-white"}`}>
        {label}
      </span>
      <CaretRight size={14} className="text-gray-400 dark:text-zinc-500" />
    </button>
  );
}

function Perk({ label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-[#0052FF]/10 flex items-center justify-center shrink-0">
        <SealCheck weight="fill" size={12} className="text-[#0052FF]" />
      </div>
      <span className="text-[13px] text-black dark:text-white">{label}</span>
    </div>
  );
}
