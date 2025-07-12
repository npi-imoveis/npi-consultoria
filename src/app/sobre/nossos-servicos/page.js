import { HeaderPage } from "@/app/components/ui/header-page";
import { getContentSite } from "@/app/services";
import { BriefcaseBusinessIcon } from "lucide-react";

// Metadata completo para SEO
export const metadata = {
  title: "NPi Imóveis - Nossos Serviços | Consultoria Imobiliária e Parcerias Estratégicas",
  description: "Conheça todos os serviços da NPi Imóveis: consultoria personalizada, assessoria jurídica, posicionamento digital e parcerias estratégicas no mercado imobiliário.",
  keywords: "serviços imobiliários, consultoria imobiliária, assessoria jurídica, SEO imóveis, parcerias estratégicas, NPi Imóveis, mercado imobiliário",
  
  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    title: "NPi Imóveis - Nossos Serviços Especializados",
    description: "Soluções completas em consultoria imobiliária, SEO e parcerias estratégicas para o mercado de alto padrão.",
    url: "https://npiconsultoria.com.br/sobre/nossos-servicos",
    siteName: "NPi Consultoria",
    images: [
      {
        url: "https://npiconsultoria.com.br/assets/thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "NPi Imóveis - Nossos Serviços Especializados",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  
  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "NPi Imóveis - Nossos Serviços Especializados",
    description: "Soluções completas em consultoria imobiliária, SEO e parcerias estratégicas para o mercado de alto padrão.",
    images: ["https://npiconsultoria.com.br/assets/thumbnail.jpg"],
    creator: "@npiconsultoria",
    site: "@npiconsultoria",
  },
  
  // Canonical URL
  alternates: {
    canonical: "https://npiconsultoria.com.br/sobre/nossos-servicos",
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
  classification: "Serviços Imobiliários",
  
  // Meta tags adicionais
  metadataBase: new URL("https://npiconsultoria.com.br"),
};

// Disable static generation for pages that make API calls
export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  let content = {};
  
  try {
    content = await getContentSite();
  } catch (error) {
    console.error("Erro ao carregar conteúdo:", error);
  }

  return (
    <section>
      <HeaderPage
        title="Nossos Serviços Especializados"
        description="Soluções completas em consultoria imobiliária, SEO e parcerias estratégicas para o mercado de alto padrão."
        image="/assets/images/imoveis/02.jpg"
        breadcrumb={[
          { label: "Home", active: false },
          { label: "Nossos Serviços", active: true }
        ]}
      />
      
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Introdução da seção */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Serviços Completos para o Mercado Imobiliário
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Desde consultoria personalizada até posicionamento digital, oferecemos todas as ferramentas necessárias para seu sucesso no mercado imobiliário de alto padrão.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content?.servicos && Array.isArray(content.servicos) && content.servicos.length > 0 ? (
            content.servicos.map((servico, index) => (
              <div
                key={index}
                className="bg-zinc-50 p-9 space-y-3 relative overflow-hidden rounded-lg hover:bg-zinc-100 transition-colors duration-300"
              >
                <BriefcaseBusinessIcon className="w-6 h-6 text-blue-600" />
                {/* ✅ CORRIGIDO: H1 → H3 (mantendo estilos) */}
                <h3 className="font-bold text-sm text-gray-800">{servico.title}</h3>
                <p className="text-sm text-zinc-900 leading-6">{servico.descricao}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">Serviços em breve...</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gray-50 rounded-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Precisa de algum dos nossos serviços?
          </h3>
          <p className="text-gray-600 mb-6">
            Entre em contato conosco e descubra como podemos ajudar você a alcançar seus objetivos no mercado imobiliário.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Fale Conosco
          </button>
        </div>
      </div>
    </section>
  );
}
