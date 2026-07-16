"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Noella WaNdaya",
    role: "Client Review",
    content: "Amazing Blow dry – Noella is so talented and understands clients hair types and what is required to achieve the results you want.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-dark-800 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-gold-400 text-sm font-bold tracking-[0.2em] uppercase block mb-2">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-dark-400 mb-6">
            Client Love
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 max-w-xl mx-auto">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="bg-white p-8 border border-gray-200 relative shadow-sm text-center"
            >
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400" />
                ))}
              </div>
              <p className="text-dark-500 text-lg italic mb-8 leading-relaxed">
                "{review.content}"
              </p>
              <div>
                <h4 className="text-dark-400 font-bold font-serif text-lg">{review.name}</h4>
                <span className="text-dark-500 text-sm uppercase tracking-wider">{review.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
