import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { JsonLd, hairSalonSchema } from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/site";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-dark-400 selection:bg-gold-400/30">
      <JsonLd data={hairSalonSchema(siteConfig.url)} />
      <Navbar />
      <Hero />
      <Services />
      
      {/* About Section */}
      <section id="about" className="py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* Image Side */}
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: "url('https://q36tiv9jtn.ufs.sh/f/dnqy2lKDF86Tl8Y4dDny7H2aWuSYnITrEVQymcpiNZl1oKzk')" }}
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-gold-100 rounded-full -z-10 blur-3xl opacity-50" />
            </div>

            {/* Content Side */}
            <div className="space-y-8 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-200 bg-gold-50">
                <span className="text-xs tracking-wider text-gray-700 font-medium">About Noella</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 leading-tight">
                Where hair dreams
                <span className="block font-serif italic text-gold-600 mt-2">come true</span>
              </h2>

              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p className="text-lg font-light">
                  Noella brings expert hair styling, colouring and treatments together under one roof, working with premium, trusted brands to give every client a result that looks as good as it feels.
                </p>
                <p className="text-lg font-light">
                  Located in the heart of London, the studio offers a private, relaxing environment — take a deep breath, inhale peace, and exhale happiness while your look is transformed.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Expertise</div>
                  <div className="text-xl font-light text-gray-900">Styling & Colour</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Specialty</div>
                  <div className="text-xl font-light text-gray-900">Precision Treatments</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="text-xl font-light text-gray-900">Central London</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Trusted Brands</div>
                  <div className="text-xl font-light text-gray-900">Wella · Olaplex · Yuko</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Brands Strip */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <p className="text-gray-500 font-light max-w-2xl mx-auto mb-8">
            Transforming beauty with premium excellence through top-tier products.
            Experience the difference of luxurious results and lasting satisfaction.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {["Wella", "Olaplex", "Caci White", "Yuko"].map((brand) => (
              <span
                key={brand}
                className="text-2xl font-serif italic text-gray-400 tracking-wide"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
      
      {/* CTA Section */}
      <section id="book" className="py-32 bg-gray-900 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-600/30 bg-gold-600/10">
              <span className="text-xs tracking-wider text-gold-400 font-medium">Ready to Transform</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-tight">
              Begin your
              <span className="block font-serif italic text-gold-400 mt-2">
                beauty journey
              </span>
            </h2>

            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
              Experience the perfect blend of artistry and expertise. Book your appointment today and step into a world where your vision becomes reality.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="/book"
                className="group px-10 py-5 bg-white text-gray-900 text-sm font-medium tracking-wide rounded-full hover:bg-gray-100 transition-all duration-300 inline-flex items-center gap-2 shadow-xl"
              >
                Book Appointment
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#services"
                className="px-10 py-5 text-gray-300 text-sm font-medium tracking-wide hover:text-white transition-colors inline-flex items-center gap-2 group"
              >
                View Services
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
