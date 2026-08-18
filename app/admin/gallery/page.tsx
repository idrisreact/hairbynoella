import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { galleryImages } from "@/lib/schema";
import { getAdminSession } from "@/lib/admin-auth";
import { utapi } from "@/lib/uploadthing-server";
import { GALLERY_CATEGORIES } from "@/lib/gallery";
import GalleryManager from "@/components/admin/GalleryManager";
import type { ActionResult } from "@/components/admin/ActionButton";

const updateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(80),
  category: z.enum(GALLERY_CATEGORIES),
});

async function deleteGalleryImage(id: string): Promise<ActionResult> {
  "use server";

  const session = await getAdminSession();
  if (!session) return { success: false, message: "Unauthorized" };

  try {
    const [deleted] = await db
      .delete(galleryImages)
      .where(eq(galleryImages.id, id))
      .returning();

    if (!deleted) return { success: false, message: "Image not found" };

    // The row is gone either way; a failed storage delete only leaves an orphaned file.
    try {
      await utapi.deleteFiles(deleted.fileKey);
    } catch (error) {
      console.error("Failed to delete file from UploadThing:", error);
    }

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return { success: true, message: "Image deleted" };
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return { success: false, message: "Failed to delete image" };
  }
}

async function updateGalleryImage(
  id: string,
  values: { title: string; category: string }
): Promise<ActionResult> {
  "use server";

  const session = await getAdminSession();
  if (!session) return { success: false, message: "Unauthorized" };

  const parsed = updateSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid details",
    };
  }

  try {
    const [updated] = await db
      .update(galleryImages)
      .set({ title: parsed.data.title, category: parsed.data.category })
      .where(eq(galleryImages.id, id))
      .returning();

    if (!updated) return { success: false, message: "Image not found" };

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return { success: true, message: "Image updated" };
  } catch (error) {
    console.error("Error updating gallery image:", error);
    return { success: false, message: "Failed to update image" };
  }
}

export default async function AdminGalleryPage() {
  const images = await db
    .select()
    .from(galleryImages)
    .orderBy(desc(galleryImages.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
          {images.length} {images.length === 1 ? "image" : "images"}
        </span>
      </div>

      <GalleryManager
        images={images.map((image) => ({
          id: image.id,
          url: image.url,
          title: image.title,
          category: image.category,
        }))}
        updateAction={updateGalleryImage}
        deleteAction={deleteGalleryImage}
      />
    </div>
  );
}
