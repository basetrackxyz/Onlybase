import React from "react";
import { Link } from "react-router-dom";
import { Lock, LockKey, MagnifyingGlass } from "@phosphor-icons/react";
import MobileContainer from "../components/MobileContainer";
import VerifiedBadge from "../components/VerifiedBadge";
import ThemeToggle from "../components/ThemeToggle";
import { conversations, creators } from "../data/mockData";

export default function MessagesPage() {
  return (
    <MobileContainer>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-2xl font-bold tracking-tight text-black dark:text-white" data-testid="messages-title">
            Messages
          </h1>
          <ThemeToggle />
        </div>
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-gray-100 dark:bg-zinc-900 text-black dark:text-white rounded-full pl-10 pr-4 py-2.5 text-[13px] font-medium placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none"
            data-testid="messages-search"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-4 mt-4 bg-[#0052FF]/5 dark:bg-[#0052FF]/15 border border-[#0052FF]/20 rounded-2xl p-3 flex gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0052FF] flex items-center justify-center shrink-0">
            <LockKey size={16} weight="fill" className="text-white" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-black dark:text-white">Private DMs</div>
            <div className="text-[11px] text-gray-600 dark:text-zinc-400 leading-relaxed">
              Subscribe to a creator at their price to unlock messaging. Posts stay free for everyone.
            </div>
          </div>
        </div>

        <div className="mt-4" data-testid="conversations-list">
          {conversations.map((conv) => {
            const creator = creators.find((c) => c.id === conv.creatorId);
            if (!creator) return null;
            return (
              <Link
                key={conv.id}
                to={`/messages/${conv.id}`}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-zinc-800 active:bg-gray-50 dark:active:bg-zinc-900 transition-colors"
                data-testid={`conv-${conv.id}`}
              >
                <div className="relative shrink-0">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className={`w-12 h-12 rounded-full object-cover ring-1 ring-gray-100 dark:ring-zinc-800 ${!conv.subscribed ? "grayscale-[40%]" : ""}`}
                  />
                  {!conv.subscribed && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                      <Lock size={16} weight="fill" className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-[14px] truncate text-black dark:text-white">{creator.name}</span>
                    {creator.verified && <VerifiedBadge size={13} />}
                  </div>
                  <div className={`text-[12px] truncate ${conv.subscribed ? "text-gray-600 dark:text-zinc-400" : "text-gray-400 dark:text-zinc-500 italic"}`}>
                    {conv.lastMessage}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">{conv.lastTime}</span>
                  {conv.unread > 0 ? (
                    <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold flex items-center justify-center">
                      {conv.unread}
                    </span>
                  ) : !conv.subscribed ? (
                    <span className="text-[10px] font-bold text-[#0052FF]">${creator.messagePrice}/mo</span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </MobileContainer>
  );
}
