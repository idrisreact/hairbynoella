"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: string;
}

interface GalleryClientProps {
  images: GalleryItem[];
  /** Categories present in the gallery, in display order (excluding "All"). */
  categories: string[];
}

export default function GalleryClient({ images, categories }: GalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const filteredImages =
    selectedCategory === "All"
      ? images
      : images.filter((image) => image.category === selectedCategory);

  return (
    <>
      {/* Category Filter */}
      {categories.length > 0 && (
        <section className="py-8 border-b border-gray-100">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              role="group"
              aria-label="Filter gallery by category"
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {["All", ...categories].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={selectedCategory === category}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-gray-900 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Gallery Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
            >
              {filteredImages.map((image, index) => (
                <motion.button
                  key={image.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.1 }}
                  className="break-inside-avoid group cursor-pointer block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-4 rounded-2xl"
                  onClick={() => setSelectedImage(image)}
                  aria-label={`View ${image.title} larger`}
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                    {/* eslint-disable-next-line @next/next/no-img-element -- natural heights drive the masonry layout */}
                    <img
                      src={image.url}
                      alt={image.title}
                      loading="lazy"
                      className="w-full h-auto bg-gray-100 transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-white font-medium text-lg">{image.title}</h3>
                      <p className="text-gray-300 text-sm">{image.category}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredImages.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                {images.length === 0
                  ? "Our portfolio is being updated — please check back soon."
                  : "No images found in this category."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={selectedImage.title}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl w-full"
              onClick={(event) => event.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote portfolio image, dimensions unknown */}
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="mt-6 text-center">
                <h3 className="text-white text-2xl font-light">{selectedImage.title}</h3>
                <p className="text-gray-400 mt-2">{selectedImage.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
