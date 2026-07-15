"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const STATUS_FILTERS = [
  { label: "All", value: undefined },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
] as const;

interface BookingsToolbarProps {
  status?: string;
  q?: string;
}

function buildHref(status: string | undefined, q: string | undefined) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/admin/bookings?${qs}` : "/admin/bookings";
}

export default function BookingsToolbar({ status, q }: BookingsToolbarProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(q ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep input in sync when the URL changes externally (e.g. status pill click)
  useEffect(() => {
    setSearchValue(q ?? "");
  }, [q]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const applySearch = (value: string) => {
    router.replace(buildHref(status, value.trim() || undefined));
  };

  const handleChange = (value: string) => {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => applySearch(value), 400);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Status filter pills */}
      <nav aria-label="Filter bookings by status" className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const isActive = filter.value === status || (!filter.value && !status);
          return (
            <Link
              key={filter.label}
              href={buildHref(filter.value, q)}
              aria-current={isActive ? "page" : undefined}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                isActive
                  ? "bg-gold-400 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {/* Search */}
      <form
        role="search"
        className="relative sm:ml-auto sm:w-64"
        onSubmit={(e) => {
          e.preventDefault();
          if (debounceRef.current) clearTimeout(debounceRef.current);
          applySearch(searchValue);
        }}
      >
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search by name or email..."
          aria-label="Search bookings"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
        />
      </form>
    </div>
  );
}
