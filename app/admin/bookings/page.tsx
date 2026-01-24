import { db } from "@/lib/db";
import { bookings, services, availabilitySlots } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { Check, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import RefundButton from "@/components/admin/RefundButton";
import CancelBookingButton from "@/components/admin/CancelBookingButton";
import BookingsTable from "@/components/admin/BookingsTable";

async function updateBookingStatus(id: string, status: string) {
  "use server";

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
}

async function deleteBooking(id: string) {
  "use server";

  const booking = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);

  if (booking && booking.length > 0 && booking[0].slotId) {
    await db
      .update(availabilitySlots)
      .set({ isBooked: false })
      .where(eq(availabilitySlots.id, booking[0].slotId));
  }

  await db.delete(bookings).where(eq(bookings.id, id));
  revalidatePath("/admin/bookings");
}

export default async function AdminBookingsPage() {
  const allBookings = await db
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
    .orderBy(desc(bookings.date));

  // Stats
  const totalCount = allBookings.length;
  const pendingCount = allBookings.filter((b) => b.status === "pending").length;
  const confirmedCount = allBookings.filter((b) => b.status === "confirmed").length;
  const cancelledCount = allBookings.filter((b) => b.status === "cancelled").length;

  const stats = [
    { label: "Total", value: totalCount, color: "text-gray-900", bg: "bg-gray-50", border: "border-gray-200" },
    { label: "Pending", value: pendingCount, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    { label: "Confirmed", value: confirmedCount, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
    { label: "Cancelled", value: cancelledCount, color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  ];

  // Serialize bookings for client component (Dates -> ISO strings)
  const serializedBookings = allBookings.map((b) => ({
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
  for (const booking of allBookings) {
    actionSlots[booking.id] = (
      <>
        {booking.status === "pending" && (
          <form action={updateBookingStatus.bind(null, booking.id, "confirmed")}>
            <button
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
              title="Confirm"
            >
              <Check className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Confirm</span>
            </button>
          </form>
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
        <form action={deleteBooking.bind(null, booking.id)}>
          <button
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </form>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} border ${stat.border} rounded-xl px-3 sm:px-4 py-3`}
          >
            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            <p className={`text-lg sm:text-xl font-bold ${stat.color} mt-0.5`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Searchable Table */}
      <BookingsTable bookings={serializedBookings} actionSlots={actionSlots} />
    </div>
  );
}
