"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ActionButton, { type ActionResult } from "@/components/admin/ActionButton";
import { GALLERY_CATEGORIES } from "@/lib/gallery";

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

interface GalleryImageCardProps {
  image: GalleryImage;
  updateAction: (
    id: string,
    values: { title: string; category: string }
  ) => Promise<ActionResult>;
  deleteAction: (id: string) => Promise<ActionResult>;
}

export default function GalleryImageCard({
  image,
  updateAction,
  deleteAction,
}: GalleryImageCardProps) {
  const [title, setTitle] = useState(image.title);
  const [category, setCategory] = useState(image.category);
  const [isSaving, startSaving] = useTransition();

  // Derived, not synced: once the server data matches the inputs the card is clean again.
  const isDirty = title !== image.title || category !== image.category;

  const save = () =>
    startSaving(async () => {
      try {
        const result = await updateAction(image.id, { title: title.trim(), category });
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });

  return (
    <li className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* eslint-disable-next-line @next/next/no-img-element -- portfolio shots have no stored dimensions */}
      <img
        src={image.url}
        alt={image.title}
        loading="lazy"
        className="w-full aspect-[4/5] object-cover bg-gray-100"
      />

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="space-y-1.5">
          <label
            htmlFor={`gallery-title-${image.id}`}
            className="text-xs font-medium text-gray-600"
          >
            Title
          </label>
          <input
            id={`gallery-title-${image.id}`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`gallery-category-${image.id}`}
            className="text-xs font-medium text-gray-600"
          >
            Category
          </label>
          <select
            id={`gallery-category-${image.id}`}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
          >
            {/* Keep a legacy category selectable so saving doesn't silently recategorise it */}
            {!GALLERY_CATEGORIES.includes(category as (typeof GALLERY_CATEGORIES)[number]) && (
              <option value={category}>{category}</option>
            )}
            {GALLERY_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 mt-auto">
          <ActionButton
            action={() => deleteAction(image.id)}
            confirm={{
              title: "Delete image?",
              description: `This permanently removes "${image.title}" from the gallery and from storage. This cannot be undone.`,
              actionLabel: "Delete",
            }}
            aria-label={`Delete ${image.title}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            Delete
          </ActionButton>

          <button
            type="button"
            onClick={save}
            disabled={!isDirty || isSaving || title.trim().length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500 text-white rounded-lg text-xs font-medium hover:bg-gold-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
            {isSaving ? "Saving" : "Save"}
          </button>
        </div>
      </div>
    </li>
  );
}
