import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Clock, Instagram, Facebook, Youtube, Music2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Hair by Noella in London. Email us, find our opening hours, or follow us on Instagram, TikTok, Facebook and YouTube. Book online anytime.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us | Hair by Noella",
    description:
      "Email, opening hours and socials for Hair by Noella, London.",
    url: "/contact",
  },
};

const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Hair by Noella",
  url: `${siteConfig.url}/contact`,
  about: { "@id": `${siteConfig.url}/#salon` },
};

const socials = [
  { name: "Instagram", href: "https://www.instagram.com/hairbynoella/", icon: Instagram },
  { name: "Facebook", href: "https://www.facebook.com/hairbynoella/", icon: Facebook },
  { name: "TikTok", href: "https://www.tiktok.com/@hairbynoella", icon: Music2 },
  { name: "YouTube", href: "https://www.youtube.com/@hairbynoella", icon: Youtube },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-dark-400 selection:bg-gold-400/30">
      <JsonLd data={contactPageSchema} />
      <Navbar />

      {/* Header */}
      <section className="relative pt-40 pb-20 bg-dark-800 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="text-gold-400 text-sm font-bold tracking-[0.2em] uppercase block mb-4">
            Get in Touch
          </span>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-dark-400 mb-6">
            Contact Us
          </h1>
          <p className="text-dark-500 text-lg max-w-2xl mx-auto font-light">
            Questions about a service or your booking? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Details */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gold-200 transition-all">
              <div className="inline-flex p-4 bg-gold-400/10 rounded-full text-gold-600 mb-6">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-3">Email</h2>
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-gray-600 hover:text-gold-600 transition-colors break-all"
              >
                {siteConfig.email}
              </a>
            </div>

            <div className="text-center p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gold-200 transition-all">
              <div className="inline-flex p-4 bg-gold-400/10 rounded-full text-gold-600 mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-3">Location</h2>
              <p className="text-gray-600">
                London — exact location shared upon booking confirmation
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gold-200 transition-all">
              <div className="inline-flex p-4 bg-gold-400/10 rounded-full text-gold-600 mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-3">Opening Hours</h2>
              <ul className="text-gray-600 space-y-1">
                <li>Mon–Tue: 10am–6:30pm</li>
                <li>Wed: Closed</li>
                <li>Thu–Fri: 10am–6:30pm</li>
                <li>Sat: Advance bookings</li>
                <li>Sun: 11am–5pm</li>
              </ul>
            </div>
          </div>

          {/* Socials */}
          <div className="text-center mt-16">
            <p className="text-gray-500 mb-6">Follow us for the latest transformations</p>
            <div className="flex items-center justify-center gap-6">
              {socials.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="p-3 rounded-full border border-gray-200 text-gray-500 hover:text-gold-600 hover:border-gold-400 transition-all"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-24 bg-gold-400 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-serif font-bold text-white mb-6">
            The fastest way to reach us? Book online.
          </h2>
          <p className="text-white/90 text-lg mb-10 max-w-xl mx-auto">
            Pick a service, choose a time that suits you, and you&apos;ll receive an instant email confirmation.
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
}
