import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  DotsThreeVertical,
  LockKey,
  CurrencyCircleDollar,
  ChatCircle,
  Image as ImageIcon,
  Lightning,
} from "@phosphor-icons/react";
import VerifiedBadge from "../components/VerifiedBadge";
import { creators, posts } from "../data/mockData";

export default function CreatorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const creator = creators.find((c) => c.id === id) || creators[0];
  const [tab, setTab] = useState("posts");
  const [following, setFollowing] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  const creatorPosts = posts.filter((p) => p.creatorId === creator.id);
  const gridPosts = posts.filter((p) => p.mediaUrl);

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-black flex items-stretch justify-center transition-colors">
      <div className="relative w-full max-w-md min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col shadow-2xl overflow-hidden">
        <div className="relative">
          <div className="h-40 w-full bg-cover bg-center" style={{ backgroundImage: `url(${creator.banner})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center"
            data-testid="creator-back"
          >
            <ArrowLeft size={18} weight="bold" />
          </button>
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center"
            data-testid="creator-menu"
          >
            <DotsThreeVertical size={18} weight="bold" />
          </button>
        </div>

        <div className="px-5 -mt-10 relative">
          <div className="flex items-end justify-between">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-20 h-20 rounded-full ring-4 ring-white dark:ring-[#0A0A0A] object-cover shadow-lg"
            />
            <div className="flex gap-2 pb-1">
              <button
                onClick={() => setFollowing(!following)}
                className={`text-[12px] font-semibold px-4 py-2 rounded-full transition-all ${
                  following
                    ? "bg-gray-100 dark:bg-zinc-800 text-black dark:text-white border border-gray-200 dark:border-zinc-700"
                    : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90"
                }`}
                data-testid="creator-follow-btn"
              >
                {following ? "Following" : "Follow"}
              </button>
              <button
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center active:scale-95 transition-transform"
                data-testid="creator-tip-btn"
              >
                <CurrencyCircleDollar size={18} weight="fill" className="text-[#FF4500]" />
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-xl font-bold tracking-tight text-black dark:text-white">{creator.name}</h1>
              {creator.verified && <VerifiedBadge size={18} />}
            </div>
            <p className="text-[13px] text-gray-500 dark:text-zinc-500 mb-2">@{creator.handle}</p>
            <p className="text-[14px] text-black dark:text-zinc-200 leading-relaxed mb-3">{creator.bio}</p>

            <div className="flex items-center gap-4 text-[12px] text-gray-500 dark:text-zinc-500 mb-4">
              <span>
                <strong className="text-black dark:text-white">{(creator.followers / 1000).toFixed(1)}k</strong> followers
              </span>
              <span>
                <strong className="text-black dark:text-white">{creator.posts}</strong> posts
              </span>
              <span className="font-mono text-[11px] truncate">{creator.walletAddress}</span>
            </div>
          </div>

          <button
            onClick={() => setShowSubModal(true)}
            className="w-full bg-[#0052FF] text-white rounded-2xl py-3 px-4 flex items-center justify-between hover:bg-[#0046d6] active:scale-[0.98] transition-all mb-4"
            data-testid="creator-subscribe-btn"
          >
            <div className="flex items-center gap-2">
              <LockKey size={18} weight="fill" />
              <span className="font-semibold text-[14px]">Subscribe to message</span>
            </div>
            <span className="font-display font-bold text-[15px]">${creator.messagePrice}/mo</span>
          </button>
        </div>

        <div className="flex border-b border-gray-100 dark:border-zinc-800 px-5 sticky top-0 bg-white dark:bg-[#0A0A0A] z-10">
          <TabButton label="Posts" active={tab === "posts"} onClick={() => setTab("posts")} testid="tab-posts" />
          <TabButton label="Media" active={tab === "media"} onClick={() => setTab("media")} testid="tab-media" />
          <TabButton label="About" active={tab === "about"} onClick={() => setTab("about")} testid="tab-about" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === "posts" && (
            <div>
              {creatorPosts.length === 0 ? (
                <div className="text-center text-gray-400 dark:text-zinc-500 py-12 text-[13px]">No posts yet</div>
              ) : (
                creatorPosts.map((p) => <InlinePost key={p.id} post={p} creator={creator} />)
              )}
            </div>
          )}

          {tab === "media" && (
            <div className="grid grid-cols-3 gap-0.5 p-0.5">
              {gridPosts.map((p) => (
                <Link to="/feed" key={p.id} className="aspect-square relative overflow-hidden group">
                  <img src={p.mediaUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1">
                    <ImageIcon size={12} weight="fill" className="text-white drop-shadow" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {tab === "about" && (
            <div className="px-5 py-5 space-y-4">
              <InfoRow label="Category" value={creator.category} />
              <InfoRow label="Wallet" value={creator.walletAddress} mono />
              <InfoRow label="Message price" value={`$${creator.messagePrice} USDC/month`} />
              <InfoRow label="Verified since" value="March 2025" />
              <InfoRow label="Network" value="Base Mainnet" />
            </div>
          )}

          <div className="h-10" />
        </div>

        {showSubModal && (
          <div className="absolute inset-0 bg-black/60 flex items-end z-50" onClick={() => setShowSubModal(false)}>
            <div className="w-full bg-white dark:bg-[#0A0A0A] rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-5" />
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0052FF]/10 mb-3">
                  <Lightning size={28} weight="fill" className="text-[#0052FF]" />
                </div>
                <h3 className="font-display text-2xl font-bold tracking-tight mb-2 text-black dark:text-white">
                  Message {creator.name}
                </h3>
                <p className="text-[13px] text-gray-600 dark:text-zinc-400 leading-relaxed">
                  Pay ${creator.messagePrice} USDC/month to unlock DMs. All posts remain free.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-4 mb-4 border border-gray-100 dark:border-zinc-800">
                <Row label="Subscription" value="Monthly" />
                <Row label="Price" value={`$${creator.messagePrice}.00 USDC`} />
                <Row label="Network" value="Base · ~$0.02 gas" />
              </div>

              <button
                className="w-full bg-[#0052FF] text-white rounded-full py-4 font-semibold text-[15px] hover:bg-[#0046d6] active:scale-[0.98] transition-all"
                data-testid="confirm-subscribe"
              >
                Subscribe with USDC
              </button>
              <button
                onClick={() => setShowSubModal(false)}
                className="w-full py-3 text-gray-500 dark:text-zinc-400 text-[13px] font-semibold mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between mb-2 last:mb-0 text-[13px]">
      <span className="text-gray-500 dark:text-zinc-500">{label}</span>
      <span className="font-semibold text-black dark:text-white">{value}</span>
    </div>
  );
}

function TabButton({ label, active, onClick, testid }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className={`flex-1 py-3 text-[13px] font-semibold transition-all ${
        active ? "text-black dark:text-white border-b-2 border-black dark:border-white -mb-px" : "text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function InlinePost({ post, creator }) {
  return (
    <article className="border-b border-gray-100 dark:border-zinc-800 px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <img src={creator.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-[14px] text-black dark:text-white">{creator.name}</span>
            {creator.verified && <VerifiedBadge size={12} />}
          </div>
          <span className="text-[11px] text-gray-500 dark:text-zinc-500">{post.createdAt}</span>
        </div>
      </div>
      <p className="text-[14px] whitespace-pre-line leading-relaxed mb-3 text-black dark:text-zinc-200">{post.content}</p>
      {post.mediaUrl && (
        <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800">
          <img src={post.mediaUrl} alt="" className="w-full aspect-[4/3] object-cover" />
        </div>
      )}
      <div className="flex items-center gap-6 text-gray-500 dark:text-zinc-400 mt-3 text-[12px] font-semibold">
        <span>♥ {post.likes.toLocaleString()}</span>
        <span className="flex items-center gap-1"><ChatCircle size={14} /> {post.comments}</span>
        <span className="flex items-center gap-1 text-[#FF4500]"><CurrencyCircleDollar size={14} weight="fill" /> {post.tips}</span>
      </div>
    </article>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-100 dark:border-zinc-800 last:border-0">
      <span className="text-[13px] text-gray-500 dark:text-zinc-500 font-medium shrink-0">{label}</span>
      <span className={`text-[13px] text-black dark:text-white font-semibold text-right ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
