"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/bookings": "Bookings",
  "/admin/revenue": "Revenue",
  "/admin/services": "Services",
  "/admin/services/new": "Add Service",
  "/admin/availability": "Availability",
  "/admin/settings": "Settings",
};

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Admin";

  return (
    <header className="h-14 border-b border-gray-200 bg-white/80 backdrop-blur-sm flex items-center px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-1 mr-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <span className="text-gray-600 hidden sm:inline">Admin</span>
        <span className="text-gray-300 hidden sm:inline" aria-hidden="true">/</span>
        <span className="font-medium text-gray-800" aria-current="page">{title}</span>
      </nav>
    </header>
  );
}
