import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { galleryImages } from "@/lib/schema";
import { GALLERY_CATEGORIES } from "@/lib/gallery";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryClient from "@/components/gallery/GalleryClient";

// Admin edits call revalidatePath("/gallery"); this is just a safety net.
export const revalidate = 300;

export default async function GalleryPage() {
  const images = await db
    .select()
    .from(galleryImages)
    .orderBy(desc(galleryImages.createdAt));

  // Only offer filters for categories that actually have photos, keeping the
  // canonical order and appending any legacy ones.
  const present = new Set(images.map((image) => image.category));
  const categories = [
    ...GALLERY_CATEGORIES.filter((category) => present.has(category)),
    ...[...present].filter(
      (category) =>
        !GALLERY_CATEGORIES.includes(
          category as (typeof GALLERY_CATEGORIES)[number]
        )
    ),
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-200 bg-gold-50">
              <span className="text-xs tracking-wider text-gray-700 font-medium">
                Our Work
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-gray-900 leading-tight">
              Portfolio of
              <span className="block font-serif italic text-gold-600 mt-2">
                artistry & elegance
              </span>
            </h1>

            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Explore our collection of transformative hairstyles. Each piece
              represents a unique journey of beauty and self-expression.
            </p>
          </div>
        </div>
      </section>

      <GalleryClient
        images={images.map((image) => ({
          id: image.id,
          url: image.url,
          title: image.title,
          category: image.category,
        }))}
        categories={categories}
      />

      <Footer />
    </div>
  );
}
