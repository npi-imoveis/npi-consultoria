// src/app/busca/components/integrated-map-component.js
"use client";

import { useCallback, useEffect, useState } from "react";
import GoogleMapComponent from "./google-map-component";

export default function IntegratedMapComponent({
  filtros,
  onPropertySelect,
  onClusterSelect,
  selectedCluster,
  selectedProperty,
  onClearSelection,
}) {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("🗺️ IntegratedMapComponent recebeu filtros:", {
    filtrosAplicados: filtros?.filtrosAplicados,
    atualizacoesFiltros: filtros?.atualizacoesFiltros,
    filtros: filtros
  });

  const {
    filtrosAplicados,
    atualizacoesFiltros,
    finalidade,
    categoriaSelecionada,
    cidadeSelecionada,
    quartos,
    banheiros,
    vagas,
    bairrosSelecionados,
    precoMin,
    precoMax,
    areaMin,
    areaMax,
    abaixoMercado,
    proximoMetro,
  } = filtros || {};

  useEffect(() => {
    const buscarImoveisParaMapa = async () => {
      try {
        setLoading(true);
        
        // Aplicar os mesmos filtros que são usados na busca principal
        let params = {};
        
        if (filtrosAplicados) {
          const isRent = (finalidade || "Comprar") === "Alugar";

          // Aplicar filtros básicos
          if (categoriaSelecionada) {
            params.categoria = categoriaSelecionada;
          }
          if (cidadeSelecionada) {
            params.cidade = cidadeSelecionada;
          }
          if (quartos) {
            params.quartos = quartos;
          }
          if (banheiros) {
            params.banheiros = banheiros;
          }
          if (vagas) {
            params.vagas = vagas;
          }
          
          // Aplicar bairros
          if (Array.isArray(bairrosSelecionados) && bairrosSelecionados.length > 0) {
            params.bairrosArray = bairrosSelecionados;
          }

          // Aplicar finalidade
          if (isRent) {
            params.finalidade = "locacao";
            params.status = "locacao";
            params.tipoNegocio = "locacao";
            params.negocio = "locacao";
            params.modalidade = "locacao";
          } else {
            params.finalidade = "venda";
            params.status = "venda";
            params.tipoNegocio = "venda";
          }

          // Aplicar preços
          const buildPriceParams = (isRent, min, max) => {
            const out = {};
            const hasMin = min !== null && min !== undefined && min !== "" && Number(min) > 0;
            const hasMax = max !== null && max !== undefined && max !== "" && Number(max) > 0;

            if (!hasMin && !hasMax) return out;

            if (isRent) {
              if (hasMin) {
                out.precoAluguelMin = String(min);
                out.valorAluguelMin = String(min);
                out.aluguelMin = String(min);
                out.precoMinimo = String(min);
              }
              if (hasMax) {
                out.precoAluguelMax = String(max);
                out.valorAluguelMax = String(max);
                out.aluguelMax = String(max);
                out.precoMaximo = String(max);
              }
            } else {
              if (hasMin) {
                out.precoMinimo = String(min);
                out.precoMin = String(min);
                out.valorMin = String(min);
              }
              if (hasMax) {
                out.precoMaximo = String(max);
                out.precoMax = String(max);
                out.valorMax = String(max);
              }
            }
            return out;
          };

          Object.assign(params, buildPriceParams(isRent, precoMin, precoMax));

          // Aplicar área
          if (areaMin && areaMin !== "0") params.areaMinima = areaMin;
          if (areaMax && areaMax !== "0") params.areaMaxima = areaMax;

          // Aplicar filtros especiais
          if (abaixoMercado) params.apenasCondominios = true;
          if (proximoMetro) params.proximoMetro = true;
        }
        
        console.log("🗺️ Parâmetros do mapa:", params);
        
        // Fazer a requisição usando o mesmo endpoint da busca principal
        const urlParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => urlParams.append(key, v));
          } else {
            urlParams.append(key, value);
          }
        });
        
        const cacheBuster = `&t=${new Date().getTime()}`;
        const url = `/api/imoveis?${urlParams.toString()}${cacheBuster}&limit=1000`; // Aumentar limite para o mapa
        
        console.log("🗺️ Buscando imóveis para o mapa:", url);
        const response = await fetch(url);
        const data = await response.json();
        
        const imoveisData = data.imoveis || data.data || [];
        console.log(`✅ ${imoveisData.length} imóveis recebidos para o mapa`);
        
        // Filtrar apenas imóveis com coordenadas válidas
        const imoveisValidos = imoveisData.filter(imovel => {
          const lat = parseFloat(imovel.Latitude);
          const lng = parseFloat(imovel.Longitude);
          return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
        });
        
        console.log(`📍 ${imoveisValidos.length} imóveis com coordenadas válidas`);
        setImoveis(imoveisValidos);
      } catch (err) {
        console.error("❌ Erro ao buscar imóveis para o mapa:", err);
        setImoveis([]);
      } finally {
        setLoading(false);
      }
    };
    
    buscarImoveisParaMapa();
  }, [
    filtrosAplicados,
    atualizacoesFiltros,
    finalidade,
    categoriaSelecionada,
    cidadeSelecionada,
    quartos,
    banheiros,
    vagas,
    bairrosSelecionados,
    precoMin,
    precoMax,
    areaMin,
    areaMax,
    abaixoMercado,
    proximoMetro,
  ]);

  const handlePropertyClick = useCallback(
    (imovel) => {
      console.log("🏠 Propriedade clicada:", imovel);
      onPropertySelect?.(imovel);
    },
    [onPropertySelect]
  );

  const handleClusterClick = useCallback(
    (properties) => {
      console.log("🔍 Cluster clicado com", properties.length, "propriedades:", properties);
      onClusterSelect?.(properties);
    },
    [onClusterSelect]
  );

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
          <p className="mt-2 text-gray-700">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMapComponent
      imoveis={imoveis}
      onPropertyClick={handlePropertyClick}
      onClusterClick={handleClusterClick}
      selectedCluster={selectedCluster}
      selectedProperty={selectedProperty}
      onClearSelection={onClearSelection}
      center={imoveis.length > 0 ? undefined : { lat: -23.5505, lng: -46.6333 }}
      zoom={imoveis.length > 0 ? undefined : 11}
    />
  );
}