import { HeaderPage } from "@/app/components/ui/header-page";
import { SobreHub } from "./components/SobreHub";
import { ComoFuncionaHub } from "./components/ComoFuncionaHub";
import { ReviewSection } from "@/app/components/sections/review-section";
import { HubPartnersSlide } from "./components/HubPartnersSlide";
import { FaqHub } from "./components/FaqHub";
import { ContactSection } from "@/app/components/sections/contact-section";
import { getContentSite } from "@/app/services";

export const metadata = {
  title: "Hub de Imobiliárias Boutique de Alto Padrão | NPi Imóveis",
  description: "Conheça o Hub Imobiliárias Boutique de Alto Padrão da NPi: plataforma exclusiva que conecta imobiliárias a clientes qualificados pronto para compra.",
  keywords: "hub imobiliárias, imobiliárias boutique, alto padrão, mercado imobiliário de luxo, NPi Imóveis, plataforma imobiliária, conexão imobiliárias",
  authors: [{ name: "NPi Imóveis" }],
  creator: "NPi Imóveis",
  publisher: "NPi Imóveis",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.npiconsultoria.com.br/sobre/hub-imobiliarias",
    siteName: "NPi Imóveis",
    title: "Hub de Imobiliárias Boutique de Alto Padrão | NPi Imóveis",
    description: "Descubra o Hub Imobiliárias da NPi: plataforma exclusiva que conecta imobiliárias boutique de alto padrão, oferecendo soluções inovadoras e resultados excepcionais no mercado imobiliário de luxo.",
    images: [
      {
        url: "https://www.npiconsultoria.com.br/assets/images/hub-imobiliarias-og.jpg",
        width: 1200,
        height: 630,
        alt: "Hub de Imobiliárias Boutique NPi Imóveis",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@npiimoveis",
    creator: "@npiimoveis",
    title: "Hub de Imobiliárias Boutique de Alto Padrão | NPi Imóveis",
    description: "Descubra o Hub Imobiliárias da NPi: plataforma exclusiva que conecta imobiliárias boutique de alto padrão, oferecendo soluções inovadoras e resultados excepcionais.",
    images: ["https://www.npiconsultoria.com.br/assets/images/hub-imobiliarias-twitter.jpg"],
  },
  alternates: {
    canonical: "https://www.npiconsultoria.com.br/sobre/hub-imobiliarias",
    languages: {
      'pt-BR': "https://www.npiconsultoria.com.br/sobre/hub-imobiliarias",
    },
  },
  other: {
    'article:published_time': new Date().toISOString(),
    'article:modified_time': new Date().toISOString(),
    'article:author': 'NPi Imóveis',
    'article:section': 'Imobiliário',
    'article:tag': 'hub imobiliárias, boutique, alto padrão',
  },
};

// Structured Data (JSON-LD)
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Hub de Imobiliárias Boutique de Alto Padrão",
  description: "Descubra o Hub Imobiliárias da NPi: plataforma exclusiva que conecta imobiliárias boutique de alto padrão, oferecendo soluções inovadoras e resultados excepcionais no mercado imobiliário de luxo.",
  url: "https://www.npiconsultoria.com.br/sobre/hub-imobiliarias",
  mainEntity: {
    "@type": "Organization",
    name: "NPi Imóveis",
    url: "https://www.npiconsultoria.com.br",
    logo: "https://www.npiconsultoria.com.br/assets/images/logo-npi.png",
    sameAs: [
      "https://www.instagram.com/npiimoveis",
      "https://www.linkedin.com/company/npi-imoveis",
      "https://www.facebook.com/npiimoveis"
    ],
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
    }
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.npiconsultoria.com.br"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Sobre",
        item: "https://www.npiconsultoria.com.br/sobre"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Hub Imobiliárias",
        item: "https://www.npiconsultoria.com.br/sobre/hub-imobiliarias"
      }
    ]
  },
  datePublished: new Date().toISOString(),
  dateModified: new Date().toISOString(),
  author: {
    "@type": "Organization",
    name: "NPi Imóveis"
  },
  publisher: {
    "@type": "Organization",
    name: "NPi Imóveis",
    logo: {
      "@type": "ImageObject",
      url: "https://www.npiconsultoria.com.br/assets/images/logo-npi.png"
    }
  }
};

// Disable static generation for pages that make API calls
export const dynamic = 'force-dynamic';

export default async function SobrePage() {
  let content = {};
  
  try {
    content = await getContentSite();
  } catch (error) {
    console.error("Erro ao carregar conteúdo:", error);
  }
  
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      <section>
        <HeaderPage
          title={content?.sobre_hub?.header}
          description={content?.sobre_hub?.header_description}
          image="/assets/images/imoveis/02.jpg"
        />
        <SobreHub sobre={content?.sobre_hub} />
        <ReviewSection stats={content?.stats} />
        <ComoFuncionaHub howto={content?.sobre_hub?.howto} />
        <HubPartnersSlide />
        <FaqHub faqs={content?.faq} />
        <ContactSection />
      </section>
    </>
  );
}
