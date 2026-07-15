import { db } from "@/lib/db";
import { bookings, services, availabilitySlots } from "@/lib/schema";
import { desc, eq, and, or, ilike, sql, isNull, isNotNull, type SQL } from "drizzle-orm";
import { Archive, Check, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { archiveOldBookings, ARCHIVE_AFTER_DAYS } from "@/lib/archive-bookings";
import RefundButton from "@/components/admin/RefundButton";
import CancelBookingButton from "@/components/admin/CancelBookingButton";
import BookingsTable from "@/components/admin/BookingsTable";
import BookingsToolbar from "@/components/admin/BookingsToolbar";
import Pagination from "@/components/admin/Pagination";
import ActionButton, { type ActionResult } from "@/components/admin/ActionButton";

const PAGE_SIZE = 20;
const STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;

async function updateBookingStatus(id: string, status: string): Promise<ActionResult> {
  "use server";

  const session = await getAdminSession();
  if (!session) return { success: false, message: "Unauthorized" };

  try {
    const booking = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);

    if (booking && booking.length > 0) {
      const bookingData = booking[0];
      await db.update(bookings).set({ status }).where(eq(bookings.id, id));

      if (status === "confirmed" && bookingData.slotId) {
        await db
          .update(availabilitySlots)
          .set({ isBooked: true })
          .where(eq(availabilitySlots.id, bookingData.slotId));
      }
    }

    revalidatePath("/admin/bookings");
    return { success: true, message: `Booking ${status}` };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, message: "Failed to update booking" };
  }
}

async function archiveOldBookingsAction(): Promise<ActionResult> {
  "use server";

  const session = await getAdminSession();
  if (!session) return { success: false, message: "Unauthorized" };

  try {
    const count = await archiveOldBookings();
    revalidatePath("/admin/bookings");
    return {
      success: true,
      message: count > 0 ? `Archived ${count} past booking${count === 1 ? "" : "s"}` : "Nothing to archive",
    };
  } catch (error) {
    console.error("Error archiving bookings:", error);
    return { success: false, message: "Failed to archive bookings" };
  }
}

