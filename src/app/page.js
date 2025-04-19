import { Hero, HeroSection } from "./components/sections/hero-section";

import { LuxuryGridSection } from "./components/sections/luxury-grid-section";
import { AboutSection } from "./components/sections/about-section";
import { FaqSection } from "./components/sections/faq-section";
import { PropertyList } from "./components/sections/property-list";

import { ActionSection } from "./components/sections/action-section";

import { ListCities } from "./components/sections/list-cities";
import { Header } from "./components/ui/header";
import { Footer } from "./components/ui/footer";
import { ContactSection } from "./components/sections/contact-section";
import { SlidePartners } from "./components/shared/slide-partners";

import { FeaturedCondosSection } from "./components/sections/featured-condos-section";

import { TestimonialsSection } from "./components/sections/testimonials-section";
import { ReviewSection } from "./components/sections/review-section";
import { WhatsappFloat } from "./components/ui/whatsapp";


export const metadata = {
  title: "NPi Imóveis - HUB de Imobiliárias de Alto Padrão",
  description: "Somos um HUB de imobiliárias Boutique que atuam com venda de imóveis de alto padrão, apartamentos e casas de luxo.",
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_SITE_URL}`),
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/pt-BR',
    },
  },
  openGraph: {
    title: "NPi Imóveis - HUB de Imobiliárias de Alto Padrão",
    description: "Somos um HUB de imobiliárias Boutique que atuam com venda de imóveis de alto padrão, apartamentos e casas de luxo.",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "NPi Imóveis",
    images: [
      {
        url: "/assets/thumbnail.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NPi Imóveis - HUB de Imobiliárias de Alto Padrão",
    description: "Somos um HUB de imobiliárias Boutique que atuam com venda de imóveis de alto padrão, apartamentos e casas de luxo.",
    images: ["/assets/thumbnail.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};


export default function Home() {
  return (
    <div>
      <Header />
      <HeroSection />
      <PropertyList />

      <AboutSection />
      <ReviewSection />

      <ActionSection />
      <FeaturedCondosSection />

      <LuxuryGridSection />
      <FaqSection />
      <ListCities />

      <TestimonialsSection />
      <ContactSection />
      <SlidePartners />
      <WhatsappFloat />
      <Footer />
    </div>
  );
}
