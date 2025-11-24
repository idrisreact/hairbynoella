import { db } from "@/lib/db";
import { availabilitySlots } from "@/lib/schema";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { eq, and, gte, lte, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const createSlotSchema = z.object({
    startTime: z.string().transform((str) => new Date(str)),
});

const bulkCreateSlotsSchema = z.object({
    startDate: z.string(), // YYYY-MM-DD
    endDate: z.string(),   // YYYY-MM-DD
    startTime: z.string(), // HH:mm
    endTime: z.string(),   // HH:mm
    interval: z.number().min(15).max(240), // minutes
    daysOfWeek: z.array(z.number().min(0).max(6)), // 0 = Sunday, 6 = Saturday
});

const toggleBlockSchema = z.object({
    id: z.string(),
    blockedByAdmin: z.boolean(),
});

// GET: Fetch slots
// Query params:
// - date: YYYY-MM-DD (filter by specific date)
// - admin: "true" (fetch all slots including blocked/booked for admin view)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get("date");
        const isAdminView = searchParams.get("admin") === "true";

        console.log("Fetching slots - date:", dateStr, "adminView:", isAdminView);

        let conditions = [];

        // For public view, exclude booked, blocked, and past slots
        if (!isAdminView) {
            conditions.push(eq(availabilitySlots.isBooked, false));
            conditions.push(eq(availabilitySlots.blockedByAdmin, false));
            // Exclude slots that have already passed
            conditions.push(gte(availabilitySlots.startTime, new Date()));
        }

        // Filter by date if provided
        if (dateStr) {
            const startOfDay = new Date(dateStr);
            startOfDay.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(dateStr);
            endOfDay.setUTCHours(23, 59, 59, 999);

            conditions.push(gte(availabilitySlots.startTime, startOfDay));
            conditions.push(lte(availabilitySlots.startTime, endOfDay));
        }

        const query = conditions.length > 0
            ? db.select().from(availabilitySlots).where(and(...conditions))
            : db.select().from(availabilitySlots);

        const slots = await query;
        console.log(`Found ${slots.length} slots`);
        return NextResponse.json(slots);
    } catch (error) {
        console.error("Error fetching slots:", error);
        return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
    }
}

// POST: Create slot(s)
// Body can be either:
// - { startTime: ISO string } for single slot
// - { bulk: true, startDate, endDate, startTime, endTime, interval, daysOfWeek } for bulk creation
export async function POST(req: Request) {
    try {
        // Check admin authentication
        const session = await auth.api.getSession({
            headers: await headers()
        });

        // For development: allow if session exists (even without admin role)
        // For production: uncomment the role check below
        if (!session) {
            return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 });
        }

        // TODO: Uncomment this after setting up admin user in database
        // if (session.user.role !== "admin") {
        //     return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
        // }

        const body = await req.json();
        console.log("Creating slot(s) with body:", body);

        // Check if it's a bulk creation request
        if (body.bulk) {
            const result = bulkCreateSlotsSchema.safeParse(body);

            if (!result.success) {
                console.error("Bulk validation error:", result.error.flatten());
                return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
            }

            const { startDate, endDate, startTime, endTime, interval, daysOfWeek } = result.data;

            // Parse time components
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);

            const slotsToCreate = [];
            const currentDate = new Date(startDate);
            const finalDate = new Date(endDate);

            // Iterate through each day in the range
            while (currentDate <= finalDate) {
                const dayOfWeek = currentDate.getDay();

                // Only create slots for selected days of week
                if (daysOfWeek.includes(dayOfWeek)) {
                    // Create slots for this day
                    let slotTime = new Date(currentDate);
                    slotTime.setHours(startHour, startMinute, 0, 0);

                    const dayEndTime = new Date(currentDate);
                    dayEndTime.setHours(endHour, endMinute, 0, 0);

                    while (slotTime < dayEndTime) {
                        slotsToCreate.push({
                            id: uuidv4(),
                            startTime: new Date(slotTime),
                            isBooked: false,
                            blockedByAdmin: false,
                        });

                        slotTime = new Date(slotTime.getTime() + interval * 60000);
                    }
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }

            if (slotsToCreate.length === 0) {
                return NextResponse.json({ error: "No slots to create with given parameters" }, { status: 400 });
            }

            console.log(`Creating ${slotsToCreate.length} slots`);

            // Batch insert
            const createdSlots = await db.insert(availabilitySlots).values(slotsToCreate).returning();

            return NextResponse.json({
                success: true,
                count: createdSlots.length,
                slots: createdSlots
            }, { status: 201 });
        } else {
            // Single slot creation
            const result = createSlotSchema.safeParse(body);

            if (!result.success) {
                console.error("Validation error:", result.error.flatten());
                return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
            }

            const { startTime } = result.data;

            const newSlot = await db.insert(availabilitySlots).values({
                id: uuidv4(),
                startTime,
                isBooked: false,
                blockedByAdmin: false,
            }).returning();

            console.log("Slot created:", newSlot[0]);

            return NextResponse.json(newSlot[0], { status: 201 });
        }
    } catch (error) {
        console.error("Error creating slot:", error);
        return NextResponse.json({ error: "Failed to create slot" }, { status: 500 });
    }
}

// PATCH: Toggle block status
export async function PATCH(req: Request) {
    try {
        // Check admin authentication
        const session = await auth.api.getSession({
            headers: await headers()
        });

        // For development: allow if session exists (even without admin role)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 });
        }

        const body = await req.json();
        const result = toggleBlockSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
        }

        const { id, blockedByAdmin } = result.data;

        const updatedSlot = await db.update(availabilitySlots)
            .set({ blockedByAdmin })
            .where(eq(availabilitySlots.id, id))
            .returning();

        if (updatedSlot.length === 0) {
            return NextResponse.json({ error: "Slot not found" }, { status: 404 });
        }

        return NextResponse.json(updatedSlot[0]);
    } catch (error) {
        console.error("Error toggling block:", error);
        return NextResponse.json({ error: "Failed to update slot" }, { status: 500 });
    }
}

// DELETE: Remove slot
export async function DELETE(req: Request) {
    try {
        // Check admin authentication
        const session = await auth.api.getSession({
            headers: await headers()
        });

        // For development: allow if session exists (even without admin role)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        await db.delete(availabilitySlots).where(eq(availabilitySlots.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting slot:", error);
        return NextResponse.json({ error: "Failed to delete slot" }, { status: 500 });
    }
}
