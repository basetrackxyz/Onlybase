import React from "react";
import { Link } from "react-router-dom";
import { Bell, PlusCircle, SealCheck } from "@phosphor-icons/react";
import MobileContainer from "../components/MobileContainer";
import PostCard from "../components/PostCard";
import { posts, creators } from "../data/mockData";

export default function FeedPage() {
  return (
    <MobileContainer>
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-black text-xl tracking-tight" data-testid="app-title">
              OnlyBase
            </span>
            <SealCheck weight="fill" size={18} className="text-[#0052FF]" />
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/create"
              className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center active:scale-95 transition-transform"
              data-testid="header-create-post"
            >
              <PlusCircle size={20} weight="fill" />
            </Link>
            <button
              className="w-9 h-9 rounded-full bg-gray-100 text-black flex items-center justify-center active:scale-95 transition-transform"
              data-testid="header-notifications"
            >
              <Bell size={18} weight="regular" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-6 border-t border-gray-50">
          <button className="py-3 text-[13px] font-bold text-black border-b-2 border-black -mb-px">
            For you
          </button>
          <button className="py-3 text-[13px] font-semibold text-gray-400 hover:text-black transition-colors">
            Following
          </button>
          <button className="py-3 text-[13px] font-semibold text-gray-400 hover:text-black transition-colors">
            Base
          </button>
        </div>
      </header>

      {/* Creator stories / suggested */}
      <div className="overflow-x-auto no-scrollbar border-b border-gray-100 bg-white">
        <div className="flex gap-3 px-4 py-4">
          {creators.map((c) => (
            <Link
              key={c.id}
              to={`/creator/${c.id}`}
              className="flex flex-col items-center gap-1.5 shrink-0 w-16"
              data-testid={`story-${c.id}`}
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#0052FF] to-black">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>
                {c.verified && (
                  <SealCheck
                    weight="fill"
                    size={14}
                    className="text-[#0052FF] absolute -bottom-0.5 -right-0.5 bg-white rounded-full"
                  />
                )}
              </div>
              <span className="text-[11px] font-medium text-gray-700 truncate w-full text-center">
                {c.handle.split("_")[0]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto" data-testid="feed-list">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
        <div className="h-6" />
      </div>
    </MobileContainer>
  );
}
