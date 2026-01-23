import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { db } from '@/lib/db';
import { bookings, availabilitySlots } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const cancelSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log('Cancel API - Session:', session?.user);

    if (!session || (session.user as any).role !== 'admin') {
      console.error('Cancel API - Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = cancelSchema.parse(body);

    const { bookingId } = validatedData;

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

    // Update booking status to cancelled
    await db
      .update(bookings)
      .set({
        status: 'cancelled',
      })
      .where(eq(bookings.id, bookingId));

    // Release the slot if it was booked
    if (bookingData.slotId) {
      await db
        .update(availabilitySlots)
        .set({ isBooked: false })
        .where(eq(availabilitySlots.id, bookingData.slotId));
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled and slot released',
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
