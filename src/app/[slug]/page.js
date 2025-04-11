"use client";

import { Button } from "@/app/components/ui/button";
import { useRef, useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { getCondominioPorSlug } from "@/app/services";
import { useParams, useRouter } from "next/navigation";
import { formatterValue } from "../utils/formatter-value";
import StructuredData from "@/app/components/structured-data";
import { Share } from "../components/ui/share";
import { PropertyTableOwner } from "./componentes/property-table-owner";
import Error from '../error';

// Importações dinâmicas para componentes grandes ou abaixo da dobra
const CondominioGallery = dynamic(() => import('./componentes/condominio-gallery'), {
  loading: () => <div className="w-full h-64 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const PropertyTable = dynamic(() => import('./componentes/property-table').then(mod => mod.PropertyTable), {
  loading: () => <div className="w-full h-32 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const ImoveisRelacionados = dynamic(() => import('./componentes/related-properties').then(mod => mod.ImoveisRelacionados), {
  loading: () => <div className="w-full h-48 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const SobreCondominio = dynamic(() => import('./componentes/SobreCondominio'), {
  loading: () => <div className="w-full h-64 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const FichaTecnica = dynamic(() => import('./componentes/FichaTecnica'), {
  loading: () => <div className="w-full h-48 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const DiferenciaisCondominio = dynamic(() => import('./componentes/DiferenciaisCondominio'), {
  loading: () => <div className="w-full h-48 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const Lazer = dynamic(() => import('./componentes/Lazer'), {
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

const ExploreRegiao = dynamic(() => import('./componentes/ExploreRegiao'), {
  loading: () => <div className="w-full h-64 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const currentUrl = typeof window !== "undefined" ? window.location.href : "";

const formatarHtml = (htmlString) => {
  if (!htmlString) return "";
  return htmlString.replace(/\r\n|\r|\n/g, "<br />");
};

export default function CondominioPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const [condominio, setCondominio] = useState({});
  const [imoveisRelacionados, setImoveisRelacionados] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const imoveisRelacionadosRef = useRef(null);

  useEffect(() => {
    async function fetchCondominio() {
      try {
        setLoading(true);
        const response = await getCondominioPorSlug(slug);

        // Verificar se a resposta contém um erro ou o condomínio não foi encontrado
        if (response?.statusCode === 404 || !response?.data) {
          // Definir um erro 404 para ser tratado pelo componente Error
          setError({
            statusCode: 404,
            message: response?.message || "Condomínio não encontrado"
          });
          return;
        }

        // Verificar se há algum outro erro
        if (response?.statusCode && response.statusCode !== 200) {
          setError({
            statusCode: response.statusCode,
            message: response.message || "Erro ao carregar dados do condomínio"
          });
          return;
        }

        setCondominio(response?.data || {});
        setImoveisRelacionados(response?.imoveisRelacionados || []);
      } catch (err) {
        // Evitar logs de erros desnecessários para erros 404
        if (err.response?.status === 404) {
          setError({
            statusCode: 404,
            message: "Condomínio não encontrado"
          });
        } else {
          console.error("Error fetching condominio data:", err);
          setError({
            statusCode: err.response?.status || 500,
            message: "Erro ao carregar dados do condomínio"
          });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCondominio();
  }, [slug]);

  // Atualiza o título da página quando o condomínio for carregado
  useEffect(() => {
    if (condominio?.Empreendimento) {
      document.title = `Condomínio ${condominio.Empreendimento} `;

      // Criação da descrição para SEO
      const descriptionContent = `Condominio ${condominio.Empreendimento} em ${condominio.BairroComercial || ''}, ${condominio.Cidade || ''}. ${condominio.Empreendimento || ''}: ${condominio.DormitoriosAntigo || ''} quartos, ${condominio.Suites || ''} suítes, ${condominio.BanheiroSocialQtd || ''} banheiros, ${condominio.VagasAntigo || ''} vagas, ${condominio.MetragemAnt || ''}. ${condominio.Situacao || ''} .`;

      // Verifica se a meta tag description já existe
      let metaDescription = document.querySelector('meta[name="description"]');

      if (!metaDescription) {
        // Se não existir, cria uma nova meta tag
        metaDescription = document.createElement('meta');
        metaDescription.name = "description";
        document.head.appendChild(metaDescription);
      }

      // Atualiza o conteúdo da meta tag
      metaDescription.setAttribute('content', descriptionContent);

      // Adicionar meta tags Open Graph para compartilhamento em redes sociais
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', `Condomínio ${condominio.Empreendimento}`);

      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', descriptionContent);

      // Adicionar og:type
      let ogType = document.querySelector('meta[property="og:type"]');
      if (!ogType) {
        ogType = document.createElement('meta');
        ogType.setAttribute('property', 'og:type');
        document.head.appendChild(ogType);
      }
      ogType.setAttribute('content', 'website');

      // Adicionar og:url
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', typeof window !== "undefined" ? window.location.href : "");

      // Adicionar imagem do condomínio para compartilhamento, se disponível
      if (condominio.Foto && condominio.Foto.length > 0) {
        let ogImage = document.querySelector('meta[property="og:image"]');
        if (!ogImage) {
          ogImage = document.createElement('meta');
          ogImage.setAttribute('property', 'og:image');
          document.head.appendChild(ogImage);
        }
        ogImage.setAttribute('content', condominio.Foto[0].Foto);
      }

      // Adicionar tag canonical
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', typeof window !== "undefined" ? window.location.href : "");

      // Adicionar link para o sitemap
      let sitemapLink = document.querySelector('link[rel="sitemap"]');
      if (!sitemapLink) {
        sitemapLink = document.createElement('link');
        sitemapLink.setAttribute('rel', 'sitemap');
        sitemapLink.setAttribute('type', 'application/xml');
        document.head.appendChild(sitemapLink);
      }
      sitemapLink.setAttribute('href', typeof window !== "undefined" ? `${window.location.origin}/sitemap.xml` : "/sitemap.xml");

      // Adicionar Twitter Card meta tags
      let twitterCard = document.querySelector('meta[name="twitter:card"]');
      if (!twitterCard) {
        twitterCard = document.createElement('meta');
        twitterCard.setAttribute('name', 'twitter:card');
        document.head.appendChild(twitterCard);
      }
      twitterCard.setAttribute('content', 'summary_large_image');

      let twitterSite = document.querySelector('meta[name="twitter:site"]');
      if (!twitterSite) {
        twitterSite = document.createElement('meta');
        twitterSite.setAttribute('name', 'twitter:site');
        document.head.appendChild(twitterSite);
      }
      twitterSite.setAttribute('content', '@NPIImoveis');

      let twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (!twitterTitle) {
        twitterTitle = document.createElement('meta');
        twitterTitle.setAttribute('name', 'twitter:title');
        document.head.appendChild(twitterTitle);
      }
      twitterTitle.setAttribute('content', `Condomínio ${condominio.Empreendimento}`);

      let twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (!twitterDescription) {
        twitterDescription = document.createElement('meta');
        twitterDescription.setAttribute('name', 'twitter:description');
        document.head.appendChild(twitterDescription);
      }
      twitterDescription.setAttribute('content', descriptionContent);

      if (condominio.Foto && condominio.Foto.length > 0) {
        let twitterImage = document.querySelector('meta[name="twitter:image"]');
        if (!twitterImage) {
          twitterImage = document.createElement('meta');
          twitterImage.setAttribute('name', 'twitter:image');
          document.head.appendChild(twitterImage);
        }
        twitterImage.setAttribute('content', condominio.Foto[0].Foto);
      }
    } else {
      document.title = "Carregando... | NPI Imóveis";
    }
  }, [condominio]);

  const scrollToImoveisRelacionados = () => {
    if (imoveisRelacionadosRef.current) {
      imoveisRelacionadosRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Se estiver carregando, mostrar indicador de carregamento
  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-white">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 md:h-32 md:w-32 border-t-4 border-b-4 border-black" role="status">
            <span className="sr-only">Carregando informações do condomínio...</span>
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
        <p className="mt-4 text-gray-600">Carregando informações do condomínio...</p>
      </div>
    );
  }

  // Se houver erro, renderizar o componente Error
  if (error) {
    return <Error error={error} reset={() => router.refresh()} />;
  }

  // Verificar se os dados do condomínio são válidos
  if (!condominio || !condominio.Empreendimento) {
    return <Error error={{ statusCode: 404, message: "Condomínio não encontrado" }} reset={() => router.refresh()} />;
  }

  return (
    <section className="w-full bg-zinc-100 pb-10">

      <StructuredData.Apartment
        title={condominio.Empreendimento}
        price={condominio.ValorAntigo ? `R$ ${condominio.ValorAntigo}` : 'Consulte'}
        description={`${condominio.Categoria} à venda em ${condominio.BairroComercial}, ${condominio.Cidade}. ${condominio.Empreendimento}: ${condominio.DormitoriosAntigo} quartos, ${condominio.Suites} suítes, ${condominio.BanheiroSocialQtd} banheiros, ${condominio.VagasAntigo} vagas, ${condominio.MetragemAnt}. ${condominio.Situacao}. Valor: ${condominio.ValorAntigo ? `R$ ${condominio.ValorAntigo}` : 'Consulte'}. ${condominio.TipoEndereco} ${condominio.Endereco}.`}
        address={`${condominio.TipoEndereco} ${condominio.Endereco}, ${condominio.Numero}, ${condominio.BairroComercial}, ${condominio.Cidade}`}
        url={currentUrl}
        image={condominio.Foto}
      />

      <div className="container mx-auto pt-20">
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <div className="flex flex-col gap-4 ">
            <div className="px-10 py-6 bg-white max-h-[400px] xl:max-h-[300px] rounded-lg flex-grow">
              <div className="flex justify-between">
                <span className="text-[10px]">Código:{condominio.Codigo}</span>
                <Share url={currentUrl} title={`Compartilhe o imóvel ${condominio.Empreendimento} em ${condominio.BairroComercial}`} variant="secondary" />
              </div>

              <h1 className="text-xl font-semibold mt-2">Condomínio {condominio.Empreendimento} </h1>
              <span className="text-xs text-zinc-700 font-semibold">
                {condominio.TipoEndereco} {condominio.Endereco}, {condominio.Numero}, {condominio.BairroComercial}, {condominio.Cidade}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-4 mb-8">
                {condominio.ValorAluguelSite && (
                  <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                    <h4 className="text-zinc-600 text-[10px] font-bold">Aluguel:</h4>
                    <h2 className="text-black font-semibold text-[10px]">R${" "}{condominio.ValorAluguelSite}</h2>
                  </div>
                )}

                <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                  <h4 className="text-zinc-600 text-[10px] font-bold">Venda:</h4>
                  <h2 className="text-black font-semibold text-[10px]">R${" "}{condominio.ValorAntigo}</h2>
                </div>
                {condominio.ValorCondominio && (
                  <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                    <h4 className="text-zinc-600 text-[10px] font-bold">Condomínio:</h4>
                    <h2 className="text-black font-semibold text-[10px]">
                      {/* formatterValue foi importado anteriormente mas não é usado aqui */}
                      {formatterValue(condominio.ValorCondominio)}
                    </h2>
                  </div>
                )}
                {condominio.ValorIptu && (
                  <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                    <h4 className="text-zinc-600 text-[10px] font-bold">IPTU:</h4>
                    <h2 className="text-black font-semibold text-[10px]">
                      {/* formatterValue foi importado anteriormente mas não é usado aqui */}
                      {formatterValue(condominio.ValorIptu)}
                    </h2>
                  </div>
                )}
              </div>
              <Button onClick={scrollToImoveisRelacionados} text={`Mostrar imóveis (${imoveisRelacionados.length})`} />
            </div>
            <div className="relative w-full h-[230px] overflow-y-auto bg-white rounded-lg overflow-hidden p-4">

              {condominio.ValorVenda2 != "0" || condominio.ValorGarden != "0" || condominio.ValorCobertura != "0" ? (
                <PropertyTableOwner imovel={condominio} />
              ) : (
                <PropertyTable imoveisRelacionados={imoveisRelacionados} />
              )}

            </div>
          </div>
          <div className="relative w-full min-h-[550px] overflow-hidden rounded-lg">
            <CondominioGallery fotos={condominio.Foto} title={condominio.Empreendimento} />
          </div>
        </div>
      </div>
      {imoveisRelacionados && imoveisRelacionados.length > 0 && (
        <div ref={imoveisRelacionadosRef}>
          <ImoveisRelacionados imoveisRelacionados={imoveisRelacionados} />
        </div>
      )}
      <SobreCondominio condominio={condominio} />

      {condominio.FichaTecnica && <FichaTecnica condominio={condominio} />}
      {condominio.DescricaoDiferenciais && <DiferenciaisCondominio condominio={condominio} />}
      {condominio.DestaquesLazer && <Lazer condominio={condominio} />}
      {condominio.Video.length != 0 && <VideoCondominio condominio={condominio} />}
      {condominio.Tour360 && <TourVirtual condominio={condominio} />}

      <ExploreRegiao condominio={condominio} currentUrl={currentUrl} />
    </section>
  );
}
