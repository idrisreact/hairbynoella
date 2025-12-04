"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen w-full overflow-hidden bg-white"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 min-h-screen items-center py-20 lg:py-0">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 space-y-8 lg:pr-12"
          >
            {/* Small Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-200 bg-gold-50"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-xs tracking-wider text-gray-700 font-medium">
                Premium Hair Care
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-gray-900 leading-[1.1] tracking-tight"
            >
              Where beauty
              <span className="block font-serif font-normal italic text-gold-600 mt-2">
                meets artistry
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-gray-600 leading-relaxed max-w-lg font-light"
            >
              Experience bespoke hair styling in the heart of London. Noella
              crafts personalized looks that celebrate your unique beauty.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex items-center gap-12 pt-4"
            >
              <div>
                <div className="text-4xl font-light text-gray-900 mb-1">
                  16+
                </div>
                <div className="text-sm text-gray-500 tracking-wide">
                  Years Experience
                </div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <div className="text-4xl font-light text-gray-900 mb-1">
                  5k+
                </div>
                <div className="text-sm text-gray-500 tracking-wide">
                  Happy Clients
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4"
            >
              <Link
                href="/book"
                className="group px-8 py-4 bg-gray-900 text-white text-sm font-medium tracking-wide rounded-full hover:bg-gray-800 transition-all duration-300 inline-flex items-center gap-2"
              >
                Book Appointment
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              <Link
                href="/services"
                className="px-8 py-4 text-gray-700 text-sm font-medium tracking-wide hover:text-gray-900 transition-colors inline-flex items-center gap-2 group"
              >
                Explore Services
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side - Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative h-[600px] lg:h-full min-h-[600px]"
          >
            {/* Main Image */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.5,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[80%] h-[70%] rounded-3xl overflow-hidden shadow-2xl"
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://hairbynoella.com/wp-content/uploads/2025/06/WhatsApp-Image-2025-06-28-at-19.10.17-684x1024.jpeg')",
                }}
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>

            {/* Accent Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="absolute left-0 bottom-24 bg-white rounded-2xl shadow-xl p-6 max-w-[200px] z-10"
            >
              <div className="text-sm text-gray-500 mb-2">
                Client Satisfaction
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-3xl font-light text-gray-900">4.9</span>
                <span className="text-gray-400 text-sm mb-1">/5</span>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-gold-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </motion.div>

            {/* Decorative Element */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="absolute top-12 right-12 w-32 h-32 rounded-full bg-gold-100 -z-10"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute bottom-12 left-12 w-24 h-24 rounded-full bg-gray-100 -z-10"
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px] h-16 bg-gradient-to-b from-gray-300 to-transparent"
        />
      </motion.div>
    </section>
  );
}
