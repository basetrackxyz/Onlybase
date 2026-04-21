import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlass, TrendUp, Fire } from "@phosphor-icons/react";
import MobileContainer from "../components/MobileContainer";
import VerifiedBadge from "../components/VerifiedBadge";
import ThemeToggle from "../components/ThemeToggle";
import { creators, categories, trending } from "../data/mockData";

export default function DiscoverPage() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? creators : creators.filter((c) => c.category === active);

  return (
    <MobileContainer>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-2xl font-bold tracking-tight text-black dark:text-white" data-testid="discover-title">
            Discover
          </h1>
          <ThemeToggle />
        </div>
        <div className="relative">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search creators, tokens, tags..."
            className="w-full bg-gray-100 dark:bg-zinc-900 text-black dark:text-white rounded-full pl-11 pr-4 py-3 text-[14px] font-medium placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            data-testid="discover-search-input"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-zinc-800">
          <div className="flex gap-2 px-4 py-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                data-testid={`category-${cat.toLowerCase()}`}
                className={`shrink-0 px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                  active === cat
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-white dark:bg-[#0A0A0A] text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <section className="px-4 py-5 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 mb-3">
            <Fire size={16} weight="fill" className="text-[#FF4500]" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 dark:text-zinc-500">
              Trending this week
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
            {trending.map((c) => (
              <Link
                key={c.id}
                to={`/creator/${c.id}`}
                className="shrink-0 w-40 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#111111]"
                data-testid={`trending-${c.id}`}
              >
                <div className="h-20 bg-cover bg-center" style={{ backgroundImage: `url(${c.banner})` }} />
                <div className="p-3 -mt-6 relative">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-[#111111] object-cover mb-2"
                  />
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-[13px] truncate text-black dark:text-white">{c.name}</span>
                    {c.verified && <VerifiedBadge size={12} />}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-zinc-500 mb-2">
                    {(c.followers / 1000).toFixed(1)}k followers
                  </div>
                  <div className="text-[11px] font-bold text-[#0052FF] flex items-center gap-1">
                    <TrendUp size={11} weight="bold" />
                    {c.category}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-4 py-5">
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 dark:text-zinc-500 mb-3">
            {active === "All" ? "All creators" : active}
          </div>
          <div className="space-y-3">
            {filtered.map((c) => (
              <Link
                key={c.id}
                to={`/creator/${c.id}`}
                className="flex items-center gap-3 py-2 active:bg-gray-50 dark:active:bg-zinc-900 transition-colors -mx-2 px-2 rounded-xl"
                data-testid={`creator-row-${c.id}`}
              >
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-12 h-12 rounded-full object-cover ring-1 ring-gray-100 dark:ring-zinc-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-[15px] truncate text-black dark:text-white">{c.name}</span>
                    {c.verified && <VerifiedBadge size={14} />}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-500 truncate">
                    @{c.handle} · {c.category}
                  </div>
                </div>
                <button className="text-[12px] font-semibold px-4 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity">
                  Follow
                </button>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </MobileContainer>
  );
}
