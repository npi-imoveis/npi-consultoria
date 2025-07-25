// *components/sections/featured-condos-section.js*
"use client";
import { useEffect, useRef, useState } from "react";
import CustomCard from "../ui/custom-card";
import { TitleSection } from "../ui/title-section";
import { getCondominioDestacado, getCondominios } from "@/app/services";

export function FeaturedCondosSection() {
  const [condominios, setCondominios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    async function fetchCondominios() {
      try {
        const response = await getCondominioDestacado();
        if (response && response.data && Array.isArray(response.data.data)) {
          setCondominios(response.data.data);
        } else if (response && response.data && Array.isArray(response.data)) {
          setCondominios(response.data);
        } else if (response && Array.isArray(response)) {
          setCondominios(response);
        } else {
          setCondominios([]);
          setError("Formato de dados inválido recebido do servidor");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Erro ao buscar condominios.");
      } finally {
        setLoading(false);
      }
    }
    fetchCondominios();
  }, []);

  // ✅ FUNÇÃO para gerar title otimizado da imagem
  const generateImageTitle = (condominio) => {
    const nome = condominio.Empreendimento || "Condomínio";
    const bairro = condominio.BairroComercial || condominio.Bairro || "";
    const cidade = condominio.Cidade || "São Paulo";
    
    if (bairro) {
      return `${nome} - ${bairro}, ${cidade} - Condomínio de Alto Padrão NPi`;
    }
    return `${nome} - ${cidade} - Condomínio de Alto Padrão NPi`;
  };

  // ✅ FUNÇÃO para gerar alt otimizado da imagem  
  const generateImageAlt = (condominio) => {
    const nome = condominio.Empreendimento || "Condomínio";
    const bairro = condominio.BairroComercial || condominio.Bairro || "";
    
    if (bairro) {
      return `${nome} - Condomínio de alto padrão em ${bairro} - NPi Imóveis`;
    }
    return `${nome} - Condomínio de alto padrão - NPi Imóveis`;
  };

  return (
    <section className="w-full bg-zinc-100">
      <div className="container mx-auto py-16">
        <TitleSection
          center
          section="Destaque"
          title="Condomínios em Destaque"
          description="Os melhores condomínios de alto padrão."
        />
        <div
          ref={carouselRef}
          className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {loading ? (
            // Renderiza skeletons durante o carregamento
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : condominios && condominios.length > 0 ? (
            // Renderiza os condomínios quando disponíveis
            condominios.map((condominio, index) => {
              // Verificar se o condomínio tem fotos
              const temFoto =
                condominio.Foto &&
                Array.isArray(condominio.Foto) &&
                condominio.Foto.length > 0 &&
                condominio.Foto[0] &&
                condominio.Foto[0].Foto;

              return (
                <CustomCard
                  key={condominio.Codigo || condominio._id || `condominio-${Math.random()}`}
                  id={condominio.Codigo || condominio._id}
                  image={temFoto ? condominio.Foto[0].Foto : null}
                  title={condominio.Empreendimento || "Condomínio"}
                  description={condominio.Endereco || "Endereço não disponível"}
                  sign="Condomínio"
                  slug={condominio.Slug}
                  // ✅ NOVAS PROPS para otimização das imagens
                  imageTitle={generateImageTitle(condominio)}
                  imageAlt={generateImageAlt(condominio)}
                  loading={index < 4 ? "eager" : "lazy"} // Primeiras 4 imagens carregam imediatamente
                />
              );
            })
          ) : (
            // Mensagem quando não há condomínios
            <p className="text-center w-full py-8 col-span-full">
              {error ? `Erro: ${error}` : "Nenhum condomínio em destaque encontrado."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
