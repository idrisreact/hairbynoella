import { NextRequest, NextResponse } from "next/server";
import { archiveOldBookings } from "@/lib/archive-bookings";

// Invoked monthly by the platform cron (see vercel.json). Requires CRON_SECRET.
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const count = await archiveOldBookings();
        return NextResponse.json({ success: true, archived: count });
    } catch (error) {
        console.error("Cron archive error:", error);
        return NextResponse.json({ error: "Failed to archive bookings" }, { status: 500 });
    }
}
