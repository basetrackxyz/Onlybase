import React from "react";
import { Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      onClick={toggleTheme}
      data-testid="theme-toggle"
      aria-label="Toggle theme"
      className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all bg-gray-100 dark:bg-zinc-800 text-black dark:text-white ${className}`}
    >
      {dark ? (
        <Sun size={18} weight="fill" className="text-[#FFB020]" />
      ) : (
        <Moon size={18} weight="fill" />
      )}
    </button>
  );
}
