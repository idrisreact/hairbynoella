"use client";

import Link from "next/link";
import { Instagram, Facebook, Youtube, Music2, Mail, MapPin, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-gray-200 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <Link href="/" className="text-3xl font-serif font-bold text-gold-400 tracking-wider block mb-6">
              NOELLA
            </Link>
            <p className="text-dark-500 leading-relaxed mb-6">
              Where hair dreams come true — bespoke styling, colour and treatments in the heart of London.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/hairbynoella/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-500 hover:text-gold-400 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/hairbynoella/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-500 hover:text-gold-400 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@hairbynoella"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-500 hover:text-gold-400 transition-colors"
                aria-label="TikTok"
              >
                <Music2 size={20} />
              </a>
              <a
                href="https://www.youtube.com/@hairbynoella"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-500 hover:text-gold-400 transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
              <a href="mailto:hairbynoella123@outlook.com" className="text-dark-500 hover:text-gold-400 transition-colors">
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
              <li className="text-dark-500">Hair Styling</li>
              <li className="text-dark-500">Hair Colouring</li>
              <li className="text-dark-500">Hair Treatments</li>
              <li className="text-dark-500">Consultations</li>
            </ul>
          </div>

          {/* Contact */}
          <div id="contact">
            <h4 className="text-dark-400 font-bold uppercase tracking-widest mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-dark-500">
                <MapPin className="w-5 h-5 text-gold-400 shrink-0" />
                <span>London — location shared upon booking confirmation</span>
              </li>
              <li className="flex items-center gap-3 text-dark-500">
                <Mail className="w-5 h-5 text-gold-400 shrink-0" />
                <span>hairbynoella123@outlook.com</span>
              </li>
              <li className="flex items-start gap-3 text-dark-500">
                <Clock className="w-5 h-5 text-gold-400 shrink-0" />
                <span>
                  Mon–Tue: 10am–6:30pm<br />
                  Wed: Closed<br />
                  Thu–Fri: 10am–6:30pm<br />
                  Sat: Advance bookings<br />
                  Sun: 11am–5pm
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-dark-500">
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
