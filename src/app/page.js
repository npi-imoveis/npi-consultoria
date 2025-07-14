// app/page.js -> HOME OTIMIZADA
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
import { getContentSite } from "./services";

export const metadata = {
  title: "NPi Imóveis - HUB de Imobiliárias Boutique de Alto Padrão",
  description: "Somos um HUB de imobiliárias Boutique de alto padrão, e trabalhamos com Venda de apartamentos e casas de luxo.",
  keywords: "imobiliárias boutique, alto padrão, apartamentos de luxo, casas de luxo, hub imobiliário, NPi Imóveis",
  authors: [{ name: "NPi Imóveis" }],
  creator: "NPi Imóveis",
  publisher: "NPi Imóveis",
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_SITE_URL}`),
  robots: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/",
    },
  },
  openGraph: {
    title: "NPi Imóveis - HUB de Imobiliárias Boutique de Alto Padrão",
    description: "Somos um HUB de imobiliárias Boutique que atuam com venda de imóveis de alto padrão, apartamentos e casas de luxo.",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "NPi Imóveis",
    type: "website",
    locale: "pt_BR",
    publishedTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    images: [
      {
        url: "/assets/thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "NPi Imóveis - HUB de Imobiliárias Boutique",
        type: "image/jpeg",
      },
    ],
    updated_time: new Date().toISOString(),
  },
  twitter: {
    card: "summary_large_image",
    site: "@NPIImoveis",
    creator: "@NPIImoveis",
    title: "NPi Imóveis - HUB de Imobiliárias Boutique de Alto Padrão",
    description: "Somos um HUB de imobiliárias Boutique que atuam com venda de imóveis de alto padrão, apartamentos e casas de luxo.",
    images: ["/assets/thumbnail.jpg"],
  },
  other: {
    "google-site-verification": "jIbU4BYULeE_XJZo-2yGSOdfyz-3v0JuI0mqUItNU-4",
    'article:published_time': new Date().toISOString(),
    'article:modified_time': new Date().toISOString(),
    'article:author': 'NPi Imóveis',
    'article:section': 'Imobiliário',
    'article:tag': 'hub imobiliárias, boutique, alto padrão, imóveis de luxo',
    'og:updated_time': new Date().toISOString(),
    'last-modified': new Date().toISOString(),
    'date': new Date().toISOString(),
    'DC.date.modified': new Date().toISOString(),
    'DC.date.created': new Date().toISOString(),
  },
  icons: {
    icon: "/favicon.ico",
  },
};

// Disable static generation for pages that make API calls
export const dynamic = 'force-dynamic';

export default async function Home() {
  let content = {};
  
  try {
    content = await getContentSite();
  } catch (error) {
    console.error("Erro ao carregar conteúdo:", error);
  }

  // Structured Data adicional para datas
  const structuredDataDates = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": process.env.NEXT_PUBLIC_SITE_URL,
    url: process.env.NEXT_PUBLIC_SITE_URL,
    name: "NPi Imóveis - HUB de Imobiliárias Boutique de Alto Padrão",
    description: "Somos um HUB de imobiliárias Boutique de alto padrão, e trabalhamos com Venda de apartamentos e casas de luxo.",
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: "NPi Imóveis",
      url: process.env.NEXT_PUBLIC_SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/assets/images/logo-npi.png`
      }
    },
    publisher: {
      "@type": "Organization",
      name: "NPi Imóveis",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/assets/images/logo-npi.png`
      }
    },
    mainEntity: {
      "@type": "Organization",
      name: "NPi Imóveis",
      alternateName: "NPi Consultoria",
      url: process.env.NEXT_PUBLIC_SITE_URL,
      logo: `${process.env.NEXT_PUBLIC_SITE_URL}/assets/images/logo-npi.png`,
      description: "HUB de imobiliárias Boutique de alto padrão especializado em apartamentos e casas de luxo",
      address: {
        "@type": "PostalAddress",
        addressLocality: "São Paulo",
        addressRegion: "SP",
        addressCountry: "BR"
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+55-11-99999-9999",
        contactType: "customer service",
        areaServed: "BR",
        availableLanguage: "Portuguese"
      },
      sameAs: [
        "https://www.instagram.com/npiimoveis",
        "https://www.linkedin.com/company/npi-imoveis",
        "https://www.facebook.com/npiimoveis"
      ]
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: process.env.NEXT_PUBLIC_SITE_URL
        }
      ]
    }
  };

  // ✅ CONFIGURAÇÕES DE IMAGENS OTIMIZADAS para cada seção
  const imageOptimizations = {
    hero: {
      title: "NPi Imóveis - Encontre seu imóvel de alto padrão",
      alt: "Apartamentos e casas de luxo - NPi HUB Imobiliárias Boutique"
    },
    about: {
      title: "NPi Imóveis - Equipe especializada em imóveis de luxo",
      alt: "Equipe NPi Imóveis - Especialistas em imobiliárias boutique de alto padrão"
    },
    testimonials: {
      titlePattern: (nome) => `Depoimento de ${nome} - Cliente satisfeito NPi`,
      altPattern: (nome) => `${nome} - Cliente NPi Imóveis`
    },
    partners: {
      titlePattern: (nome) => `${nome} - Parceiro NPi HUB Imobiliárias`,
      altPattern: (nome) => `${nome} - Parceria NPi Imóveis`
    },
    faq: {
      title: "Perguntas Frequentes sobre o HUB da NPi",
      alt: "FAQ - Tire suas dúvidas sobre o HUB NPi Imóveis"
    }
  };

  return (
    <div>
      {/* Structured Data para datas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredDataDates),
        }}
      />

      {/* ✅ HEADER com configuração de imagem otimizada */}
      <Header 
        logoTitle="NPi Imóveis - HUB de Imobiliárias Boutique de Alto Padrão"
        logoAlt="NPi Imóveis - Logo da empresa"
      />
      
      {/* ✅ HERO SECTION com configuração de imagem otimizada */}
      <HeroSection 
        imageTitle={imageOptimizations.hero.title}
        imageAlt={imageOptimizations.hero.alt}
      />
      
      {/* ✅ ACTION SECTION com cards otimizados */}
      <ActionSection 
        cards={content?.cards_destacados} 
        imageOptimization={{
          titlePattern: (titulo) => `${titulo} - NPi Imóveis Alto Padrão`,
          altPattern: (titulo) => `${titulo} - Serviço NPi HUB`
        }}
      />
      
      {/* ✅ FEATURED CONDOS já otimizado */}
      <FeaturedCondosSection />
      
      {/* ✅ PROPERTY LIST com otimização */}
      <PropertyList 
        imageOptimization={{
          titlePattern: (empreendimento, bairro, cidade) => 
            `${empreendimento} - ${bairro}, ${cidade} - NPi Imóveis`,
          altPattern: (tipo, empreendimento, bairro) => 
            `${tipo} no ${empreendimento} - ${bairro} - Imóvel de luxo NPi`
        }}
      />
      
      {/* ✅ LIST CITIES com otimização */}
      <ListCities 
        imageOptimization={{
          titlePattern: (cidade) => `Imóveis de alto padrão em ${cidade} - NPi`,
          altPattern: (cidade) => `${cidade} - Apartamentos e casas de luxo NPi Imóveis`
        }}
      />
      
      {/* ✅ LUXURY GRID com otimização */}
      <LuxuryGridSection 
        imageOptimization={{
          titlePattern: (categoria) => `${categoria} de luxo - NPi Imóveis`,
          altPattern: (categoria) => `${categoria} - Alto padrão NPi HUB`
        }}
      />
      
      {/* ✅ ABOUT SECTION com configuração de imagem otimizada */}
      <AboutSection 
        about={content?.sobre}
        imageTitle={imageOptimizations.about.title}
        imageAlt={imageOptimizations.about.alt}
      />
      
      {/* ✅ REVIEW SECTION */}
      <ReviewSection stats={content?.stats} />
      
      {/* ✅ SLIDE PARTNERS com otimização */}
      <SlidePartners 
        imageOptimization={imageOptimizations.partners}
      />
      
      {/* ✅ TESTIMONIALS com otimização */}
      <TestimonialsSection 
        testimonials={content?.testemunhos}
        imageOptimization={imageOptimizations.testimonials}
      />
      
      {/* ✅ FAQ SECTION com título otimizado */}
      <FaqSection 
        faqs={content?.faq}
        title="Perguntas Frequentes sobre o HUB da NPi"
        description="Tire suas principais dúvidas sobre nosso HUB de imobiliárias boutique de alto padrão"
        imageOptimization={imageOptimizations.faq}
      />
      
      {/* ✅ CONTACT SECTION */}
      <ContactSection 
        imageOptimization={{
          title: "NPi Imóveis - Entre em contato conosco",
          alt: "Contato NPi Imóveis - Escritório e atendimento"
        }}
      />
      
      {/* ✅ WHATSAPP FLOAT com otimização */}
      <WhatsappFloat 
        imageTitle="Fale conosco via WhatsApp - NPi Imóveis"
        imageAlt="WhatsApp NPi Imóveis - Atendimento imediato"
      />
      
      {/* ✅ FOOTER */}
      <Footer />
    </div>
  );
}
