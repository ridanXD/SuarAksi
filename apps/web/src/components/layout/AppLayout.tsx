"use client";

import React, { useState, ReactNode } from "react";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
}

export function AppLayout({ children, showRightSidebar = true }: AppLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsDesktopCollapsed((prev) => !prev);
    } else {
      setIsMobileOpen((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black text-surface-900 dark:text-surface-100 flex flex-col transition-colors">
      <Header onToggleSidebar={handleToggleSidebar} />

      <div className="flex-1 w-full flex">
        <LeftSidebar
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          isDesktopCollapsed={isDesktopCollapsed}
        />

        <div
          className={cn(
            "flex-1 min-w-0 flex flex-col min-h-[calc(100vh-53px)] bg-white dark:bg-black",
            showRightSidebar && "border-r border-surface-200 dark:border-surface-800"
          )}
        >
          <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        </div>

        {showRightSidebar && <RightSidebar />}
      </div>

      <BottomNav />
    </div>
  );
}
