import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { bookings, availabilitySlots } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const refundSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log('Refund API - Session:', session?.user);

    if (!session || (session.user as any).role !== 'admin') {
      console.error('Refund API - Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    console.log('Refund API - Request body:', body);

    const validatedData = refundSchema.parse(body);
    const { bookingId, paymentIntentId, reason } = validatedData;

    console.log('Refund API - Processing refund for booking:', bookingId);

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
      console.log('Refund API - Booking already refunded');
      return NextResponse.json(
        { error: 'Booking already refunded' },
        { status: 400 }
      );
    }

    console.log('Refund API - Creating Stripe refund for payment intent:', paymentIntentId);

    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason ? 'requested_by_customer' : undefined,
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
    console.error('Error processing refund:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Handle Stripe errors
    if ((error as any).type === 'StripeError') {
      console.error('Refund API - Stripe error:', (error as Error).message);
      return NextResponse.json(
        { error: 'Stripe refund failed', message: (error as Error).message },
        { status: 400 }
      );
    }

    // Generic error
    console.error('Refund API - Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to process refund', details: (error as Error).message },
      { status: 500 }
    );
  }
}
