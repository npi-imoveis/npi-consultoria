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
        </div>// components/sections/featured-condos-section.js
"use client";
import { useEffect, useRef, useState } from "react";
import CustomCard from "../ui/custom-card";
import { TitleSection } from "../ui/title-section";
import { getCondominioDestacado } from "@/app/services";

export function FeaturedCondosSection() {
  const [condominios, setCondominios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const carouselRef = useRef(null);

  // Detectar mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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

  // Auto-play simples
  useEffect(() => {
    if (!isMobile || loading || !condominios.length) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % condominios.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isMobile, loading, condominios.length]);

  const generateImageTitle = (condominio) => {
    const nome = condominio.Empreendimento || "Condomínio";
    const bairro = condominio.BairroComercial || condominio.Bairro || "";
    const cidade = condominio.Cidade || "São Paulo";
    return bairro ? `${nome} - ${bairro}, ${cidade} - Condomínio de Alto Padrão NPi` : `${nome} - ${cidade} - Condomínio de Alto Padrão NPi`;
  };

  const generateImageAlt = (condominio) => {
    const nome = condominio.Empreendimento || "Condomínio";
    const bairro = condominio.BairroComercial || condominio.Bairro || "";
    return bairro ? `${nome} - Condomínio de alto padrão em ${bairro} - NPi Imóveis` : `${nome} - Condomínio de alto padrão - NPi Imóveis`;
  };

  // Touch handlers simplificados
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  
  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev + 1) % condominios.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + condominios.length) % condominios.length);
      }
    }
  };

  // Renderização
  if (loading) {
    return (
      <section className="w-full bg-zinc-100">
        <div className="container mx-auto py-16">
          <TitleSection center section="Destaque" title="Condomínios em Destaque" description="Os melhores condomínios de alto padrão." />
          <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!condominios?.length) {
    return (
      <section className="w-full bg-zinc-100">
        <div className="container mx-auto py-16">
          <TitleSection center section="Destaque" title="Condomínios em Destaque" description="Os melhores condomínios de alto padrão." />
          <p className="text-center py-8">{error || "Nenhum condomínio em destaque encontrado."}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-zinc-100">
      <div className="container mx-auto py-16">
        <TitleSection center section="Destaque" title="Condomínios em Destaque" description="Os melhores condomínios de alto padrão." />
        
        {/* Mobile: Carrossel / Desktop: Grid */}
        <div className="relative">
          <div
            ref={carouselRef}
            className={`${isMobile ? 'overflow-hidden' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'}`}
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
          >
            <div className={isMobile ? 'flex transition-transform duration-500' : 'contents'}
                 style={isMobile ? { transform: `translateX(-${currentIndex * 100}%)` } : {}}>
              {condominios.map((cond, idx) => {
                const foto = cond.Foto?.[0]?.Foto;
                return (
                  <div key={cond.Codigo || cond._id || idx} className={isMobile ? 'w-full flex-shrink-0 px-2' : ''}>
                    <CustomCard
                      id={cond.Codigo || cond._id}
                      image={foto || null}
                      title={cond.Empreendimento || "Condomínio"}
                      description={cond.Endereco || "Endereço não disponível"}
                      sign="Condomínio"
                      slug={cond.Slug}
                      imageTitle={generateImageTitle(cond)}
                      imageAlt={generateImageAlt(cond)}
                      loading={idx < 4 ? "eager" : "lazy"}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots - apenas mobile */}
          {isMobile && condominios.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {condominios.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`transition-all h-2 rounded-full ${
                    i === currentIndex ? 'w-8 bg-amber-600' : 'w-2 bg-gray-300'
                  }`}
                  aria-label={`Condomínio ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
      </div>
    </section>
  );
}
