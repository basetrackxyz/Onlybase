import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { House, Compass, ArrowsLeftRight, ChatCircle, User } from "@phosphor-icons/react";

const tabs = [
  { to: "/feed", label: "Home", Icon: House, testid: "nav-home" },
  { to: "/discover", label: "Discover", Icon: Compass, testid: "nav-discover" },
  { to: "/swap", label: "Swap", Icon: ArrowsLeftRight, testid: "nav-swap" },
  { to: "/messages", label: "Messages", Icon: ChatCircle, testid: "nav-messages" },
  { to: "/profile", label: "Profile", Icon: User, testid: "nav-profile" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="sticky bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-gray-100 dark:border-zinc-800 z-40"
      data-testid="bottom-nav"
    >
      <div className="grid grid-cols-5 px-2 pt-2 pb-3">
        {tabs.map(({ to, label, Icon, testid }) => {
          const active = pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              data-testid={testid}
              className="flex flex-col items-center gap-1 py-1 transition-all duration-200"
            >
              <Icon
                size={24}
                weight={active ? "fill" : "regular"}
                className={active ? "text-black dark:text-white" : "text-gray-400 dark:text-zinc-500"}
              />
              <span
                className={`text-[10px] font-semibold tracking-wide ${
                  active ? "text-black dark:text-white" : "text-gray-400 dark:text-zinc-500"
                }`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
