import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SignInForm } from "@/components/auth/auth-forms";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <section className="pt-40 pb-20 px-4 flex justify-center items-center min-h-[80vh]">
        <SignInForm />
      </section>

      <Footer />
    </main>
  );
}
