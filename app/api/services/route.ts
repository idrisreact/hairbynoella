import { db } from "@/lib/db";
import { services } from "@/lib/schema";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";

export async function GET() {
    try {
        const allServices = await db.select().from(services);
        return NextResponse.json(allServices);
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}

import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { eq } from "drizzle-orm";

const serviceSchema = z.object({
    name: z.string(),
    category: z.string(),
    price: z.string(),
    duration: z.number().nullable().optional(),
    description: z.string().optional(),
});

export async function POST(req: Request) {
    const admin = await requireAdminApi();
    if (!admin.ok) return admin.response;

    try {
        const body = await req.json();
        const result = serviceSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
        }

        const { name, category, price, description, duration } = result.data;

        const newService = await db.insert(services).values({
            id: uuidv4(),
            name,
            category,
            price,
            description,
            duration: duration || null,
        }).returning();

        return NextResponse.json(newService[0], { status: 201 });
    } catch (error) {
        console.error("Error creating service:", error);
        return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
    }
}

const updateSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    price: z.string(),
    duration: z.number().nullable().optional(),
    description: z.string().optional(),
});

export async function PUT(req: Request) {
    const admin = await requireAdminApi();
    if (!admin.ok) return admin.response;

    try {
        const body = await req.json();
        const result = updateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
        }

        const { id, name, category, price, duration, description } = result.data;

        const updated = await db
            .update(services)
            .set({ name, category, price, duration: duration ?? null, description: description ?? null })
            .where(eq(services.id, id))
            .returning();

        if (updated.length === 0) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json(updated[0]);
    } catch (error) {
        console.error("Error updating service:", error);
        return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
    }
}
