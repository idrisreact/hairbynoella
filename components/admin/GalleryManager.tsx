"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
import { UploadDropzone } from "@/lib/uploadthing";
import "@uploadthing/react/styles.css";
import GalleryImageCard, { type GalleryImage } from "@/components/admin/GalleryImageCard";
import type { ActionResult } from "@/components/admin/ActionButton";
import { GALLERY_CATEGORIES, type GalleryCategory } from "@/lib/gallery";

interface GalleryManagerProps {
  images: GalleryImage[];
  updateAction: (
    id: string,
    values: { title: string; category: string }
  ) => Promise<ActionResult>;
  deleteAction: (id: string) => Promise<ActionResult>;
}

export default function GalleryManager({
  images,
  updateAction,
  deleteAction,
}: GalleryManagerProps) {
  const router = useRouter();
  const [uploadCategory, setUploadCategory] = useState<GalleryCategory>(GALLERY_CATEGORIES[0]);

  return (
    <div className="space-y-8">
      {/* Uploader */}
      <section
        aria-labelledby="gallery-upload-heading"
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4"
      >
        <div>
          <h2 id="gallery-upload-heading" className="text-sm font-semibold text-gray-900">
            Add photos
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Pick a category, then drop in your photos. Titles are taken from the file name —
            edit them below after uploading.
          </p>
        </div>

        <div className="space-y-1.5 max-w-xs">
          <label htmlFor="gallery-upload-category" className="text-xs font-medium text-gray-600">
            Category for these photos
          </label>
          <select
            id="gallery-upload-category"
            value={uploadCategory}
            onChange={(event) => setUploadCategory(event.target.value as GalleryCategory)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
          >
            {GALLERY_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <UploadDropzone
          endpoint="galleryImage"
          input={{ category: uploadCategory }}
          onClientUploadComplete={(files) => {
            toast.success(
              files.length === 1 ? "Photo added" : `${files.length} photos added`
            );
            router.refresh();
          }}
          onUploadError={(error: Error) => {
            toast.error(error.message || "Upload failed");
          }}
          appearance={{
            button:
              "bg-gold-500 text-white hover:bg-gold-600 ut-uploading:bg-gold-600 after:bg-gold-700",
            container: "border-gray-300 rounded-lg",
            label: "text-gold-600 hover:text-gold-700",
            allowedContent: "text-gray-500",
          }}
        />
      </section>

      {/* Existing images */}
      {images.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <ImageIcon className="w-8 h-8 text-gray-300 mx-auto" aria-hidden="true" />
          <p className="text-sm text-gray-500 mt-3">
            No gallery photos yet. Upload your first one above.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 list-none p-0">
          {images.map((image) => (
            <GalleryImageCard
              key={image.id}
              image={image}
              updateAction={updateAction}
              deleteAction={deleteAction}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
