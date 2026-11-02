"use client";

import React, { ReactNode } from "react";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

interface AppLayoutProps {
  children: ReactNode;
  showRightSidebar?: boolean;
}

export function AppLayout({ children, showRightSidebar = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 flex justify-center">
      <div className="w-full max-w-7xl flex">
        <LeftSidebar />

        <div className="flex-1 min-w-0 flex flex-col min-h-screen border-r border-surface-200 bg-white">
          <Header />
          <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        </div>

        {showRightSidebar && <RightSidebar />}
      </div>

      <BottomNav />
    </div>
  );
}
