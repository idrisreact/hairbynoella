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

const serviceSchema = z.object({
    name: z.string(),
    category: z.string(),
    price: z.string(),
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
