import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SignUpForm } from "@/components/auth/auth-forms";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-dark-50">
      <Navbar />
      
      <section className="pt-40 pb-20 px-4 flex justify-center items-center min-h-[80vh]">
        <SignUpForm />
      </section>

      <Footer />
    </main>
  );
}
