"use client";

import Image from "next/image";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { formatPrice } from "@/lib/pricing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string; // serialized from server
  status: string | null;
  serviceName: string | null;
  price: string | null;
  paymentStatus: string | null;
  amountPaid: number | null;
  amountRefunded: number | null;
  hairPhotoUrl: string | null;
}

interface BookingsTableProps {
  bookings: Booking[];
  /** Server-rendered action cells keyed by booking ID */
  actionSlots: Record<string, React.ReactNode>;
  /** True when a status filter or search query is active */
  hasFilters?: boolean;
}

export default function BookingsTable({ bookings, actionSlots, hasFilters = false }: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center">
        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
        <p className="text-gray-600 font-medium">
          {hasFilters ? "No bookings match your filters" : "No bookings yet"}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {hasFilters
            ? "Try adjusting the status filter or search query"
            : "Bookings will appear here when customers make reservations"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <caption className="sr-only">
              Bookings with customer, hair photo, service, date, status, payment and actions
            </caption>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Photo
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Service
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment
                </th>
                <th scope="col" className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr
                  key={booking.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-50 flex items-center justify-center text-gold-700 text-xs font-bold shrink-0">
                        {booking.customerName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.customerName}
                        </p>
                        <p className="text-xs text-gray-500">{booking.customerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <HairPhotoCell
                      url={booking.hairPhotoUrl}
                      customerName={booking.customerName}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-900">{booking.serviceName}</p>
                    <p className="text-xs text-gray-500">{booking.price}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-900">
                      {format(new Date(booking.date), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(booking.date), "h:mm a")}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-5 py-4">
                    <PaymentInfo booking={booking} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {actionSlots[booking.id]}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3"
          >
            {/* Customer + Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gold-50 flex items-center justify-center text-gold-700 text-sm font-bold shrink-0">
                  {booking.customerName?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {booking.customerName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {booking.customerEmail}
                  </p>
                </div>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            {/* Details row */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                {booking.hairPhotoUrl && (
                  <HairPhotoCell
                    url={booking.hairPhotoUrl}
                    customerName={booking.customerName}
                  />
                )}
                <div>
                  <p className="text-gray-900">{booking.serviceName}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(booking.date), "MMM d, yyyy · h:mm a")}
                  </p>
                </div>
              </div>
              <PaymentInfo booking={booking} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
              {actionSlots[booking.id]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HairPhotoCell({
  url,
  customerName,
}: {
  url: string | null;
  customerName: string;
}) {
  if (!url) return <span className="text-gray-300">—</span>;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`View ${customerName}'s hair photo`}
          className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 ring-1 ring-gray-200 hover:ring-gold-400 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <Image src={url} alt="" fill sizes="40px" className="object-cover" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Hair photo — {customerName}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[60vh]">
          <Image
            src={url}
            alt={`${customerName}'s hair photo`}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const styles =
    status === "confirmed"
      ? "bg-green-50 text-green-700"
      : status === "cancelled"
      ? "bg-red-50 text-red-700"
      : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${styles}`}
    >
      {status || "pending"}
    </span>
  );
}

function PaymentInfo({ booking }: { booking: Booking }) {
  const payStyles =
    booking.paymentStatus === "succeeded"
      ? "bg-green-50 text-green-700"
      : booking.paymentStatus === "failed"
      ? "bg-red-50 text-red-700"
      : booking.paymentStatus === "refunded"
      ? "bg-purple-50 text-purple-700"
      : "bg-gray-50 text-gray-600";

  return (
    <div className="space-y-1">
      <span
        className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${payStyles}`}
      >
        {booking.paymentStatus || "pending"}
      </span>
      {booking.amountPaid !== null && booking.amountPaid > 0 && (
        <p className="text-xs text-gray-500">
          Paid:{" "}
          <span className="font-medium text-green-600">
            {formatPrice(booking.amountPaid)}
          </span>
        </p>
      )}
      {booking.amountRefunded !== null && booking.amountRefunded > 0 && (
        <p className="text-xs text-gray-500">
          Refunded:{" "}
          <span className="font-medium text-purple-600">
            {formatPrice(booking.amountRefunded)}
          </span>
        </p>
      )}
    </div>
  );
}
