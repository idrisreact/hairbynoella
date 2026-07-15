import { db } from "@/lib/db";
import { bookings } from "@/lib/schema";
import { and, isNull, lt } from "drizzle-orm";

/** Bookings whose appointment date is older than this are eligible for archiving. */
export const ARCHIVE_AFTER_DAYS = 30;

/**
 * Soft-archives past bookings by stamping archived_at. Rows stay in the table
 * so revenue totals remain correct; the admin list hides them by default.
 * Returns the number of bookings archived.
 */
export async function archiveOldBookings(): Promise<number> {
    const cutoff = new Date(Date.now() - ARCHIVE_AFTER_DAYS * 24 * 60 * 60 * 1000);
    const archived = await db
        .update(bookings)
        .set({ archivedAt: new Date() })
        .where(and(isNull(bookings.archivedAt), lt(bookings.date, cutoff)))
        .returning({ id: bookings.id });
    return archived.length;
}
