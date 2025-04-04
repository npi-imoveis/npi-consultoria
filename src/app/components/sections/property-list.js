"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import CardHome from "../ui/card-home";
import { useEffect, useRef, useCallback, memo, useState, useMemo } from "react";
import { TitleSection } from "../ui/title-section";
import useDestaquesStore from "@/app/store/destaquesStore";
import { useInView } from "react-intersection-observer";
import useImovelStore from "@/app/store/imovelStore";
import dynamic from 'next/dynamic';

// Carregamento dinâmico do componente de card com lazy loading
const LazyCardHome = dynamic(() => import('../ui/card-home'), {
  loading: () => (
    <div className="animate-pulse w-[350px] h-[400px]">
      <div className="h-[220px] bg-gray-200 rounded-t-lg"></div>
      <div className="p-6 bg-white h-[180px]">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="flex gap-4 mb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-5 bg-gray-200 rounded w-12"></div>
          ))}
        </div>
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-auto"></div>
      </div>
    </div>
  ),
  ssr: false
});

// Componente memoizado para o card de imóvel
const MemoizedCardHome = memo(CardHome);

// Componente memoizado para o botão de scroll
const ScrollButton = memo(({ direction, onClick, children }) => (
  <button
    onClick={onClick}
    className={`absolute ${direction === "left" ? "left-2" : "right-2"} top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full shadow-md z-10`}
    aria-label={`Scroll ${direction}`}
  >
    {children}
  </button>
));

ScrollButton.displayName = "ScrollButton";

// Componente virtualizado para cada cartão de imóvel
const VirtualizedCard = memo(({ imovel, isVisible }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className="h-[400px] w-[350px]">
      {(inView || isVisible) ? (
        <MemoizedCardHome {...imovel} isLoading={false} />
      ) : (
        <div className="w-[350px] h-[400px] bg-gray-100 rounded-lg"></div>
      )}
    </div>
  );
});

VirtualizedCard.displayName = "VirtualizedCard";

export function PropertyList() {
  const carouselRef = useRef(null);
  const { adicionarVariosImoveisCache } = useImovelStore();

  // Controle local de visibilidade para otimização de renderização
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 3 });

  // Utilize selector para evitar re-renderizações desnecessárias
  const imoveisDestaque = useDestaquesStore(state => state.imoveisDestaque);
  const isLoading = useDestaquesStore(state => state.isLoading);
  const error = useDestaquesStore(state => state.error);
  const fetchImoveisDestaque = useDestaquesStore(state => state.fetchImoveisDestaque);

  // Cache em memória usando useMemo
  const cachedImoveisDestaque = useMemo(() => imoveisDestaque, [imoveisDestaque]);

  // Função de scroll memoizada com atualização de visibilidade
  const scroll = useCallback((direction) => {
    if (carouselRef.current) {
      const scrollAmount = 350;
      const currentScroll = carouselRef.current.scrollLeft;
      const newScroll = direction === "left"
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;

      carouselRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });

      // Atualiza quais cartões estão visíveis
      const itemWidth = 350;
      const startItem = Math.floor(newScroll / itemWidth);
      const visibleItems = Math.ceil(carouselRef.current.clientWidth / itemWidth);

      setVisibleRange({
        start: startItem,
        end: startItem + visibleItems + 1 // +1 para pré-carregar o próximo
      });
    }
  }, []);

  // Carrega os dados apenas uma vez quando o componente monta
  useEffect(() => {
    // Verifica se já temos dados em cache antes de fazer nova requisição
    if (imoveisDestaque.length === 0) {
      fetchImoveisDestaque().then(imoveis => {
        // Armazena os dados obtidos no cache geral de imóveis
        if (imoveis && imoveis.length) {
          adicionarVariosImoveisCache(imoveis);
        }
      });
    }

    // Configura a visibilidade inicial
    if (carouselRef.current) {
      const itemWidth = 350;
      const visibleItems = Math.ceil(carouselRef.current.clientWidth / itemWidth);
      setVisibleRange({ start: 0, end: visibleItems + 1 });
    }
  }, [fetchImoveisDestaque, imoveisDestaque.length, adicionarVariosImoveisCache]);

  // Atualiza cartões visíveis quando o usuário scrollar manualmente
  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        const itemWidth = 350;
        const currentScroll = carouselRef.current.scrollLeft;
        const startItem = Math.floor(currentScroll / itemWidth);
        const visibleItems = Math.ceil(carouselRef.current.clientWidth / itemWidth);

        setVisibleRange({
          start: startItem,
          end: startItem + visibleItems + 1
        });
      }
    };

    const carouselElement = carouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('scroll', handleScroll);
      return () => carouselElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (error) {
    return (
      <div className="w-full bg-zinc-100 py-16">
        <div className="container mx-auto">
          <TitleSection
            destaque
            center
            section="Destaque"
            title="Imóveis de Alto Padrão"
            description="Conheca os imóveis em destaque."
          />
          <p className="text-red-500 text-center py-10">Erro: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full bg-zinc-100 py-16 relative">
      <div className="container mx-auto">
        <TitleSection
          destaque
          center
          section="Destaque"
          title="Imóveis de Alto Padrão"
          description="Conheca os imóveis em destaque."
        />

        <ScrollButton direction="left" onClick={() => scroll("left")}>
          <ChevronLeftIcon className="w-6 h-6" />
        </ScrollButton>

        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide no-scrollbar pb-4"
          role="region"
          aria-label="Lista de imóveis em destaque"
        >
          {isLoading ? (
            // Skeleton loading state com placeholders mais leves
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="animate-pulse">
                <div className="w-[350px] h-[400px] bg-gray-200 rounded-lg"></div>
              </div>
            ))
          ) : cachedImoveisDestaque.length > 0 ? (
            cachedImoveisDestaque.map((imovel, index) => (
              <VirtualizedCard
                key={imovel.Codigo || imovel._id || `imovel-${index}`}
                imovel={imovel}
                isVisible={index >= visibleRange.start && index <= visibleRange.end}
              />
            ))
          ) : (
            <p className="text-center w-full py-8">Nenhum imóvel em destaque encontrado.</p>
          )}
        </div>

        <ScrollButton direction="right" onClick={() => scroll("right")}>
          <ChevronRightIcon className="w-6 h-6" />
        </ScrollButton>
      </div>
    </section>
  );
}
