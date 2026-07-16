"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { X } from "lucide-react";

const categories = ["All", "Styling", "Colour", "Treatments"];

const galleryImages = [
  {
    id: 1,
    url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86TJVm64sD5ar2f0kGTDVNKO1nHqpLhduExZjY5",
    category: "Styling",
    title: "Voluminous Blow-Dry Waves",
  },
  {
    id: 2,
    url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86TaUHpPX0Wxf7R509Y4UozQvKqH16MGcTNOmSE",
    category: "Styling",
    title: "Soft Wave Blow-Dry",
  },
  {
    id: 3,
    url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86TNx6mB8u4JwX5DsGuotjrza9PZCVhOLnb7M8Q",
    category: "Styling",
    title: "Layered Waves",
  },
  {
    id: 4,
    url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86T1KzH6yctnAe3uhbWcJvw8kX5yQTz0xHjRlVg",
    category: "Treatments",
    title: "Sleek Straight Finish",
  },
  {
    id: 5,
    url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86TMJSTegLN8pIvLF6OGSgfsC1UidYTzxeAZqJK",
    category: "Treatments",
    title: "Glass Hair Straightening",
  },
  {
    id: 6,
    url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86Tl8aR2GRy7H2aWuSYnITrEVQymcpiNZl1oKzk",
    category: "Treatments",
    title: "Silky Straight Blow-Dry",
  },
  {
    id: 7,
    url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86Tl8Y4dDny7H2aWuSYnITrEVQymcpiNZl1oKzk",
    category: "Styling",
    title: "Bouncy Curls",
  },
  {
    id: 8,
    url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86TQiCP3wHxsyq93FAHnINo7U2kBjLJ0mlXtPiZ",
    category: "Styling",
    title: "Effortless Waves",
  },
  {
    id: 9,
    url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86T4oN5lzbOF2bzwP9UdYjRXKuh7pi5MeoyGsm3",
    category: "Treatments",
    title: "Sleek Blow-Dry Finish",
  },
  {
    id: 10,
    url: "https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86TAG4rrs37qRZY8B9b7dAuQEfTMIwFjstJDgr2",
    category: "Colour",
    title: "Face-Framing Highlights",
  },
];

export function GalleryClient() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

  const filteredImages =
    selectedCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-200 bg-gold-50">
              <span className="text-xs tracking-wider text-gray-700 font-medium">Our Work</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-gray-900 leading-tight">
              Portfolio of
              <span className="block font-serif italic text-gold-600 mt-2">
                artistry & elegance
              </span>
            </h1>

            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Explore our collection of transformative hairstyles. Each piece represents a
              unique journey of beauty and self-expression.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
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
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="break-inside-avoid group cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                    <div
                      className="w-full aspect-auto bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                      style={{
                        backgroundImage: `url('${image.url}')`,
                        paddingBottom: `${Math.random() * 30 + 80}%`, // Random heights for masonry
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-white font-medium text-lg">{image.title}</h3>
                      <p className="text-gray-300 text-sm">{image.category}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredImages.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No images found in this category.</p>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
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

      <Footer />
    </div>
  );
}
