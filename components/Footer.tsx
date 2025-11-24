"use client";

import Link from "next/link";
import { Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-100 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <Link href="/" className="text-3xl font-serif font-bold text-gold-400 tracking-wider block mb-6">
              NOELLA
            </Link>
            <p className="text-dark-500 leading-relaxed mb-6">
              Elevating your natural beauty with premium hair styling services in the heart of London.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-dark-500 hover:text-gold-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-dark-500 hover:text-gold-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-dark-500 hover:text-gold-400 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-dark-400 font-bold uppercase tracking-widest mb-6">Explore</h4>
            <ul className="space-y-4">
              <li>
                <Link href="#home" className="text-dark-500 hover:text-gold-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="#services" className="text-dark-500 hover:text-gold-400 transition-colors">Services</Link>
              </li>
              <li>
                <Link href="#about" className="text-dark-500 hover:text-gold-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="#book" className="text-dark-500 hover:text-gold-400 transition-colors">Book Now</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-dark-400 font-bold uppercase tracking-widest mb-6">Services</h4>
            <ul className="space-y-4">
              <li className="text-dark-500">Box Braids</li>
              <li className="text-dark-500">Knotless Braids</li>
              <li className="text-dark-500">Sew-in Weaves</li>
              <li className="text-dark-500">Silk Press</li>
              <li className="text-dark-500">Custom Wigs</li>
            </ul>
          </div>

          {/* Contact */}
          <div id="contact">
            <h4 className="text-dark-400 font-bold uppercase tracking-widest mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-dark-500">
                <MapPin className="w-5 h-5 text-gold-400 shrink-0" />
                <span>123 Fashion Street,<br />London, E1 6PX</span>
              </li>
              <li className="flex items-center gap-3 text-dark-500">
                <Phone className="w-5 h-5 text-gold-400 shrink-0" />
                <span>+44 20 1234 5678</span>
              </li>
              <li className="flex items-center gap-3 text-dark-500">
                <Mail className="w-5 h-5 text-gold-400 shrink-0" />
                <span>hello@hairbynoella.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-dark-500">
          <p>&copy; {new Date().getFullYear()} Hair by Noella. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
