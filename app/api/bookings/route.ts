import { db } from "@/lib/db";
import { bookings, availabilitySlots, services } from "@/lib/schema";
import { after, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { sendBookingEmails } from "@/lib/email";

function isUniqueViolation(error: unknown): boolean {
    const code =
        (error as { code?: string })?.code ??
        (error as { cause?: { code?: string } })?.cause?.code;
    return code === "23505";
}

const bookingSchema = z.object({
    serviceId: z.string(),
    date: z.string().or(z.date()), // Accept string or date object
    slotId: z.string(),
    customerName: z.string(),
    customerEmail: z.string().email(),
    customerPhone: z.string(),
    hairPhotoUrl: z.string().optional(),
    notes: z.string().optional(),
    stripePaymentIntentId: z.string().min(1, "Payment intent ID is required"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Ensure date is treated correctly
        if (typeof body.date === 'string') {
            body.date = new Date(body.date);
        }

        const result = bookingSchema.safeParse(body);

        if (!result.success) {
            console.error("Validation error:", result.error.flatten());
            return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
        }

        const { serviceId, date, slotId, customerName, customerEmail, customerPhone, hairPhotoUrl, notes, stripePaymentIntentId } = result.data;

        // Verify the payment intent with Stripe
        let paymentIntent;
        try {
            paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
        } catch (stripeError) {
            console.error("Failed to retrieve payment intent:", stripeError);
            return NextResponse.json({ error: "Invalid payment intent" }, { status: 400 });
        }

        // Ensure payment was successful
        if (paymentIntent.status !== 'succeeded') {
            return NextResponse.json(
                { error: `Payment not completed. Status: ${paymentIntent.status}` },
                { status: 400 }
            );
        }

        // The payment must have been made for the service being booked
        if (paymentIntent.metadata.serviceId && paymentIntent.metadata.serviceId !== serviceId) {
            return NextResponse.json(
                { error: "Payment does not match the selected service" },
                { status: 400 }
            );
        }

        // Reject reuse of a payment intent that already has a booking
        const existingBooking = await db
            .select({ id: bookings.id })
            .from(bookings)
            .where(eq(bookings.stripePaymentIntentId, stripePaymentIntentId))
            .limit(1);

        if (existingBooking.length > 0) {
            return NextResponse.json(
                { error: "This payment has already been used for a booking." },
                { status: 409 }
            );
        }

        // Extract payment metadata
        const depositAmount = paymentIntent.amount;
        const fullServicePrice = paymentIntent.metadata.fullServicePrice
            ? parseInt(paymentIntent.metadata.fullServicePrice)
            : depositAmount;

        // Claim the slot and create the booking atomically. The slot update is
        // conditional on it still being free, so two paid customers can never
        // end up with the same slot.
        let newBooking;
        try {
            newBooking = await db.transaction(async (tx) => {
                const claimed = await tx
                    .update(availabilitySlots)
                    .set({ isBooked: true })
                    .where(and(
                        eq(availabilitySlots.id, slotId),
                        eq(availabilitySlots.isBooked, false),
                        eq(availabilitySlots.blockedByAdmin, false),
                    ))
                    .returning({ id: availabilitySlots.id });

                if (claimed.length === 0) {
                    return null; // Slot no longer available
                }

                const inserted = await tx.insert(bookings).values({
                    id: uuidv4(),
                    serviceId,
                    slotId,
                    date: new Date(date), // Ensure it's a Date object
                    customerName,
                    customerEmail,
                    customerPhone,
                    hairPhotoUrl,
                    notes,
                    status: 'pending',
                    stripePaymentIntentId,
                    paymentStatus: 'succeeded',
                    depositAmount,
                    fullServicePrice,
                    amountPaid: depositAmount,
                    currency: 'gbp',
                    paymentDate: new Date(),
                }).returning();

                return inserted[0];
            });
        } catch (error) {
            if (isUniqueViolation(error)) {
                // Same payment intent raced past the duplicate check above; the
                // transaction rolled back, so the claimed slot was released.
                return NextResponse.json(
                    { error: "This payment has already been used for a booking." },
                    { status: 409 }
                );
            }
            throw error;
        }

        if (!newBooking) {
            // Slot was taken while the customer was paying — refund the deposit
            let refunded = false;
            try {
                await stripe.refunds.create({ payment_intent: stripePaymentIntentId });
                refunded = true;
            } catch (refundError) {
                console.error(
                    `Failed to auto-refund payment intent ${stripePaymentIntentId} after slot conflict:`,
                    refundError
                );
            }
            return NextResponse.json(
                {
                    error: refunded
                        ? "Sorry, that time slot was just booked by someone else. Your deposit has been refunded — please choose another time."
                        : "Sorry, that time slot was just booked by someone else. We couldn't refund your deposit automatically — please contact us and we'll sort it out.",
                },
                { status: 409 }
            );
        }

        // Send the confirmation/invoice email (and admin alert) after the
        // response goes out. sendBookingEmails never throws, so an email
        // problem can't affect the paid booking.
        const booking = newBooking;
        after(async () => {
            try {
                const [service, slot] = await Promise.all([
                    db.select({ name: services.name }).from(services).where(eq(services.id, serviceId)).limit(1),
                    db.select({ startTime: availabilitySlots.startTime }).from(availabilitySlots).where(eq(availabilitySlots.id, slotId)).limit(1),
                ]);

                await sendBookingEmails({
                    bookingId: booking.id,
                    customerName,
                    customerEmail,
                    customerPhone,
                    serviceName: service[0]?.name ?? "your appointment",
                    appointmentTime: slot[0]?.startTime ?? new Date(date),
                    fullServicePrice,
                    depositPaid: depositAmount,
                    notes,
                    hairPhotoUrl,
                });
            } catch (emailError) {
                console.error(
                    `Failed to send booking emails for booking ${booking.id}:`,
                    emailError
                );
            }
        });

        return NextResponse.json(newBooking, { status: 201 });
    } catch (error) {
        console.error("Error creating booking:", error);
        // @ts-ignore
        return NextResponse.json({ error: "Failed to create booking: " + error.message }, { status: 500 });
    }
}
