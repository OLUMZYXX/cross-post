import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Audience from "@/components/landing/Audience";
import AppShowcase from "@/components/landing/AppShowcase";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import CtaBanner from "@/components/landing/CtaBanner";
import Footer from "@/components/landing/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { HOME_FAQS } from "@/config/faqs";
import { organizationSchema, websiteSchema, appSchema, faqSchema } from "@/config/structuredData";

export default function LandingPage() {
  return (
    <div className="site min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Audience />
        <AppShowcase />
        <Features />
        <HowItWorks />
        <Pricing />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
      <JsonLd data={[organizationSchema(), websiteSchema(), appSchema(), faqSchema(HOME_FAQS)]} />
    </div>
  );
}
