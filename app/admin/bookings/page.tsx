import { db } from "@/lib/db";
import { bookings, services, availabilitySlots } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { formatPrice } from "@/lib/pricing";
import RefundButton from "@/components/admin/RefundButton";
import CancelBookingButton from "@/components/admin/CancelBookingButton";

// Server Action for updating status (simpler than API route for this case)
async function updateBookingStatus(id: string, status: string) {
  "use server";

  // Get booking details
  const booking = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);

  if (booking && booking.length > 0) {
    const bookingData = booking[0];

    // Update booking status
    await db.update(bookings).set({ status }).where(eq(bookings.id, id));

    // If confirming, ensure slot is marked as booked
    if (status === 'confirmed' && bookingData.slotId) {
      await db.update(availabilitySlots)
        .set({ isBooked: true })
        .where(eq(availabilitySlots.id, bookingData.slotId));
    }
  }

  revalidatePath("/admin/bookings");
}

async function deleteBooking(id: string) {
  "use server";

  // Get booking to release slot
  const booking = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);

  if (booking && booking.length > 0 && booking[0].slotId) {
    // Release the slot before deleting
    await db.update(availabilitySlots)
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Bookings</h2>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allBookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                  <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.serviceName}</div>
                  <div className="text-sm text-gray-500">{booking.price}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{format(booking.date, "MMM d, yyyy")}</div>
                  <div className="text-sm text-gray-500">{format(booking.date, "h:mm a")}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${booking.paymentStatus === 'succeeded' ? 'bg-green-100 text-green-800' :
                          booking.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                          booking.paymentStatus === 'refunded' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {booking.paymentStatus || 'pending'}
                      </span>
                    </div>
                    {booking.amountPaid !== null && booking.amountPaid > 0 && (
                      <div className="text-xs text-gray-600">
                        Paid: <span className="font-semibold text-green-600">{formatPrice(booking.amountPaid)}</span>
                      </div>
                    )}
                    {booking.amountRefunded !== null && booking.amountRefunded > 0 && (
                      <div className="text-xs text-gray-600">
                        Refunded: <span className="font-semibold text-purple-600">{formatPrice(booking.amountRefunded)}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {booking.status === 'pending' && (
                        <form action={updateBookingStatus.bind(null, booking.id, 'confirmed')}>
                            <button className="text-green-600 hover:text-green-900 p-1" title="Confirm">
                                <Check className="w-5 h-5" />
                            </button>
                        </form>
                    )}
                    {booking.status !== 'cancelled' && (
                      <CancelBookingButton
                        bookingId={booking.id}
                        paymentIntentId={booking.stripePaymentIntentId}
                        amountPaid={booking.amountPaid}
                        paymentStatus={booking.paymentStatus}
                      />
                    )}
                    {booking.paymentStatus === 'succeeded' && booking.stripePaymentIntentId && booking.status !== 'cancelled' && (
                      <RefundButton
                        bookingId={booking.id}
                        paymentIntentId={booking.stripePaymentIntentId}
                        amountPaid={booking.amountPaid || 0}
                      />
                    )}
                    <form action={deleteBooking.bind(null, booking.id)}>
                        <button className="text-gray-400 hover:text-red-600 p-1 ml-2" title="Delete">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
