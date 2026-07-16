"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Scissors, Sparkles, Droplet } from "lucide-react";
import Link from "next/link";
import type { ServiceItem } from "./page";

interface ServiceCategory {
  title: string;
  icon: React.ReactNode;
  services: ServiceItem[];
}

export const ServicesPageClient = ({ services }: { services: ServiceItem[] }) => {
  const grouped: Record<string, ServiceItem[]> = {};
  services.forEach((service) => {
    if (!grouped[service.category]) {
      grouped[service.category] = [];
    }
    grouped[service.category].push(service);
  });

  const categories: ServiceCategory[] = [
    {
      title: "Hair Styling",
      icon: <Scissors className="w-6 h-6" />,
      services: grouped["Hair Styling"] || [],
    },
    {
      title: "Hair Colouring",
      icon: <Sparkles className="w-6 h-6" />,
      services: grouped["Hair Colouring"] || [],
    },
    {
      title: "Hair Treatments",
      icon: <Droplet className="w-6 h-6" />,
      services: grouped["Hair Treatments"] || [],
    },
  ].filter((cat) => cat.services.length > 0);

  return (
    <main className="min-h-screen bg-white text-dark-400 selection:bg-gold-400/30">
      <Navbar />

      {/* Header */}
      <section className="relative pt-40 pb-20 bg-dark-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-gold-400 text-sm font-bold tracking-[0.2em] uppercase block mb-4">
              Our Menu
            </span>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-dark-400 mb-6">
              Services & Pricing
            </h1>
            <p className="text-dark-500 text-lg max-w-2xl mx-auto font-light">
              Experience the finest hair care with our comprehensive range of styling, colouring, and treatment services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 gap-16">
            {categories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1, duration: 0.5 }}
              >
                <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-4">
                  <div className="p-3 bg-gold-400/10 rounded-full text-gold-600">
                    {category.icon}
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-dark-400">
                    {category.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {category.services.map((service, serviceIndex) => (
                    <div
                      key={serviceIndex}
                      className="flex items-baseline justify-between group border-b border-dashed border-gray-200 pb-2 hover:border-gold-400 transition-colors"
                    >
                      <h3 className="text-lg font-medium text-dark-500 group-hover:text-dark-400 transition-colors">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-4">
                          <span className="text-gold-600 font-bold text-base whitespace-nowrap">
                          {service.price}
                          </span>
                          <Link
                              href={`/book?serviceId=${service.id}`}
                              className="text-xs uppercase tracking-wider font-bold text-gray-500 hover:text-gold-600 border border-gray-200 hover:border-gold-400 px-3 py-1 rounded-full transition-all"
                          >
                              Book
                          </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-24 bg-gold-400 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-serif font-bold text-white mb-6">
            Ready to book your appointment?
          </h2>
          <p className="text-white/90 text-lg mb-10 max-w-xl mx-auto">
            Secure your spot today. A deposit is required for all bookings to confirm your appointment.
          </p>
          <Link
            href="/book"
            className="inline-block px-10 py-4 bg-white text-gold-600 font-bold text-base uppercase tracking-widest rounded-sm hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-1"
          >
            Book Now
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
};
