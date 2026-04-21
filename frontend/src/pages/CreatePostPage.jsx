import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Image as ImageIcon, VideoCamera, Hash, Warning } from "@phosphor-icons/react";
import { currentUser } from "../data/mockData";

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [text, setText] = useState("");

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-stretch justify-center">
      <div className="relative w-full max-w-md min-h-screen bg-white flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
            data-testid="close-create"
          >
            <X size={18} weight="bold" />
          </button>
          <h1 className="font-display text-lg font-bold tracking-tight">New Post</h1>
          <button
            disabled={!text.trim()}
            className={`text-[13px] font-semibold px-4 py-2 rounded-full transition-all ${
              text.trim()
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-100 text-gray-400"
            }`}
            data-testid="publish-post"
          >
            Publish
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex gap-3">
            <img
              src={currentUser.avatar}
              alt=""
              className="w-11 h-11 rounded-full object-cover shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's happening onchain?"
                className="w-full h-36 resize-none outline-none text-[16px] placeholder:text-gray-400 leading-relaxed"
                data-testid="post-textarea"
              />
            </div>
          </div>

          {/* Content policy warning */}
          <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-3 flex gap-3">
            <Warning size={20} weight="fill" className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-[12px] font-bold text-red-600 mb-0.5">
                Content policy reminder
              </div>
              <div className="text-[11px] text-red-500 leading-relaxed">
                OnlyBase is strictly non-adult. Posting nude or sexual content will result in{" "}
                <strong>permanent account termination</strong> with no possibility of recovery.
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2">
          <ToolbarButton Icon={ImageIcon} label="Photo" testid="add-photo" />
          <ToolbarButton Icon={VideoCamera} label="Video" testid="add-video" />
          <ToolbarButton Icon={Hash} label="Tag" testid="add-tag" />
          <div className="ml-auto text-[11px] text-gray-400">{text.length}/500</div>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ Icon, label, testid }) {
  return (
    <button
      className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      data-testid={testid}
    >
      <Icon size={16} weight="fill" className="text-[#0052FF]" />
      <span className="text-[12px] font-semibold">{label}</span>
    </button>
  );
}
