import React from "react";
import { Heart, ChatCircleText, CurrencyCircleDollar, ShareFat } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import VerifiedBadge from "./VerifiedBadge";
import { creators } from "../data/mockData";

export default function PostCard({ post }) {
  const creator = creators.find((c) => c.id === post.creatorId);
  if (!creator) return null;

  return (
    <article
      className="border-b border-gray-100 dark:border-zinc-800 px-4 py-4 active:bg-gray-50 dark:active:bg-zinc-900 transition-colors duration-150"
      data-testid={`post-${post.id}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <Link to={`/creator/${creator.id}`} className="shrink-0" data-testid={`post-avatar-${post.id}`}>
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-11 h-11 rounded-full object-cover ring-1 ring-gray-100 dark:ring-zinc-800"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Link
              to={`/creator/${creator.id}`}
              className="font-semibold text-[15px] text-black dark:text-white truncate hover:underline"
            >
              {creator.name}
            </Link>
            {creator.verified && <VerifiedBadge size={16} />}
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-500 truncate">
            @{creator.handle} · {post.createdAt}
          </div>
        </div>
        <button
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
          data-testid={`post-follow-${post.id}`}
        >
          Follow
        </button>
      </div>

      <p className="text-[15px] leading-relaxed text-black dark:text-zinc-100 whitespace-pre-line mb-3">
        {post.content}
      </p>

      {post.mediaUrl && (
        <div className="rounded-2xl overflow-hidden mb-3 border border-gray-100 dark:border-zinc-800">
          <img src={post.mediaUrl} alt="" className="w-full aspect-[4/3] object-cover" loading="lazy" />
        </div>
      )}

      <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400 pt-1">
        <button
          className="flex items-center gap-2 hover:text-red-500 transition-colors group"
          data-testid={`post-like-${post.id}`}
        >
          <Heart size={20} weight="regular" className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold">{post.likes.toLocaleString()}</span>
        </button>
        <button
          className="flex items-center gap-2 hover:text-black dark:hover:text-white transition-colors"
          data-testid={`post-comment-${post.id}`}
        >
          <ChatCircleText size={20} />
          <span className="text-xs font-semibold">{post.comments}</span>
        </button>
        <button
          className="flex items-center gap-2 hover:text-[#0052FF] transition-colors"
          data-testid={`post-tip-${post.id}`}
        >
          <CurrencyCircleDollar size={20} />
          <span className="text-xs font-semibold">Tip · {post.tips}</span>
        </button>
        <button
          className="flex items-center gap-2 hover:text-black dark:hover:text-white transition-colors"
          data-testid={`post-share-${post.id}`}
        >
          <ShareFat size={20} />
        </button>
      </div>
    </article>
  );
}
