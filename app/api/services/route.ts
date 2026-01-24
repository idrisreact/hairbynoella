import { db } from "@/lib/db";
import { services } from "@/lib/schema";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        console.log("Fetching services from DB...");
        const allServices = await db.select().from(services);
        console.log(`Fetched ${allServices.length} services.`);
        return NextResponse.json(allServices);
    } catch (error) {
        console.error("Error fetching services:", error);
        // @ts-ignore
        return NextResponse.json({ error: "Failed to fetch services: " + error.message }, { status: 500 });
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
    try {
        const body = await req.json();
        const result = serviceSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
        }

        const { name, category, price, description } = result.data;

        const newService = await db.insert(services).values({
            id: uuidv4(),
            name,
            category,
            price,
            description,
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
