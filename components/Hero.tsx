"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section id="home" className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-white/40 z-10" />
        {/* Placeholder for actual hero image */}
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat scale-105 animate-slow-zoom"
          style={{ backgroundImage: "url('https://hairbynoella.com/wp-content/uploads/2025/06/WhatsApp-Image-2025-06-28-at-19.10.17-684x1024.jpeg')" }} 
        />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="block text-gold-400 text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-4">
            London's Premier Hairstylist
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-dark-400 mb-6 leading-tight">
            Elevate Your <br />
            <span className="text-gradient-gold italic">Natural Beauty</span>
          </h1>
          <p className="text-dark-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Specializing in bespoke braids, luxury weaves, and holistic hair care treatments tailored to your unique style.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#book"
              className="px-8 py-4 bg-gold-400 text-white font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-gold-500 transition-all transform hover:-translate-y-1 shadow-lg shadow-gold-400/20"
            >
              Book Appointment
            </a>
            <a
              href="/services"
              className="px-8 py-4 border border-dark-400/20 text-dark-400 font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-dark-400/5 transition-all backdrop-blur-sm"
            >
              View Services
            </a>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-gray-500">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gold-400 to-transparent" />
      </motion.div>
    </section>
  );
}
