"use client";

import { motion } from "framer-motion";
import { Scissors, Sparkles, Palette, MessageCircle } from "lucide-react";

const services = [
  {
    title: "Hair Styling",
    description: "Unlock your true beauty with expert hair styling — cuts, blow-dries and finishing.",
    icon: <Scissors className="w-8 h-8 text-gold-400" />,
    price: "From £35",
  },
  {
    title: "Hair Colouring",
    description: "Transforming tresses, painting dreams — your colour, your canvas.",
    icon: <Palette className="w-8 h-8 text-gold-400" />,
    price: "From £55",
  },
  {
    title: "Hair Treatments",
    description: "Nourish your locks and unleash your radiance with restorative treatments.",
    icon: <Sparkles className="w-8 h-8 text-gold-400" />,
    price: "From £35",
  },
  {
    title: "Consultation",
    description: "A one-on-one consultation to plan the perfect look for your hair.",
    icon: <MessageCircle className="w-8 h-8 text-gold-400" />,
    price: "By Appointment",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-gold-400 text-sm font-bold tracking-[0.2em] uppercase block mb-2">
            Our Expertise
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-dark-400 mb-6">
            Exclusive Services
          </h2>
          <div className="w-24 h-1 bg-gold-400 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group p-8 bg-dark-800 border border-gray-200 hover:border-gold-400/30 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-md"
            >
              <div className="mb-6 p-4 bg-white w-fit rounded-full group-hover:scale-110 transition-transform duration-300 border border-gray-200 shadow-sm">
                {service.icon}
              </div>
              <h3 className="text-xl font-serif font-bold text-dark-400 mb-3 group-hover:text-gold-400 transition-colors">
                {service.title}
              </h3>
              <p className="text-dark-500 text-sm leading-relaxed mb-6">
                {service.description}
              </p>
              <span className="text-gold-300 font-medium text-sm uppercase tracking-wider">
                {service.price}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
