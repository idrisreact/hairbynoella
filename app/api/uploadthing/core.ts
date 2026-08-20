import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { galleryImages } from "@/lib/schema";
import { getAdminSession } from "@/lib/admin-auth";
import { GALLERY_CATEGORIES, titleFromFileName } from "@/lib/gallery";

const f = createUploadthing();

export const ourFileRouter = {
    // Public: customers attach a photo of their current hair when booking as a guest.
    hairPhoto: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata);
            console.log("file url", file.ufsUrl);
            return { uploadedBy: "user" };
        }),

    // Admin only: portfolio images for /gallery. The row is written here (rather than
    // client-side) so a closed tab mid-upload can't leave an orphaned file in storage.
    galleryImage: f({ image: { maxFileSize: "8MB", maxFileCount: 20 } })
        .input(z.object({ category: z.enum(GALLERY_CATEGORIES) }))
        .middleware(async ({ input }) => {
            const session = await getAdminSession();
            if (!session) throw new UploadThingError("Admin access required");

            return { userId: session.user.id, category: input.category };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const [inserted] = await db
                .insert(galleryImages)
                .values({
                    id: uuidv4(),
                    url: file.ufsUrl,
                    fileKey: file.key,
                    title: titleFromFileName(file.name),
                    category: metadata.category,
                })
                .returning();

            revalidatePath("/gallery");
            revalidatePath("/admin/gallery");

            return { id: inserted.id };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
