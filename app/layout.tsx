import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hair by Noella | Premium Hair Styling in London",
  description: "Experience luxury hair styling with Noella. Specializing in braids, weaves, and natural hair care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-dark-900 text-foreground`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
