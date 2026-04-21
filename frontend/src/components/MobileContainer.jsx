import React from "react";
import BottomNav from "./BottomNav";

export default function MobileContainer({ children, showNav = true }) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-black flex items-stretch justify-center transition-colors duration-200">
      <div
        className="relative w-full max-w-md min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col shadow-2xl overflow-hidden"
        data-testid="mobile-container"
      >
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
