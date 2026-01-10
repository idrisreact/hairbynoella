import { db } from "@/lib/db";
import { bookings, availabilitySlots } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { eq } from "drizzle-orm";

const bookingSchema = z.object({
    serviceId: z.string(),
    date: z.string().or(z.date()), // Accept string or date object
    slotId: z.string(),
    customerName: z.string(),
    customerEmail: z.string().email(),
    customerPhone: z.string(),
    hairPhotoUrl: z.string().optional(),
    notes: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Booking request body:", body);

        // Ensure date is treated correctly
        if (typeof body.date === 'string') {
            body.date = new Date(body.date);
        }

        const result = bookingSchema.safeParse(body);

        if (!result.success) {
            console.error("Validation error:", result.error.flatten());
            return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
        }

        const { serviceId, date, slotId, customerName, customerEmail, customerPhone, hairPhotoUrl, notes } = result.data;

        // Optional: Check for authentication to link user
        let session = null;
        try {
            session = await auth.api.getSession({
                headers: await headers()
            });
        } catch (authError) {
            console.warn("Auth check failed (non-fatal):", authError);
        }

        console.log("Attempting to insert booking into DB...");

        // Start a transaction to ensure atomicity (if Drizzle supported transactions easily here, but we'll do sequential for now)
        // 1. Mark slot as booked
        await db.update(availabilitySlots)
            .set({ isBooked: true })
            .where(eq(availabilitySlots.id, slotId));

        // 2. Create booking
        const newBooking = await db.insert(bookings).values({
            id: uuidv4(),
            userId: session?.user?.id,
            serviceId,
            slotId,
            date: new Date(date), // Ensure it's a Date object
            customerName,
            customerEmail,
            customerPhone,
            hairPhotoUrl,
            notes,
            status: 'pending'
        }).returning();

        console.log("Booking created successfully:", newBooking[0]);

        return NextResponse.json(newBooking[0], { status: 201 });
    } catch (error) {
        console.error("Error creating booking:", error);
        // @ts-ignore
        return NextResponse.json({ error: "Failed to create booking: " + error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userBookings = await db.select().from(bookings).where(eq(bookings.userId, session.user.id));
        return NextResponse.json(userBookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        // @ts-ignore
        return NextResponse.json({ error: "Failed to fetch bookings: " + error.message }, { status: 500 });
    }
}
