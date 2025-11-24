import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function BookingSuccessPage() {
  return (
    <main className="min-h-screen bg-dark-50">
      <Navbar />
      
      <section className="pt-40 pb-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
            <div className="bg-white p-12 rounded-lg shadow-xl border border-gold-400/20">
                <div className="flex justify-center mb-6">
                    <CheckCircle className="w-20 h-20 text-green-500" />
                </div>
                <h1 className="text-4xl font-serif font-bold text-dark-400 mb-4">Booking Confirmed!</h1>
                <p className="text-dark-500 text-lg mb-8">
                    Thank you for booking with Hair by Noella. We have received your request and will be in touch shortly to confirm the details.
                </p>
                <div className="flex justify-center gap-4">
                    <Link 
                        href="/"
                        className="px-8 py-3 bg-dark-800 text-white font-medium rounded-sm hover:bg-dark-700 transition-colors"
                    >
                        Return Home
                    </Link>
                    <Link 
                        href="/services"
                        className="px-8 py-3 border border-dark-200 text-dark-600 font-medium rounded-sm hover:bg-dark-50 transition-colors"
                    >
                        View Services
                    </Link>
                </div>
            </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
