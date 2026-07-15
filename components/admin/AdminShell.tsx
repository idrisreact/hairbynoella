"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";

interface AdminShellProps {
  userName: string;
  children: React.ReactNode;
}

export default function AdminShell({ userName, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the mobile drawer on Escape
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-white focus:px-3 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-medium focus:text-gray-900"
      >
        Skip to content
      </a>

      <Sidebar
        userName={userName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main id="admin-main" tabIndex={-1} className="flex-1 overflow-y-auto outline-none">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
