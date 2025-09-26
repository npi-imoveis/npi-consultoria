// src/app/busca/components/integrated-map-component.js
"use client";

import { useCallback, useEffect, useState } from "react";
import GoogleMapComponent from "./google-map-component";

export default function IntegratedMapComponent({
  filtros,
  imoveis: imoveisExternos,
  isLoadingResultados = false,
  onPropertySelect,
  onClusterSelect,
  selectedCluster,
  selectedProperty,
  onClearSelection,
}) {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(isLoadingResultados));

  const temDadosExternos = Array.isArray(imoveisExternos);

  const filtrarImoveisComCoordenadas = useCallback((lista = []) => {
    if (!Array.isArray(lista)) return [];

    return lista.filter((imovel) => {
      const lat = parseFloat(
        imovel?.Latitude ?? imovel?.latitude ?? imovel?.Lat ?? imovel?.lat
      );
      const lng = parseFloat(
        imovel?.Longitude ?? imovel?.longitude ?? imovel?.Lng ?? imovel?.lng
      );

      return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
    });
  }, []);

  useEffect(() => {
    if (!temDadosExternos) return;

    if (isLoadingResultados) {
      setLoading(true);
      return;
    }

    const imoveisFiltrados = filtrarImoveisComCoordenadas(imoveisExternos);
    setImoveis(imoveisFiltrados);
    setLoading(false);
  }, [filtrarImoveisComCoordenadas, imoveisExternos, isLoadingResultados, temDadosExternos]);

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
    if (temDadosExternos) return;

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
        const filtrosParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => filtrosParams.append(key, v));
          } else if (value !== undefined && value !== null && value !== "") {
            filtrosParams.append(key, value);
          }
        });

        const possuiFiltros = filtrosParams.toString() !== "";
        const requestParams = new URLSearchParams(filtrosParams);
        requestParams.set("limit", "1000");
        requestParams.set("page", "1");
        requestParams.set("t", String(Date.now()));

        const endpointBase = possuiFiltros
          ? "/api/imoveis/params/filtro"
          : "/api/imoveis";
        const url = `${endpointBase}?${requestParams.toString()}`;

        console.log("🗺️ Buscando imóveis para o mapa:", url);
        const response = await fetch(url, { cache: "no-store" });
        const data = await response.json();
        
        const imoveisData = data.imoveis || data.data || [];
        console.log(`✅ ${imoveisData.length} imóveis recebidos para o mapa`);
        
        const imoveisValidos = filtrarImoveisComCoordenadas(imoveisData);
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
    temDadosExternos,
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
    filtrarImoveisComCoordenadas,
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