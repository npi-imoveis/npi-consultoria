"use client";

import dynamic from 'next/dynamic';

// Importações dinâmicas com lazy loading
const ImageGallery = dynamic(() => import('@/app/components/sections/image-gallery').then(mod => ({ default: mod.ImageGallery })), {
  loading: () => <div className="w-full h-64 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const FAQImovel = dynamic(() => import('./componentes/FAQImovel').then(mod => ({ default: mod.FAQImovel })), {
  ssr: true // Mantém SSR para SEO
});

// Componentes para seções abaixo da dobra - importação dinâmica para otimizar carregamento inicial
const DetalhesCondominio = dynamic(() => import('./componentes/DetalhesCondominio'), {
  loading: () => <div className="w-full h-48 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const LocalizacaoCondominio = dynamic(() => import('./componentes/LocalizacaoCondominio'), {
  loading: () => <div className="w-full h-48 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const FichaTecnica = dynamic(() => import('./componentes/FichaTecnica'), {
  loading: () => <div className="w-full h-48 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const Lazer = dynamic(() => import('./componentes/Lazer'), {
  loading: () => <div className="w-full h-48 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const TituloImovel = dynamic(() => import('./componentes/TituloImovel'), {
  loading: () => <div className="w-full h-32 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const DetalhesImovel = dynamic(() => import('./componentes/DetalhesImovel'), {
  loading: () => <div className="w-full h-32 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const DescricaoImovel = dynamic(() => import('./componentes/DescricaoImovel'), {
  loading: () => <div className="w-full h-32 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const VideoCondominio = dynamic(() => import('./componentes/VideoCondominio'), {
  loading: () => <div className="w-full h-64 bg-zinc-100 animate-pulse rounded-lg"></div>,
  ssr: false
});

const TourVirtual = dynamic(() => import('./componentes/TourVirtual'), {
  loading: () => <div className="w-full h-64 bg-zinc-100 animate-pulse rounded-lg"></div>,
  ssr: false
});

// Componente de formulário de contato - carregado com lazy loading
const Contato = dynamic(() => import('./componentes/Contato'), {
  loading: () => <div className="w-full h-96 bg-zinc-100 animate-pulse rounded-lg"></div>,
  ssr: false // Não precisa de SSR pois é interativo
});

// Componente para propriedades similares
const SimilarProperties = dynamic(() => import('./componentes/similar-properties').then(mod => ({ default: mod.SimilarProperties })), {
  loading: () => <div className="w-full h-64 bg-zinc-100 animate-pulse rounded-lg"></div>
});

// Estas importações permanecem estáticas pois são pequenas ou essenciais para o primeiro render
import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import useImovelStore from "@/app/store/imovelStore";
import { getImovelById } from "@/app/services";
import StructuredData from "@/app/components/structured-data";
import { smoothScroll, removeHash, handleInitialScroll } from "@/app/utils/smooth-scroll";

const currentUrl = typeof window !== "undefined" ? window.location.href : "";

