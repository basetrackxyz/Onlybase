import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlass, TrendUp, Fire } from "@phosphor-icons/react";
import MobileContainer from "../components/MobileContainer";
import VerifiedBadge from "../components/VerifiedBadge";
import { creators, categories, trending } from "../data/mockData";

export default function DiscoverPage() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? creators : creators.filter((c) => c.category === active);

  return (
    <MobileContainer>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 pt-4 pb-3">
        <h1 className="font-display text-2xl font-bold tracking-tight mb-3" data-testid="discover-title">
          Discover
        </h1>
        <div className="relative">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search creators, tokens, tags..."
            className="w-full bg-gray-100 rounded-full pl-11 pr-4 py-3 text-[14px] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
            data-testid="discover-search-input"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Category chips */}
        <div className="overflow-x-auto no-scrollbar border-b border-gray-100">
          <div className="flex gap-2 px-4 py-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                data-testid={`category-${cat.toLowerCase()}`}
                className={`shrink-0 px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                  active === cat
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Trending rail */}
        <section className="px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-1.5 mb-3">
            <Fire size={16} weight="fill" className="text-[#FF4500]" />
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">
              Trending this week
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
            {trending.map((c) => (
              <Link
                key={c.id}
                to={`/creator/${c.id}`}
                className="shrink-0 w-40 rounded-2xl overflow-hidden border border-gray-100 bg-white"
                data-testid={`trending-${c.id}`}
              >
                <div
                  className="h-20 bg-cover bg-center"
                  style={{ backgroundImage: `url(${c.banner})` }}
                />
                <div className="p-3 -mt-6 relative">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover mb-2"
                  />
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-[13px] truncate">{c.name}</span>
                    {c.verified && <VerifiedBadge size={12} />}
                  </div>
                  <div className="text-[11px] text-gray-500 mb-2">
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

        {/* Creator list */}
        <section className="px-4 py-5">
          <div className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 mb-3">
            {active === "All" ? "All creators" : active}
          </div>
          <div className="space-y-3">
            {filtered.map((c) => (
              <Link
                key={c.id}
                to={`/creator/${c.id}`}
                className="flex items-center gap-3 py-2 active:bg-gray-50 transition-colors -mx-2 px-2 rounded-xl"
                data-testid={`creator-row-${c.id}`}
              >
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-12 h-12 rounded-full object-cover ring-1 ring-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-[15px] truncate">{c.name}</span>
                    {c.verified && <VerifiedBadge size={14} />}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    @{c.handle} · {c.category}
                  </div>
                </div>
                <button className="text-[12px] font-semibold px-4 py-1.5 rounded-full bg-black text-white hover:bg-gray-800 transition-colors">
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
