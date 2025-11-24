import { db } from "@/lib/db";
import { services } from "@/lib/schema";
import { v4 as uuidv4 } from "uuid";

const serviceCategories = [
    {
        title: "Hair Styling",
        services: [
            { name: "Wash & Cut Only", price: "From £65" },
            { name: "Wash & Blow-Dry", price: "From £38" },
            { name: "Wash, Cut & Blow-Dry", price: "From £85" },
            { name: "Hair Up", price: "From £60" },
            { name: "Curling Iron", price: "From £35" },
        ],
    },
    {
        title: "Hair Colouring",
        services: [
            { name: "Full Head Highlights", price: "From £250" },
            { name: "Half Head Highlights", price: "From £180" },
            { name: "Balayage / Ombre", price: "From £295" },
            { name: "T-Section", price: "From £155" },
            { name: "Roots Tint", price: "From £175" },
            { name: "Toner", price: "From £55" },
            { name: "Tint & Toner", price: "From £155" },
            { name: "Gloss Shine", price: "From £50" },
            { name: "Roots Bleach", price: "From £100" },
            { name: "Full Bleach", price: "From £200" },
        ],
    },
    {
        title: "Hair Treatments",
        services: [
            { name: "Momoko Straightening", price: "From £200" },
            { name: "Yuko Straightening", price: "From £200" },
            { name: "Intensive Treatment", price: "From £40" },
            { name: "Mini Treatment", price: "From £35" },
            { name: "Olaplex", price: "From £45" },
            { name: "Keratin Treatment", price: "From £199" },
        ],
    },
];

async function main() {
    console.log("Seeding services...");

    for (const category of serviceCategories) {
        for (const service of category.services) {
            await db.insert(services).values({
                id: uuidv4(),
                name: service.name,
                category: category.title,
                price: service.price,
            });
        }
    }

    console.log("Seeding completed.");
    process.exit(0);
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
