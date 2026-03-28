import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Platforms from "@/components/landing/Platforms";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Platforms />
      <Pricing />
      <Footer />
    </div>
  );
}
