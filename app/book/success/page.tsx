import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { CheckCircle, CreditCard, Mail, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  robots: { index: false, follow: false },
};

export default function BookingSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-40 pb-20 px-4">
        <div className="mx-auto max-w-2xl">
            <div className="bg-white p-12 rounded-lg shadow-xl border border-gold-400/20">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <CheckCircle className="w-20 h-20 text-green-500" />
                        <div className="absolute -bottom-1 -right-1 bg-gold-500 rounded-full p-1">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl font-serif font-bold text-dark-400 mb-2 text-center">
                    Payment Successful!
                </h1>
                <p className="text-center text-gold-600 font-semibold mb-8">
                    Your deposit has been received
                </p>

                {/* Payment Confirmation Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                    <p className="text-dark-500 text-center">
                        Thank you for booking with Hair by Noella! Your appointment is confirmed and we've received your deposit payment.
                    </p>
                </div>

                {/* Next Steps */}
                <div className="space-y-4 mb-8">
                    <h2 className="font-semibold text-lg text-dark-400 flex items-center gap-2">
                        <span className="text-gold-500">✓</span>
                        What happens next:
                    </h2>

                    <div className="space-y-3 ml-6">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-gold-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-dark-400">Email Confirmation</p>
                                <p className="text-sm text-gray-600">
                                    Check your email for a confirmation receipt and appointment details
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-gold-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-dark-400">Appointment Reminder</p>
                                <p className="text-sm text-gray-600">
                                    We'll send you a reminder 24 hours before your appointment
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-gold-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-dark-400">Remaining Balance</p>
                                <p className="text-sm text-gray-600">
                                    The remaining balance is due at your appointment
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Important Note */}
                <div className="bg-gold-50 border border-gold-200 rounded-lg p-4 mb-8">
                    <p className="text-sm text-gray-700">
                        <strong>Important:</strong> If you need to reschedule or cancel your appointment,
                        please contact us at least 24 hours in advance.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        href="/"
                        className="px-8 py-3 bg-gold-500 text-white font-medium rounded-md hover:bg-gold-600 transition-colors text-center"
                    >
                        Return Home
                    </Link>
                    <Link
                        href="/services"
                        className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors text-center"
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