export default function Imovel() {
  const [imovel, setImovel] = useState({});
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const imovelStore = useImovelStore();

  // Rolar para o topo da página quando o componente for montado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      removeHash();
      window.scrollTo(0, 0);
      handleInitialScroll();
    }
  }, []);

  // Extrair o ID imediatamente (fora do useEffect)
  const idDoImovel = useMemo(() => {
    if (imovelStore.id) {
      return imovelStore.id;
    }

    const segments = pathname.split("/");
    for (const segment of segments) {
      if (segment.startsWith("imovel-")) {
        const id = segment.replace("imovel-", "");
        if (id && !isNaN(id)) {
          return id;
        }
      }
    }
    return null;
  }, [pathname, imovelStore.id]);

  // Buscar os dados do imóvel assim que o componente monta
  useEffect(() => {
    let isMounted = true;

    const carregarImovel = async () => {
      if (!idDoImovel) return;

      setLoading(true);

      // Verificar primeiro se o imóvel existe no store
      const imovelDoStore = imovelStore.getImovelDoCache(idDoImovel);

      if (imovelDoStore) {
        setImovel(imovelDoStore);
        setLoading(false);
        return;
      }

      // Se não estiver no store, buscar da API
      try {
        const response = await getImovelById(idDoImovel);

        if (isMounted && response.data) {
          setImovel(response.data);
          imovelStore.adicionarImovelCache(idDoImovel, response.data);
        }
      } catch (error) {
        console.error("Erro ao buscar imóvel:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarImovel();

    return () => {
      isMounted = false;
    };
  }, [idDoImovel, imovelStore]);

  // Configurando o título da página
  useEffect(() => {
    if (imovel?.Empreendimento) {
      const pageTitle = imovel.Empreendimento;
      document.title = pageTitle;

      // Adicionar meta description mais otimizada
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.name = "description";
        document.head.appendChild(metaDescription);
      }

      // SEO: Descrição mais rica em palavras-chave relevantes
      metaDescription.content = `${imovel.Categoria} à venda em ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.Empreendimento}: ${imovel.DormitoriosAntigo} quartos, ${imovel.Suites} suítes, ${imovel.BanheiroSocialQtd} banheiros, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt}. ${imovel.Situacao}. Valor: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : 'Consulte'}. ${imovel.TipoEndereco} ${imovel.Endereco}, ${imovel.Numero}.`;

      // Adicionar meta tags de Open Graph para melhorar compartilhamento
      const metaTags = [
        { property: "og:title", content: pageTitle },
        { property: "og:description", content: metaDescription.content },
        { property: "og:type", content: "website" },
        { property: "og:url", content: currentUrl },
        { property: "og:image", content: imovel.Foto && imovel.Foto.length > 0 ? imovel.Foto[0].Foto : "" },
        { name: "twitter:card", content: "og-image.png" },
        { name: "twitter:title", content: pageTitle },
        { name: "twitter:description", content: metaDescription.content },
        { name: "twitter:image", content: imovel.Foto && imovel.Foto.length > 0 ? imovel.Foto[0].Foto : "" },
        { name: "robots", content: "index, follow" },
        { name: "canonical", content: currentUrl }
      ];

      // Atualizar ou criar meta tags
      metaTags.forEach(tag => {
        let metaTag;
        const selector = tag.property
          ? `meta[property="${tag.property}"]`
          : `meta[name="${tag.name}"]`;

        metaTag = document.querySelector(selector);

        if (!metaTag) {
          metaTag = document.createElement("meta");
          if (tag.property) {
            metaTag.setAttribute("property", tag.property);
          } else {
            metaTag.setAttribute("name", tag.name);
          }
          document.head.appendChild(metaTag);
        }

        metaTag.setAttribute("content", tag.content);
      });

      // Adicionar link canônico
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.rel = "canonical";
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = currentUrl;
    }
  }, [imovel, currentUrl]);

  // Configurar scroll suave para links internos
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Função para adicionar os event listeners
    const setupSmoothScroll = () => {
      const links = document.querySelectorAll('a[href^="#"]');
      links.forEach(link => {
        // Remover listeners existentes para evitar duplicações
        link.removeEventListener('click', smoothScroll);
        // Adicionar novo listener
        link.addEventListener('click', smoothScroll);
      });
    };

    // Configurar inicialmente
    setupSmoothScroll();

    // Reconfigurar quando o DOM mudar (por segurança, se componentes forem adicionados dinamicamente)
    const observer = new MutationObserver(setupSmoothScroll);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      // Limpar todos os listeners quando o componente for desmontado
      const links = document.querySelectorAll('a[href^="#"]');
      links.forEach(link => {
        link.removeEventListener('click', smoothScroll);
      });

      // Desconectar o observer
      observer.disconnect();
    };
  }, [imovel]); // Reconfigurar quando o imóvel mudar

  console.log("Detalhes deste imóvel: ", imovel);

  // Mostrar indicador de carregamento
  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-white">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 md:h-32 md:w-32 border-t-4 border-b-4 border-black" role="status">
            <span className="sr-only">Carregando informações do imóvel...</span>
          </div>
          <img
            src="/assets/images/bg-hub.png"
            alt="Logo"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 md:h-20 md:w-20 animate-pulse"
            style={{
              animation: "pulse-opacity 1.5s infinite ease-in-out"
            }}
          />
        </div>
        <style jsx>{`
          @keyframes pulse-opacity {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
          }
          .animate-pulse {
            animation: pulse-opacity 1.5s infinite ease-in-out;
          }
        `}</style>
        <p className="mt-4 text-gray-600">Carregando informações do imóvel...</p>
      </div>
    );
  }

  return (
    <section className="w-full bg-white pb-32 pt-20">
      <StructuredData.Apartment
        title={imovel.Empreendimento}
        price={imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : 'Consulte'}
        description={`${imovel.Categoria} à venda em ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.Empreendimento}: ${imovel.DormitoriosAntigo} quartos, ${imovel.Suites} suítes, ${imovel.BanheiroSocialQtd} banheiros, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt}. ${imovel.Situacao}. Valor: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : 'Consulte'}. ${imovel.TipoEndereco} ${imovel.Endereco}.`}
        address={`${imovel.TipoEndereco} ${imovel.Endereco}, ${imovel.Numero}, ${imovel.BairroComercial}, ${imovel.Cidade}`}
        url={currentUrl}
        image={imovel.Foto}
      />

      {/* Breadcrumb Structure Data para SEO */}
      <StructuredData.BreadcrumbList
        items={[
          { name: "Home", url: process.env.NEXT_PUBLIC_SITE_URL || "/" },
          { name: imovel.Categoria || "Imóveis", url: `/busca?categoria=${imovel.Categoria}` },
          { name: imovel.BairroComercialComercial || "Bairro", url: `/busca?bairro=${imovel.BairroComercial}` },
          { name: imovel.Empreendimento || "Empreendimento", url: currentUrl }
        ]}
      />

      {/* Galeria - 100% width para todos os dispositivos */}
      <div className="w-full mx-auto">
        <ImageGallery imovel={imovel} />
      </div>

      {/* Layout responsivo usando flex em mobile e grid em desktop */}
      <div className="container mx-auto gap-4 mt-3 px-4 md:px-0 flex flex-col lg:flex-row">
        {/* Coluna principal - expande para 100% em mobile */}
        <div className="w-full lg:w-[65%]">
          <TituloImovel imovel={imovel} currentUrl={currentUrl} />
          <DetalhesImovel imovel={imovel} />
          <DescricaoImovel imovel={imovel} />
          <FichaTecnica imovel={imovel} />
          <DetalhesCondominio imovel={imovel} />
          <Lazer imovel={imovel} />
          {imovel.Video.length != 0 && <VideoCondominio imovel={imovel} />}
          {imovel.Tour360 && <TourVirtual link={imovel.Tour360} titulo={imovel.Empreendimento} />}
          <SimilarProperties id={imovel.Codigo} />
          <LocalizacaoCondominio imovel={imovel} />
        </div>

        {/* Sidebar - expande para 100% em mobile e fixa em desktop */}
        <div className="w-full lg:w-[35%] h-fit lg:sticky lg:top-24 order-first lg:order-last mb-6 lg:mb-0">
          <Contato imovel={imovel} currentUrl={currentUrl} />
        </div>
      </div>

      {/* FAQ Section para SEO e estrutura de dados */}
      <div className="container mx-auto px-4 md:px-0">
        <FAQImovel imovel={imovel} />
      </div>
    </section>
  );
}
