import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { CalendarX, Clock, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { bookings, availabilitySlots, services } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/pricing";
import {
    SELF_CANCEL_CUTOFF_HOURS,
    AUTO_REFUND_CUTOFF_HOURS,
    hoursUntil,
} from "@/lib/booking-policy";
import { CancelBookingSection } from "@/components/booking/CancelBookingSection";

// Always reflect the booking's current status (never serve a cached page).
export const dynamic = "force-dynamic";

export const metadata = {
    title: "Manage your booking — Hair by Noella",
    robots: { index: false, follow: false },
};

function formatAppointmentTime(date: Date): string {
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(date);
}

export default async function ManageBookingPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    if (!token || token.length < 20) notFound();

    const rows = await db
        .select({
            booking: bookings,
            serviceName: services.name,
            slotStartTime: availabilitySlots.startTime,
        })
        .from(bookings)
        .leftJoin(services, eq(bookings.serviceId, services.id))
        .leftJoin(availabilitySlots, eq(bookings.slotId, availabilitySlots.id))
        .where(eq(bookings.manageToken, token))
        .limit(1);

    if (rows.length === 0) notFound();

    const { booking, serviceName, slotStartTime } = rows[0];
    const appointmentTime = slotStartTime ?? booking.date;
    const hoursAhead = hoursUntil(appointmentTime);

    const isCancelled = booking.status === "cancelled";
    const isPast = booking.status === "completed" || hoursAhead <= 0;
    const withinCutoff = hoursAhead < SELF_CANCEL_CUTOFF_HOURS;
    const refundEligible = hoursAhead >= AUTO_REFUND_CUTOFF_HOURS;
    const contactEmail = process.env.EMAIL_REPLY_TO;

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            <section className="pt-40 pb-20 px-4">
                <div className="mx-auto max-w-2xl">
                    <div className="bg-white p-8 sm:p-12 rounded-lg shadow-xl border border-gold-400/20">
                        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-dark-400 mb-2 text-center">
                            Your Booking
                        </h1>
                        <p className="text-center text-gold-600 font-semibold mb-8">
                            Reference: {booking.id.slice(0, 8).toUpperCase()}
                        </p>

                        {/* Booking details */}
                        <div className="bg-gold-50 border border-gold-200 rounded-lg p-6 mb-8">
                            <dl className="space-y-3">
                                <div className="flex justify-between gap-4 text-sm">
                                    <dt className="text-gray-600">Service</dt>
                                    <dd className="font-semibold text-dark-400 text-right">
                                        {serviceName ?? "Appointment"}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-4 text-sm">
                                    <dt className="text-gray-600">Date &amp; time</dt>
                                    <dd className="font-semibold text-dark-400 text-right">
                                        {formatAppointmentTime(appointmentTime)}
                                    </dd>
                                </div>
                                {(booking.amountPaid ?? 0) > 0 && (
                                    <div className="flex justify-between gap-4 text-sm">
                                        <dt className="text-gray-600">Deposit paid</dt>
                                        <dd className="font-semibold text-dark-400 text-right">
                                            {formatPrice(booking.amountPaid ?? 0)}
                                        </dd>
                                    </div>
                                )}
                                <div className="flex justify-between gap-4 text-sm">
                                    <dt className="text-gray-600">Status</dt>
                                    <dd
                                        className={`font-semibold text-right capitalize ${
                                            isCancelled ? "text-red-600" : "text-green-600"
                                        }`}
                                    >
                                        {booking.status ?? "pending"}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {isCancelled ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-center">
                                <CalendarX className="w-8 h-8 text-red-400 mx-auto mb-2" aria-hidden="true" />
                                <p className="font-semibold text-red-700">
                                    This booking has been cancelled.
                                </p>
                                {booking.paymentStatus === "refunded" && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Your deposit refund is on its way — it usually appears
                                        within 5–10 business days.
                                    </p>
                                )}
                            </div>
                        ) : isPast ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 text-center">
                                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" aria-hidden="true" />
                                <p className="font-semibold text-gray-700">
                                    This appointment has passed.
                                </p>
                            </div>
                        ) : withinCutoff ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8 text-center">
                                <Phone className="w-8 h-8 text-amber-500 mx-auto mb-2" aria-hidden="true" />
                                <p className="font-semibold text-amber-800 mb-1">
                                    Your appointment is less than {SELF_CANCEL_CUTOFF_HOURS} hours away
                                </p>
                                <p className="text-sm text-gray-700">
                                    Cancellations this close to the appointment can&apos;t be made
                                    online — please contact us directly
                                    {contactEmail ? (
                                        <>
                                            {" "}at{" "}
                                            <a
                                                href={`mailto:${contactEmail}`}
                                                className="font-medium text-gold-600 underline"
                                            >
                                                {contactEmail}
                                            </a>
                                        </>
                                    ) : (
                                        ""
                                    )}
                                    .
                                </p>
                            </div>
                        ) : (
                            <CancelBookingSection
                                token={token}
                                refundEligible={refundEligible}
                                depositPaid={booking.amountPaid ?? 0}
                            />
                        )}

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                href="/"
                                className="px-8 py-3 bg-gold-500 text-white font-medium rounded-md hover:bg-gold-600 transition-colors text-center"
                            >
                                Return Home
                            </Link>
                            <Link
                                href="/services"
                                className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors text-center"
                            >
                                View Services
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
