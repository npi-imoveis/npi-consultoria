import { HeaderPage } from "@/app/components/ui/header-page";
import SobreNPI from "./sections/SobreNpi";
import { getContentSite } from "@/app/services";
import { HistoriaNpi } from "./sections/HistoriaNpi";
import VideoNpi from "./sections/VideoNpi";

// Metadata completo para SEO
export const metadata = {
  title: "Sobre NPi Imóveis - A nossa história | Hub de Imobiliárias Boutique",
  description: "Começamos com imobiliária tradicional em Moema, SP, mas já com a parceria em nosso DNA, e hoje somos um HUB DE IMOBILIÁRIAS BOUTIQUE DE ALTO PADRÃO.",
  keywords: "NPI Imóveis, imobiliária, Hub de imobiliárias, alto padrão, parceria imobiliária, imóveis, consultoria personalizada, Moema, São Paulo",
  
  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    title: "Sobre NPi Imóveis - A nossa história",
    description: "Começamos com imobiliária tradicional em Moema, SP, mas já com a parceria em nosso DNA, e hoje somos um HUB DE IMOBILIÁRIAS BOUTIQUE DE ALTO PADRÃO.",
    url: "https://npiconsultoria.com.br/sobre/npi-imoveis",
    siteName: "NPi Consultoria",
    images: [
      {
        url: "https://npiconsultoria.com.br/assets/thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "NPi Imóveis - Logo e Identidade Visual",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  
  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Sobre NPi Imóveis - A nossa história",
    description: "Começamos com imobiliária tradicional em Moema, SP, mas já com a parceria em nosso DNA, e hoje somos um HUB DE IMOBILIÁRIAS BOUTIQUE DE ALTO PADRÃO.",
    images: ["https://npiconsultoria.com.br/assets/thumbnail.jpg"],
    creator: "@npiconsultoria",
    site: "@npiconsultoria",
  },
  
  // Canonical URL
  alternates: {
    canonical: "https://npiconsultoria.com.br/sobre/npi-imoveis",
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Dados estruturados básicos
  other: {
    "og:locale": "pt_BR",
    "article:author": "NPi Consultoria",
    "article:publisher": "https://www.facebook.com/npiconsultoria",
  },
  
  // Configurações adicionais
  category: "business",
  classification: "Hub de Imobiliárias Boutique",
  
  // Meta tags adicionais
  metadataBase: new URL("https://npiconsultoria.com.br"),
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
    <section>
      <HeaderPage
        title={content?.sobre_npi?.header?.title || "Sobre a NPi Imóveis"}
        description={content?.sobre_npi?.header?.subtitle || "A nossa história como Hub de Imobiliárias Boutique"}
        image="/assets/images/imoveis/02.jpg"
        breadcrumb={[
          { label: "Home", active: false },
          { label: "Sobre", active: false },
          { label: "NPi Imóveis", active: true }
        ]}
      />
      <SobreNPI sobre={content?.sobre_npi} />
      <HistoriaNpi historia={content?.sobre_npi?.historia} />
      <VideoNpi missao={content?.sobre_npi?.missao} />
    </section>
  );
}
