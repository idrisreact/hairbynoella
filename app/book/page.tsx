import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Book an Appointment Online",
  description:
    "Book your hair appointment with Hair by Noella in London. Choose a service, pick a date and time, and secure your slot online in minutes.",
  alternates: { canonical: "/book" },
  openGraph: {
    title: "Book an Appointment | Hair by Noella",
    description:
      "Choose a service, pick a date and time, and secure your hair appointment online.",
    url: "/book",
  },
};

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
            <Suspense fallback={<div className="text-center py-20">Loading booking form...</div>}>
                <BookingForm />
            </Suspense>
        </div>
      </section>

      <Footer />
    </main>
  );
}
