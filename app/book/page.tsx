import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { Suspense } from "react";

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-dark-50">
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
