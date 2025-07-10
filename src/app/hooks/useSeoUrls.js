// src/app/hooks/useSeoUrls.js

"use client";

import { useRouter } from "next/navigation";
import { gerarUrlSeoFriendly } from "@/app/utils/url-slugs";
import useFiltersStore from "@/app/store/filtrosStore";

export const useSeoUrls = () => {
  const router = useRouter();
  const filtrosAtuais = useFiltersStore((state) => state);

  // Função para navegar usando URL SEO-friendly
  const navegarComFiltros = (filtros) => {
    // Verificar se os filtros básicos estão preenchidos
    const { cidadeSelecionada, finalidade, categoriaSelecionada } = filtros;
    
    if (cidadeSelecionada && finalidade && categoriaSelecionada) {
      // Gerar URL SEO-friendly
      const urlSeoFriendly = gerarUrlSeoFriendly(filtros);
      console.log('Navegando para URL SEO-friendly:', urlSeoFriendly);
      router.push(urlSeoFriendly);
      return true;
    } else {
      // Fallback para página de busca normal com query params
      const params = new URLSearchParams();
      
      if (filtros.cidadeSelecionada) params.set('cidade', filtros.cidadeSelecionada);
      if (filtros.finalidade) params.set('finalidade', filtros.finalidade);
      if (filtros.categoriaSelecionada) params.set('categoria', filtros.categoriaSelecionada);
      if (filtros.quartos) params.set('quartos', filtros.quartos);
      if (filtros.precoMin) params.set('precoMin', filtros.precoMin);
      if (filtros.precoMax) params.set('precoMax', filtros.precoMax);
      if (filtros.bairrosSelecionados && filtros.bairrosSelecionados.length > 0) {
        params.set('bairros', filtros.bairrosSelecionados.join(','));
      }
      
      const urlFallback = `/busca?${params.toString()}`;
      console.log('Navegando para URL fallback:', urlFallback);
      router.push(urlFallback);
      return false;
    }
  };

  // Função para verificar se os filtros são elegíveis para URL SEO-friendly
  const podeUsarUrlSeoFriendly = (filtros = filtrosAtuais) => {
    return !!(filtros.cidadeSelecionada && filtros.finalidade && filtros.categoriaSelecionada);
  };

  // Função para gerar link SEO-friendly sem navegar
  const gerarLinkSeoFriendly = (filtros) => {
    if (podeUsarUrlSeoFriendly(filtros)) {
      return gerarUrlSeoFriendly(filtros);
    }
    return null;
  };

  // Função para gerar links de navegação rápida (breadcrumbs, sugestões)
  const gerarLinksNavegacaoRapida = () => {
    const links = [];
    
    // Links de cidades populares
    const cidadesPopulares = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte'];
    const categoriasPopulares = ['Apartamento', 'Casa', 'Cobertura'];
    
    cidadesPopulares.forEach(cidade => {
      categoriasPopulares.forEach(categoria => {
        ['Comprar', 'Alugar'].forEach(finalidade => {
          const filtros = {
            cidadeSelecionada: cidade,
            finalidade: finalidade,
            categoriaSelecionada: categoria,
            bairrosSelecionados: [],
            quartos: null,
            precoMin: null,
            precoMax: null
          };
          
          const url = gerarUrlSeoFriendly(filtros);
          const texto = `${categoria} para ${finalidade.toLowerCase()} em ${cidade}`;
          
          links.push({
            url,
            texto,
            filtros
          });
        });
      });
    });
    
    return links;
  };

  return {
    navegarComFiltros,
    podeUsarUrlSeoFriendly,
    gerarLinkSeoFriendly,
    gerarLinksNavegacaoRapida
  };
};