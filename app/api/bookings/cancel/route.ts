import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { bookings, availabilitySlots, services } from "@/lib/schema";
import { and, eq, notInArray } from "drizzle-orm";
import {
    SELF_CANCEL_CUTOFF_HOURS,
    AUTO_REFUND_CUTOFF_HOURS,
    hoursUntil,
} from "@/lib/booking-policy";
import {
    sendCancellationEmails,
    type CancellationEmailData,
} from "@/lib/email";

// Public endpoint: the manage token is the credential, so no session check.
const cancelSchema = z.object({
    token: z.string().min(20),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = cancelSchema.parse(body);

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

        if (rows.length === 0) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const { booking, serviceName, slotStartTime } = rows[0];

        if (booking.status === "cancelled") {
            return NextResponse.json({ success: true, alreadyCancelled: true });
        }
        if (booking.status === "completed" || booking.archivedAt) {
            return NextResponse.json(
                { error: "This booking can no longer be cancelled" },
                { status: 409 }
            );
        }

        // The slot's startTime is authoritative; booking.date is client-supplied.
        const appointmentTime = slotStartTime ?? booking.date;
        const hoursAhead = hoursUntil(appointmentTime);

        if (hoursAhead < SELF_CANCEL_CUTOFF_HOURS) {
            return NextResponse.json(
                {
                    error: `Cancellations within ${SELF_CANCEL_CUTOFF_HOURS} hours of the appointment can't be made online — please contact the salon directly.`,
                },
                { status: 403 }
            );
        }

        const refundEligible =
            hoursAhead >= AUTO_REFUND_CUTOFF_HOURS &&
            booking.paymentStatus === "succeeded" &&
            (booking.amountPaid ?? 0) > 0 &&
            Boolean(booking.stripePaymentIntentId);

        // Cancel + free the slot atomically. The conditional update guards
        // against races with admin actions (or a double-click): if the booking
        // was cancelled/completed in the meantime, we do nothing — and issue
        // no refund.
        const cancelled = await db.transaction(async (tx) => {
            const updated = await tx
                .update(bookings)
                .set({
                    status: "cancelled",
                    ...(refundEligible
                        ? {}
                        : {
                              refundReason: `customer self-cancellation within ${AUTO_REFUND_CUTOFF_HOURS}h — deposit retained`,
                          }),
                })
                .where(
                    and(
                        eq(bookings.id, booking.id),
                        notInArray(bookings.status, ["cancelled", "completed"])
                    )
                )
                .returning({ id: bookings.id });

            if (updated.length === 0) return false;

            if (booking.slotId) {
                await tx
                    .update(availabilitySlots)
                    .set({ isBooked: false })
                    .where(eq(availabilitySlots.id, booking.slotId));
            }
            return true;
        });

        if (!cancelled) {
            return NextResponse.json(
                { error: "This booking was just updated — please refresh the page" },
                { status: 409 }
            );
        }

        // Refund after the cancellation is committed: the customer's intent is
        // the cancellation, and a failed refund is recoverable manually
        // (flagged in the admin alert), whereas the reverse order could leave
        // a live booking with returned money.
        let refundOutcome: CancellationEmailData["refundOutcome"] = "deposit_kept";
        let refundAmount: number | undefined;

        if (refundEligible) {
            try {
                const refund = await stripe.refunds.create({
                    payment_intent: booking.stripePaymentIntentId!,
                    reason: "requested_by_customer",
                    metadata: {
                        bookingId: booking.id,
                        refundedBy: "customer-self-service",
                    },
                });
                await db
                    .update(bookings)
                    .set({
                        paymentStatus: "refunded",
                        amountRefunded: refund.amount,
                        refundDate: new Date(),
                        refundReason: "customer self-cancellation",
                    })
                    .where(eq(bookings.id, booking.id));
                refundOutcome = "refunded";
                refundAmount = refund.amount;
            } catch (refundError) {
                if (refundError instanceof Stripe.errors.StripeError) {
                    console.error(
                        `Self-service refund failed for booking ${booking.id}:`,
                        refundError.type,
                        refundError.code
                    );
                } else {
                    console.error(
                        `Self-service refund failed for booking ${booking.id}:`,
                        refundError
                    );
                }
                refundOutcome = "refund_failed";
            }
        }

        const emailData: CancellationEmailData = {
            bookingId: booking.id,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            serviceName: serviceName ?? "your appointment",
            appointmentTime,
            depositPaid: booking.amountPaid ?? 0,
            refundOutcome,
            refundAmount,
        };
        after(() => sendCancellationEmails(emailData));

        return NextResponse.json({
            success: true,
            refunded: refundOutcome === "refunded",
            refundOutcome,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation error", details: error.issues },
                { status: 400 }
            );
        }
        console.error("Cancel booking API - Unexpected error:", error);
        return NextResponse.json(
            { error: "Failed to cancel booking" },
            { status: 500 }
        );
    }
}
