import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}

function buildHref(
  basePath: string,
  page: number,
  params: Record<string, string | undefined>
) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) searchParams.set(key, value);
  }
  if (page > 1) searchParams.set("page", String(page));
  const qs = searchParams.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function Pagination({
  page,
  totalPages,
  total,
  basePath,
  params = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const linkClasses =
    "inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400";
  const disabledClasses =
    "inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-100 text-gray-400";

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-4"
    >
      {page > 1 ? (
        <Link rel="prev" href={buildHref(basePath, page - 1, params)} className={linkClasses}>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClasses}>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Previous
        </span>
      )}

      <p className="text-sm text-gray-600">
        Page {page} of {totalPages} · {total} booking{total === 1 ? "" : "s"}
      </p>

      {page < totalPages ? (
        <Link rel="next" href={buildHref(basePath, page + 1, params)} className={linkClasses}>
          Next
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClasses}>
          Next
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
