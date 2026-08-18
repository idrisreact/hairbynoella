/**
 * Creates the gallery_images table and backfills the ten photos that used to be
 * hardcoded in app/gallery/page.tsx. Safe to re-run: the table is created only if
 * missing, and the backfill is skipped once any rows exist.
 *
 *   npx tsx scripts/seed-gallery.ts
 */
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../lib/db";
import { galleryImages } from "../lib/schema";

/** Legacy images, oldest first — createdAt is staggered so the original order survives. */
const legacyImages = [
    { url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86TAG4rrs37qRZY8B9b7dAuQEfTMIwFjstJDgr2", category: "Colour", title: "Face-Framing Highlights" },
    { url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86T4oN5lzbOF2bzwP9UdYjRXKuh7pi5MeoyGsm3", category: "Treatments", title: "Sleek Blow-Dry Finish" },
    { url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86TQiCP3wHxsyq93FAHnINo7U2kBjLJ0mlXtPiZ", category: "Styling", title: "Effortless Waves" },
    { url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86Tl8Y4dDny7H2aWuSYnITrEVQymcpiNZl1oKzk", category: "Styling", title: "Bouncy Curls" },
    { url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86Tl8aR2GRy7H2aWuSYnITrEVQymcpiNZl1oKzk", category: "Treatments", title: "Silky Straight Blow-Dry" },
    { url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86TMJSTegLN8pIvLF6OGSgfsC1UidYTzxeAZqJK", category: "Treatments", title: "Glass Hair Straightening" },
    { url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86T1KzH6yctnAe3uhbWcJvw8kX5yQTz0xHjRlVg", category: "Treatments", title: "Sleek Straight Finish" },
    { url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86TNx6mB8u4JwX5DsGuotjrza9PZCVhOLnb7M8Q", category: "Styling", title: "Layered Waves" },
    { url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86TaUHpPX0Wxf7R509Y4UozQvKqH16MGcTNOmSE", category: "Styling", title: "Soft Wave Blow-Dry" },
    { url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86TJVm64sD5ar2f0kGTDVNKO1nHqpLhduExZjY5", category: "Styling", title: "Voluminous Blow-Dry Waves" },
];

/** UploadThing serves files at /f/<fileKey>; the key is what deletes them from storage. */
function fileKeyFromUrl(url: string): string {
    const key = new URL(url).pathname.split("/").pop();
    if (!key) throw new Error(`Could not derive a file key from ${url}`);
    return key;
}

async function main() {
    console.log("Creating gallery_images table if it does not exist...");
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "gallery_images" (
            "id" text PRIMARY KEY NOT NULL,
            "url" text NOT NULL,
            "file_key" text NOT NULL,
            "title" text NOT NULL,
            "category" text NOT NULL,
            "created_at" timestamp DEFAULT now()
        );
    `);

    const existing = await db.select({ id: galleryImages.id }).from(galleryImages);
    if (existing.length > 0) {
        console.log(`Table already has ${existing.length} image(s) — skipping backfill.`);
        return;
    }

    const now = Date.now();
    await db.insert(galleryImages).values(
        legacyImages.map((image, index) => ({
            id: randomUUID(),
            url: image.url,
            fileKey: fileKeyFromUrl(image.url),
            title: image.title,
            category: image.category,
            createdAt: new Date(now + index * 1000),
        }))
    );

    console.log(`Backfilled ${legacyImages.length} gallery images.`);
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Gallery seeding failed:", err);
        process.exit(1);
    });
