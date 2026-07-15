"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  DollarSign,
  Clock,
  LogOut,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";

interface SidebarProps {
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/bookings",
    label: "Bookings",
    icon: Calendar,
  },
  {
    href: "/admin/revenue",
    label: "Revenue",
    icon: DollarSign,
  },
  {
    href: "/admin/services",
    label: "Services",
    icon: Scissors,
  },
  {
    href: "/admin/availability",
    label: "Availability",
    icon: Clock,
  },
];

export default function Sidebar({ userName, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose();
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 text-gray-900 flex flex-col
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <Link
            href="/admin"
            className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <span className="block text-xl font-serif font-bold text-gold-500 tracking-tight">
              Noella Admin
            </span>
            <p className="text-xs text-gray-600 mt-0.5">Management Dashboard</p>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400
                  ${
                    active
                      ? "bg-gold-500/15 text-gold-700 border-l-[3px] border-gold-500 shadow-sm"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
              >
                <Icon className={`w-[18px] h-[18px] ${active ? "text-gold-600" : "text-gray-500"}`} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-700 text-sm font-bold">
              {userName?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-600">Admin</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <LogOut className="w-[18px] h-[18px]" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
