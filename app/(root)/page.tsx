import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-dark-400 selection:bg-gold-400/30">
      <Navbar />
      <Hero />
      <Services />
      
      {/* About Section */}
      <section id="about" className="py-24 bg-white relative">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 relative">
            <div className="aspect-[3/4] bg-dark-800 rounded-sm overflow-hidden relative z-10">
               {/* Placeholder for about image */}
               <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1998&auto=format&fit=crop')" }} 
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-2/3 h-2/3 border-2 border-gold-400 z-0" />
            <div className="absolute -top-6 -left-6 w-2/3 h-2/3 bg-dark-800 z-0" />
          </div>
          
          <div className="w-full lg:w-1/2">
            <span className="text-gold-400 text-sm font-bold tracking-[0.2em] uppercase block mb-4">
              About Noella
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-dark-400 mb-8 leading-tight">
              Crafting Confidence <br /> Through Hair
            </h2>
            <p className="text-dark-500 text-lg leading-relaxed mb-6">
              With over 10 years of experience in the hair industry, Noella has mastered the art of protective styling and natural hair care. Her passion lies in creating styles that not only look stunning but also promote the health of your natural hair.
            </p>
            <p className="text-dark-500 text-lg leading-relaxed mb-10">
              Located in the heart of London, our studio offers a private, relaxing environment where you can unwind while we transform your look.
            </p>
            
            <div className="flex gap-8">
              <div>
                <span className="block text-4xl font-serif font-bold text-gold-400 mb-2">10+</span>
                <span className="text-sm uppercase tracking-wider text-dark-500">Years Experience</span>
              </div>
              <div>
                <span className="block text-4xl font-serif font-bold text-gold-400 mb-2">5k+</span>
                <span className="text-sm uppercase tracking-wider text-dark-500">Happy Clients</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />
      
      {/* CTA Section */}
      <section id="book" className="py-32 bg-gold-400 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8">
            Ready for your transformation?
          </h2>
          <p className="text-white/90 text-xl max-w-2xl mx-auto mb-12 font-medium">
            Book your appointment today and experience the luxury service you deserve.
          </p>
          <button className="px-10 py-5 bg-white text-gold-600 font-bold text-base uppercase tracking-widest rounded-sm hover:bg-dark-100 transition-all shadow-2xl hover:-translate-y-1">
            Book Appointment Now
          </button>
        </div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-multiply" />
      </section>

      <Footer />
    </main>
  );
}