async function deleteBooking(id: string): Promise<ActionResult> {
  "use server";

  const session = await getAdminSession();
  if (!session) return { success: false, message: "Unauthorized" };

  try {
    const booking = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);

    if (booking && booking.length > 0 && booking[0].slotId) {
      await db
        .update(availabilitySlots)
        .set({ isBooked: false })
        .where(eq(availabilitySlots.id, booking[0].slotId));
    }

    await db.delete(bookings).where(eq(bookings.id, id));
    revalidatePath("/admin/bookings");
    return { success: true, message: "Booking deleted" };
  } catch (error) {
    console.error("Error deleting booking:", error);
    return { success: false, message: "Failed to delete booking" };
  }
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}) {
  const { page: pageParam, status, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const showArchived = status === "archived";
  const statusFilter = STATUSES.includes(status as (typeof STATUSES)[number])
    ? status
    : undefined;
  const search = q?.trim();

  const conditions: (SQL | undefined)[] = [
    showArchived ? isNotNull(bookings.archivedAt) : isNull(bookings.archivedAt),
  ];
  if (statusFilter) conditions.push(eq(bookings.status, statusFilter));
  if (search) {
    conditions.push(
      or(
        ilike(bookings.customerName, `%${search}%`),
        ilike(bookings.customerEmail, `%${search}%`)
      )
    );
  }
  const where = and(...conditions);

  const [pageBookings, totalResult, statusCounts] = await Promise.all([
    db
      .select({
        id: bookings.id,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        date: bookings.date,
        status: bookings.status,
        serviceName: services.name,
        price: services.price,
        paymentStatus: bookings.paymentStatus,
        depositAmount: bookings.depositAmount,
        amountPaid: bookings.amountPaid,
        amountRefunded: bookings.amountRefunded,
        stripePaymentIntentId: bookings.stripePaymentIntentId,
      })
      .from(bookings)
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(where)
      .orderBy(desc(bookings.date))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ count: sql<number>`count(*)` }).from(bookings).where(where),
    db
      .select({ status: bookings.status, count: sql<number>`count(*)` })
      .from(bookings)
      .where(isNull(bookings.archivedAt))
      .groupBy(bookings.status),
  ]);

  const total = Number(totalResult[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Global stats (unaffected by filters)
  const countFor = (s: string) =>
    Number(statusCounts.find((c) => c.status === s)?.count ?? 0);
  const totalCount = statusCounts.reduce((sum, c) => sum + Number(c.count), 0);

  const stats = [
    { label: "Total", value: totalCount, color: "text-gray-900", bg: "bg-gray-50", border: "border-gray-200" },
    { label: "Pending", value: countFor("pending"), color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    { label: "Confirmed", value: countFor("confirmed"), color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
    { label: "Cancelled", value: countFor("cancelled"), color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  ];

  // Serialize bookings for client component (Dates -> ISO strings)
  const serializedBookings = pageBookings.map((b) => ({
    id: b.id,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    date: b.date.toISOString(),
    status: b.status,
    serviceName: b.serviceName,
    price: b.price,
    paymentStatus: b.paymentStatus,
    amountPaid: b.amountPaid,
    amountRefunded: b.amountRefunded,
  }));

  // Build action slots as server-rendered JSX keyed by booking ID
  const actionSlots: Record<string, React.ReactNode> = {};
  for (const booking of pageBookings) {
    actionSlots[booking.id] = (
      <>
        {booking.status === "pending" && (
          <ActionButton
            action={updateBookingStatus.bind(null, booking.id, "confirmed")}
            aria-label="Confirm booking"
            title="Confirm"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Confirm</span>
          </ActionButton>
        )}
        {booking.status !== "cancelled" && (
          <CancelBookingButton
            bookingId={booking.id}
            paymentIntentId={booking.stripePaymentIntentId}
            amountPaid={booking.amountPaid}
            paymentStatus={booking.paymentStatus}
          />
        )}
        {booking.paymentStatus === "succeeded" &&
          booking.stripePaymentIntentId &&
          booking.status !== "cancelled" && (
            <RefundButton
              bookingId={booking.id}
              paymentIntentId={booking.stripePaymentIntentId}
              amountPaid={booking.amountPaid || 0}
            />
          )}
        <ActionButton
          action={deleteBooking.bind(null, booking.id)}
          confirm={{
            title: "Delete booking?",
            description: `This permanently removes ${booking.customerName}'s booking and frees its slot. This cannot be undone.`,
            actionLabel: "Delete",
          }}
          aria-label="Delete booking"
          title="Delete"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </ActionButton>
      </>
    );
  }

  const hasFilters = Boolean(statusFilter || search || showArchived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <ActionButton
          action={archiveOldBookingsAction}
          confirm={{
            title: "Archive old bookings?",
            description: `Bookings with an appointment date more than ${ARCHIVE_AFTER_DAYS} days ago will be hidden from this list. They stay available under the Archived filter and still count toward revenue.`,
            actionLabel: "Archive",
          }}
          aria-label="Archive old bookings"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-50"
        >
          <Archive className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Archive old bookings</span>
        </ActionButton>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} border ${stat.border} rounded-xl px-3 sm:px-4 py-3`}
          >
            <p className="text-xs font-medium text-gray-600">{stat.label}</p>
            <p className={`text-lg sm:text-xl font-bold ${stat.color} mt-0.5`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <BookingsToolbar status={statusFilter} q={search} />

      {/* Table */}
      <BookingsTable
        bookings={serializedBookings}
        actionSlots={actionSlots}
        hasFilters={hasFilters}
      />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        basePath="/admin/bookings"
        params={{ status: statusFilter, q: search }}
      />
    </div>
  );
}
