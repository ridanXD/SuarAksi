"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Beralih ke mode ${theme === "light" ? "gelap" : "terang"}`}
      title={`Mode ${theme === "light" ? "Gelap" : "Terang"}`}
      className={cn(
        "flex items-center gap-3 p-2 rounded-full text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors cursor-pointer select-none",
        showLabel && "w-full px-3.5 py-2.5 rounded-lg text-sm font-medium",
        className
      )}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {theme === "light" ? (
          <Moon className="w-5 h-5 text-surface-700 transition-transform duration-300 rotate-0" />
        ) : (
          <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0" />
        )}
      </div>
      {showLabel && (
        <span className="text-surface-800 dark:text-surface-200">
          {theme === "light" ? "Mode Gelap" : "Mode Terang"}
        </span>
      )}
    </button>
  );
}
