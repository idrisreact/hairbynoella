import { db } from "@/lib/db";
import { bookings, services } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge"; // Assuming you have this or I'll use standard tailwind
import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";

// Server Action for updating status (simpler than API route for this case)
async function updateBookingStatus(id: string, status: string) {
  "use server";
  await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  revalidatePath("/admin/bookings");
}

async function deleteBooking(id: string) {
  "use server";
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
    })
    .from(bookings)
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .orderBy(desc(bookings.date));

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Bookings</h2>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {booking.status === 'pending' && (
                        <>
                            <form action={updateBookingStatus.bind(null, booking.id, 'confirmed')}>
                                <button className="text-green-600 hover:text-green-900 p-1" title="Confirm">
                                    <Check className="w-5 h-5" />
                                </button>
                            </form>
                            <form action={updateBookingStatus.bind(null, booking.id, 'cancelled')}>
                                <button className="text-red-600 hover:text-red-900 p-1" title="Cancel">
                                    <X className="w-5 h-5" />
                                </button>
                            </form>
                        </>
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
