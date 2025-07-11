// app/venda-seu-imovel/page.js
import { HeaderPage } from "../components/ui/header-page";
import { Footer } from "../components/ui/footer";
import ImovelFormClient from "./ImovelFormClient";

// ✅ METADATA SEO (IGUAL AO HUB QUE FUNCIONOU)
export const metadata = {
  title: "Cadastre seu Imóvel no HUB de Imobiliárias da NPi",
  description: "Cadastre gratuitamente seu imóvel no HUB DE IMOBILIÁRIAS BOUTIQUE DE ALTO PADRÃO, e dê visibilidade a ele na maior vitrine do mundo, o GOOGLE.",
  keywords: "vender imóvel São Paulo, alugar imóvel, avaliação imóvel gratuita, consultoria imobiliária, venda apartamento, locação casa, corretora imóveis",
  authors: [{ name: "NPI Consultoria" }],
  creator: "NPI Consultoria", 
  publisher: "NPI Consultoria",
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
    url: "https://www.npiconsultoria.com.br/venda-seu-imovel",
    siteName: "NPI Consultoria",
    title: "Venda ou Alugue seu Imóvel com o HUB DE IMOBILIÁRIAS BOUTIQUE DE ALTO PADRÃO | NPi",
    description: "Cadastre gratuitamente seu imóvel no HUB DE IMOBILIÁRIAS BOUTIQUE DE ALTO PADRÃO, e dê visibilidade a ele na maior vitrine do mundo, o GOOGLE.",
    images: [
      {
        url: "https://www.npiconsultoria.com.br/assets/images/imoveis/02.jpg",
        width: 1200,
        height: 630,
        alt: "Venda ou alugue seu imóvel com o HUB da NPI",
        type: "image/jpeg",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@NPIImoveis",
    creator: "@NPIImoveis",
    title: "Venda ou Alugue seu Imóvel com o HUB DE IMOBILIÁRIAS BOUTIQUE DE ALTO PADRÃO | NPi",
    description: "Cadastre gratuitamente seu imóvel no HUB DE IMOBILIÁRIAS BOUTIQUE DE ALTO PADRÃO, e dê visibilidade a ele na maior vitrine do mundo, o GOOGLE.",
    images: ["https://www.npiconsultoria.com.br/assets/images/imoveis/02.jpg"],
  },
  alternates: {
    canonical: "https://www.npiconsultoria.com.br/venda-seu-imovel",
    languages: {
      'pt-BR': "https://www.npiconsultoria.com.br/venda-seu-imovel",
    },
  },
  other: {
    'article:published_time': new Date().toISOString(),
    'article:modified_time': new Date().toISOString(),
    'article:author': 'NPI Consultoria',
    'article:section': 'Imobiliário',
    'article:tag': 'venda imóvel, locação imóvel, avaliação gratuita, consultoria imobiliária',
  },
};

// ✅ STRUCTURED DATA (IGUAL AO HUB)
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Venda ou Alugue seu Imóvel com o HUB DE IMOBILIÁRIAS BOUTIQUE DE ALTO PADRÃO | NPi",
  description: "Cadastre gratuitamente seu imóvel para venda ou locação no HUB DE IMOBILIÁRIAS BOUTIQUE DE ALTO PADRÃO, e dê visibilidade a ele na maior vitrine do mundo, o GOOGLE.",
  url: "https://www.npiconsultoria.com.br/venda-seu-imovel",
  mainEntity: {
    "@type": "RealEstateAgent",
    name: "NPI Consultoria",
    url: "https://www.npiconsultoria.com.br",
    logo: "https://www.npiconsultoria.com.br/assets/images/logo-npi.png",
    sameAs: [
      "https://www.instagram.com/npiconsultoria",
      "https://www.linkedin.com/company/npi-consultoria",
      "https://www.facebook.com/npiconsultoria"
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "São Paulo",
      addressRegion: "SP", 
      addressCountry: "BR"
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+55-11-2814-4414",
      contactType: "customer service",
      areaServed: "BR",
      availableLanguage: "Portuguese"
    },
    serviceType: ["Venda de Imóveis", "Locação de Imóveis", "Avaliação Imobiliária"]
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
        name: "Venda seu Imóvel",
        item: "https://www.npiconsultoria.com.br/venda-seu-imovel"
      }
    ]
  },
  datePublished: new Date().toISOString(),
  dateModified: new Date().toISOString(),
  author: {
    "@type": "Organization",
    name: "NPI Consultoria"
  },
  publisher: {
    "@type": "Organization", 
    name: "NPI Consultoria",
    logo: {
      "@type": "ImageObject",
      url: "https://www.npiconsultoria.com.br/assets/images/logo-npi.png"
    }
  }
};

// ✅ SERVER COMPONENT (SEM "use client")
export default async function ImovelFormPage() {
  return (
    <>
      {/* ✅ STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      <section>
        <HeaderPage
          title="Cadastre seu imóvel GRATUITAMENTE no HUB da NPi"
          description="Cadastre seu imóvel para venda ou locação no HUB DE IMOBILIÁRIAS BOUTIQUE DE ALTO PADRÃO, e dê visibilidade a ele na maior vitrine do mundo, o GOOGLE."
          image="/assets/images/imoveis/02.jpg"
        />
        
        {/* ✅ COMPONENTE CLIENT COM FORMULÁRIO */}
        <ImovelFormClient />
        
        <Footer />
      </section>
    </>
  );
}
