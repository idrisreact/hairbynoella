import { db } from "@/lib/db";
import { availabilitySlots } from "@/lib/schema";
import { NextResponse } from "next/server";
import { eq, and, gte, lte, sql } from "drizzle-orm";

// GET: Fetch dates that have available slots
// Query params:
// - startDate: YYYY-MM-DD (start of range)
// - endDate: YYYY-MM-DD (end of range)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const startDateStr = searchParams.get("startDate");
        const endDateStr = searchParams.get("endDate");

        if (!startDateStr || !endDateStr) {
            return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
        }

        const startDate = new Date(startDateStr);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(endDateStr);
        endDate.setUTCHours(23, 59, 59, 999);

        // Query for available slots (not booked, not blocked, and not in the past) within the date range
        const availableSlots = await db
            .select({
                date: sql<string>`DATE(${availabilitySlots.startTime})`.as('date')
            })
            .from(availabilitySlots)
            .where(
                and(
                    eq(availabilitySlots.isBooked, false),
                    eq(availabilitySlots.blockedByAdmin, false),
                    gte(availabilitySlots.startTime, new Date()), // Exclude past slots
                    gte(availabilitySlots.startTime, startDate),
                    lte(availabilitySlots.startTime, endDate)
                )
            )
            .groupBy(sql`DATE(${availabilitySlots.startTime})`);

        // Extract unique dates
        const availableDates = availableSlots.map(slot => slot.date);

        return NextResponse.json({ dates: availableDates });
    } catch (error) {
        console.error("Error fetching available dates:", error);
        return NextResponse.json({ error: "Failed to fetch available dates" }, { status: 500 });
    }
}
