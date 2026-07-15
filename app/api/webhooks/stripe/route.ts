import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { bookings, webhookEvents, availabilitySlots } from '@/lib/schema';
import { eq } from 'drizzle-orm';

/**
 * Stripe webhook handler
 *
 * Handles the following events:
 * - payment_intent.succeeded: Update booking payment status and mark slot as booked
 * - payment_intent.payment_failed: Update booking payment status to failed
 * - charge.refunded: Update booking with refund information
 */

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Check if event has already been processed (idempotency)
  const existingEvent = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.id, event.id))
    .limit(1);

  if (existingEvent && existingEvent.length > 0) {
    console.log(`Event ${event.id} already processed, skipping`);
    return NextResponse.json({ received: true, skipped: true });
  }

  // Record this event as processed
  await db.insert(webhookEvents).values({
    id: event.id,
    type: event.type,
    processed: true,
  });

  // Handle different event types
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook event ${event.id}:`, error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log('Payment succeeded:', paymentIntent.id);

  // Find the booking associated with this payment intent
  const booking = await db
    .select()
    .from(bookings)
    .where(eq(bookings.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  if (booking && booking.length > 0) {
    const bookingData = booking[0];

    // Update booking payment status
    await db
      .update(bookings)
      .set({
        paymentStatus: 'succeeded',
        amountPaid: paymentIntent.amount,
        paymentDate: new Date(),
      })
      .where(eq(bookings.id, bookingData.id));

    // Mark the slot as booked
    if (bookingData.slotId) {
      await db
        .update(availabilitySlots)
        .set({ isBooked: true })
        .where(eq(availabilitySlots.id, bookingData.slotId));
    }

    console.log(`Booking ${bookingData.id} payment confirmed and slot marked as booked`);
  } else {
    console.log(`No booking found for payment intent ${paymentIntent.id}`);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log('Payment failed:', paymentIntent.id);

  // Find the booking associated with this payment intent
  const booking = await db
    .select()
    .from(bookings)
    .where(eq(bookings.stripePaymentIntentId, paymentIntent.id))
    .limit(1);

  if (booking && booking.length > 0) {
    // Update booking payment status to failed
    await db
      .update(bookings)
      .set({
        paymentStatus: 'failed',
      })
      .where(eq(bookings.id, booking[0].id));

    console.log(`Booking ${booking[0].id} payment marked as failed`);
  }
}

/**
 * Handle refunded charge
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('Charge refunded:', charge.id);

  const paymentIntentId = charge.payment_intent as string;

  // Find the booking associated with this payment intent
  const booking = await db
    .select()
    .from(bookings)
    .where(eq(bookings.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  if (booking && booking.length > 0) {
    const refundedAmount = charge.amount_refunded;

    // Update booking with refund information
    await db
      .update(bookings)
      .set({
        paymentStatus: 'refunded',
        amountRefunded: refundedAmount,
        refundDate: new Date(),
        status: 'cancelled',
      })
      .where(eq(bookings.id, booking[0].id));

    // Unbook the slot if it was booked
    if (booking[0].slotId) {
      await db
        .update(availabilitySlots)
        .set({ isBooked: false })
        .where(eq(availabilitySlots.id, booking[0].slotId));
    }

    console.log(`Booking ${booking[0].id} refunded £${refundedAmount / 100} and slot released`);
  }
}
