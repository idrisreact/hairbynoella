import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { bookings, availabilitySlots } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { requireAdminApi } from '@/lib/admin-auth';

const refundSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;
  const { session } = admin;

  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = refundSchema.parse(body);
    const { bookingId, paymentIntentId, reason } = validatedData;

    // Fetch booking from database
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking || booking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const bookingData = booking[0];

    // Verify payment intent matches
    if (bookingData.stripePaymentIntentId !== paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent mismatch' },
        { status: 400 }
      );
    }

    // Check if already refunded
    if (bookingData.paymentStatus === 'refunded') {
      return NextResponse.json(
        { error: 'Booking already refunded' },
        { status: 400 }
      );
    }

    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: {
        bookingId,
        refundedBy: session.user.email || session.user.name,
        reason: reason || 'No reason provided',
      },
    });

    // Update booking in database
    await db
      .update(bookings)
      .set({
        paymentStatus: 'refunded',
        amountRefunded: refund.amount,
        refundDate: new Date(),
        refundReason: reason || 'Refunded by admin',
        status: 'cancelled',
      })
      .where(eq(bookings.id, bookingId));

    // Unbook the slot if it was booked
    if (bookingData.slotId) {
      await db
        .update(availabilitySlots)
        .set({ isBooked: false })
        .where(eq(availabilitySlots.id, bookingData.slotId));
    }

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
      },
      message: 'Refund processed successfully and slot released',
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    // Handle Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Refund API - Stripe error:', error.type, error.code);
      return NextResponse.json(
        { error: 'Stripe refund failed' },
        { status: 400 }
      );
    }

    // Generic error
    console.error('Refund API - Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
