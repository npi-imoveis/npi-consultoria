// components/sections/featured-condos-section.js
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
  const [isMobile, setIsMobile] = useState(false); // AGORA COM ESTADO
  const carouselRef = useRef(null);

  // ✅ DETECTAR MOBILE CORRETAMENTE
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Checar imediatamente
    checkMobile();
    
    // Checar ao redimensionar
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Auto-play para mobile
  useEffect(() => {
    if (!isMobile || loading || !condominios.length) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % condominios.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isMobile, loading, condominios.length, currentIndex]);

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

  // Touch handlers para swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };
  
  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50 && condominios.length > 0) {
      if (diff > 0) {
        // Swipe left - próximo
        setCurrentIndex((prev) => (prev + 1) % condominios.length);
      } else {
        // Swipe right - anterior
        setCurrentIndex((prev) => (prev - 1 + condominios.length) % condominios.length);
      }
    }
  };

  // Navegação por botões
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % condominios.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + condominios.length) % condominios.length);

  // Loading state
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

  // Empty state
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
        
        {/* MOBILE: Carrossel */}
        {isMobile ? (
          <div className="relative">
            {/* Container do carrossel - SEM MARGENS, FULLWIDTH */}
            <div 
              ref={carouselRef}
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {condominios.map((cond, idx) => {
                  const foto = cond.Foto?.[0]?.Foto;
                  return (
                    <div key={cond.Codigo || cond._id || idx} className="w-full flex-shrink-0">
                      <CustomCard
                        id={cond.Codigo || cond._id}
                        image={foto || null}
                        title={cond.Empreendimento || "Condomínio"}
                        description={cond.Endereco || "Endereço não disponível"}
                        sign="Condomínio"
                        slug={cond.Slug}
                        imageTitle={generateImageTitle(cond)}
                        imageAlt={generateImageAlt(cond)}
                        loading={idx < 2 ? "eager" : "lazy"}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botões de navegação lateral - PRETOS com seta BRANCA */}
            {condominios.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-4 top-[40%] -translate-y-1/2 w-10 h-10 bg-black/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-black transition-all z-10"
                  aria-label="Anterior"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-4 top-[40%] -translate-y-1/2 w-10 h-10 bg-black/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center hover:bg-black transition-all z-10"
                  aria-label="Próximo"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Indicadores (dots) */}
            <div className="flex justify-center gap-2 mt-6">
              {condominios.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`transition-all duration-300 h-2 rounded-full ${
                    i === currentIndex ? 'w-8 bg-amber-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Ir para condomínio ${i + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* DESKTOP: Grid original */
          <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {condominios.map((cond, idx) => {
              const foto = cond.Foto?.[0]?.Foto;
              return (
                <CustomCard
                  key={cond.Codigo || cond._id || idx}
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
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
