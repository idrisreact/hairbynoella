"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  
  console.log("Navbar Session Debug:", { session, isPending });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                router.push("/");
                router.refresh();
            },
        },
    });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-serif font-bold text-dark-400">
          Hair by Noella
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm uppercase tracking-widest text-dark-400 hover:text-gold-600 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          
          {session ? (
            <div className="flex items-center gap-4 ml-4 border-l border-dark-100 pl-4">
                {(session.user as any).role === "admin" && (
                    <Link 
                        href="/admin"
                        className="text-sm font-bold text-gold-600 hover:text-gold-700"
                    >
                        Admin
                    </Link>
                )}
                <button 
                    onClick={handleSignOut}
                    className="text-sm text-dark-400 hover:text-red-500 transition-colors"
                >
                    Sign Out
                </button>
                <div className="flex items-center gap-2">
                    {session.user.image ? (
                        <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 font-bold text-xs">
                            {session.user.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                        </div>
                    )}
                    <span className="text-sm font-medium text-dark-500 hidden lg:block">
                        {session.user.name}
                    </span>
                </div>
            </div>
          ) : (
            <Link
                href="/sign-in"
                className="ml-4 px-6 py-2 border border-dark-400 text-dark-400 text-sm uppercase tracking-widest hover:bg-dark-400 hover:text-white transition-all rounded-sm"
            >
                Sign In
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-dark-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-dark-400 hover:text-gold-600 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-gray-100" />
              {session ? (
                <>
                    {(session.user as any).role === "admin" && (
                        <Link 
                            href="/admin"
                            className="text-gold-600 font-bold py-2"
                            onClick={() => setIsOpen(false)}
                        >
                            Admin Dashboard
                        </Link>
                    )}
                    <button 
                        onClick={() => {
                            handleSignOut();
                            setIsOpen(false);
                        }}
                        className="text-left text-red-500 py-2"
                    >
                        Sign Out
                    </button>
                </>
              ) : (
                <Link
                    href="/sign-in"
                    className="text-dark-400 hover:text-gold-600 py-2"
                    onClick={() => setIsOpen(false)}
                >
                    Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
