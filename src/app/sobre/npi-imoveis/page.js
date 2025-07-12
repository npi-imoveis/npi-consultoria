import { HeaderPage } from "@/app/components/ui/header-page";
import SobreNPI from "./sections/SobreNpi";
import { getContentSite } from "@/app/services";
import { HistoriaNpi } from "./sections/HistoriaNpi";
import VideoNpi from "./sections/VideoNpi";

// Metadata completo para SEO
export const metadata = {
  title: "Sobre NPi Imóveis - A nossa história",
  description: "Começamos com imobiliária tradicional em Moema, SP, mas já com a parceria em nosso DNA, e hoje sonos um HUB DE IMOBILIÁRIAS BOUTIQUE DE ALTO PADRÃO.",
  keywords: "NPI Imóveis, imobiliária, Hub de imobiliárias, alto padrão, parceria imobiliária, imóveis, consultoria personalizada",
  
  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    title: "Sobre NPi Imóveis - A nossa história",
    description: "Começamos com imobiliária tradicional em Moema, SP, mas já com a parceria em nosso DNA, e hoje sonos um HUB DE IMOBILIÁRIAS BOUTIQUE DE ALTO PADRÃO.",
    url: "https://npiconsultoria.com.br/sobre/npi-imoveis",
    siteName: "NPi Consultoria",
    images: [
      {
        url: "https://npiconsultoria.com.br/assets/images/imoveis/02.jpg",
        width: 1200,
        height: 630,
        alt: "NPi Imóveis - Consultoria Imobiliária",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  
  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Sobre NPi Imóveis - A nossa história",
    description: "Começamos com imobiliária tradicional em Moema, SP, mas já com a parceria em nosso DNA, e hoje sonos um HUB DE IMOBILIÁRIAS BOUTIQUE DE ALTO PADRÃO.",
    images: ["https://npiconsultoria.com.br/assets/images/imoveis/02.jpg"],
    creator: "@npiconsultoria", // Substitua pelo Twitter da empresa se houver
    site: "@npiconsultoria", // Substitua pelo Twitter da empresa se houver
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
    "article:publisher": "https://www.facebook.com/npiconsultoria", // Substitua pela página do Facebook
  },
  
  // Para verificação do Google Search Console (se necessário)
  verification: {
    google: "seu-codigo-de-verificacao-aqui", // Adicione se tiver
  },
  
  // Configurações adicionais
  category: "business",
  classification: "Consultoria Imobiliária",
  
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
        title={content?.sobre_npi?.header?.title}
        description={content?.sobre_npi?.header?.subtitle}
        image="/assets/images/imoveis/02.jpg"
      />
      <SobreNPI sobre={content?.sobre_npi} />
      <HistoriaNpi historia={content?.sobre_npi?.historia} />
      <VideoNpi missao={content?.sobre_npi?.missao} />
    </section>
  );
}
