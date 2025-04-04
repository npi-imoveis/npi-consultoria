"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, Marker, Popup } from "react-leaflet";

import "leaflet-geosearch/dist/geosearch.css";

import { getImoveisParaMapa } from "@/app/services";
import { Button } from "@/app/components/ui/button";
import { formatterSlug } from "@/app/utils/formatter-slug";
import Image from "next/image";

// Componente auxiliar para acessar a instância do mapa
const MapController = () => {
  const map = useMap();

  useEffect(() => {
    // Aguardar um momento para garantir que o mapa foi renderizado
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    // Função para lidar com o redimensionamento
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  return null;
};

// Componente para atualizar o centro e zoom do mapa
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);

  return null;
};

// Componente de popup personalizado para imóveis
const ImovelPopup = ({ imovel }) => {
  const slug = formatterSlug(imovel.Empreendimento || "");
  const fotoUrl = imovel?.Foto?.[0]?.Foto || "/placeholder-imovel.jpg"; // Adiciona fallback para imagem
  return (
    <Popup>
      <div className="p-2">
        <Image
          src={fotoUrl}
          alt={imovel.Empreendimento || "Imóvel"}
          width={300}
          height={150}
          className="rounded-lg w-[300px] h-[150px] object-cover"
        />
        <h1 className="font-bold text-sm mt-4">{imovel.Empreendimento}</h1>
        <p className="text-xs">
          {imovel.Endereco}, {imovel.BairroComercial}, {imovel.Cidade}, {imovel.Numero}
        </p>

        <p className="text-sm font-bold mt-1">
          {imovel.ValorVenda
            ? Number(imovel.ValorVenda).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
            : "Consulte"}
        </p>
        <div className="mt-2">
          <Button
            link={`imovel-${imovel.Codigo}/${slug}`}
            text="Saiba mais"
            className="text-white"
          />
        </div>
      </div>
    </Popup>
  );
};

const MapComponent = ({ filtros }) => {
  const [mapReady, setMapReady] = useState(false);
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(null);

  // Função para determinar o nível de zoom baseado nos filtros
  const getZoomLevel = () => {
    // Se tiver bairro selecionado, zoom mais próximo
    if (filtros.bairrosSelecionados && filtros.bairrosSelecionados.length > 0) {
      return 15; // Aumentamos o zoom para focar melhor no imóvel
    }
    // Se tiver cidade selecionada, zoom intermediário
    if (filtros.cidadeSelecionada) {
      return 10;
    }
    // Se não tiver nem bairro nem cidade, zoom mais distante
    return 11;
  };

  // Função para buscar imóveis
  const buscarImoveisParaMapa = async () => {
    try {
      setLoading(true);
      const response = await getImoveisParaMapa({
        categoria: filtros.categoriaSelecionada,
        cidade: filtros.cidadeSelecionada,
        bairros: filtros.bairrosSelecionados,
        quartos: filtros.quartos,
        banheiros: filtros.banheiros,
        vagas: filtros.vagas,
      });

      console.log("Imóveis para o mapa:", response);
      setImoveis(response.data || []);
    } catch (err) {
      console.error("Erro ao buscar imóveis para o mapa:", err);
      setError("Não foi possível carregar os imóveis para o mapa");
    } finally {
      setLoading(false);
    }
  };

  // Buscar imóveis quando o componente for montado
  useEffect(() => {
    buscarImoveisParaMapa();
  }, [filtros]);

  // Fix para o ícone do Leaflet no Next.js
  useEffect(() => {
    // Indica que o componente foi montado
    setMapReady(true);

    try {
      import("leaflet").then((L) => {
        if (L && L.Icon) {
          delete L.Icon.Default.prototype._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "/leaflet/marker-icon-2x.png",
            iconUrl: "/leaflet/marker-icon.png",
            shadowUrl: "/leaflet/marker-shadow.png",
          });
        }
      });
    } catch (error) {
      console.error("Erro ao carregar o Leaflet:", error);
    }
  }, []);

  // Calcular o centro do mapa e atualizar quando os imóveis mudarem
  useEffect(() => {
    if (imoveis.length === 0) {
      setMapCenter([-23.5505, -46.6333]); // São Paulo como padrão
      setMapZoom(getZoomLevel());
      return;
    }

    // Se tiver bairro selecionado, centralizar no primeiro imóvel com coordenadas válidas
    if (filtros.bairrosSelecionados && filtros.bairrosSelecionados.length > 0) {
      const primeiroImovelValido = imoveis.find(
        imovel =>
          imovel.Latitude &&
          imovel.Longitude &&
          !isNaN(parseFloat(imovel.Latitude)) &&
          !isNaN(parseFloat(imovel.Longitude))
      );

      if (primeiroImovelValido) {
        setMapCenter([
          parseFloat(primeiroImovelValido.Latitude),
          parseFloat(primeiroImovelValido.Longitude)
        ]);
        setMapZoom(15); // Zoom maior para um único imóvel
        return;
      }
    }

    // Caso contrário, calcular média das coordenadas
    const somaLat = imoveis.reduce((soma, imovel) => soma + parseFloat(imovel.Latitude || 0), 0);
    const somaLng = imoveis.reduce((soma, imovel) => soma + parseFloat(imovel.Longitude || 0), 0);

    setMapCenter([somaLat / imoveis.length, somaLng / imoveis.length]);
    setMapZoom(getZoomLevel());
  }, [imoveis, filtros.bairrosSelecionados]);

  // Centro inicial para o MapContainer
  const initialCenter = [-23.5505, -46.6333]; // São Paulo como padrão

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300 shadow-lg relative">
      {/* Mostrar indicador de carregamento */}
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-70 z-20 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-700">Carregando imóveis...</p>
          </div>
        </div>
      )}

      {/* Mostrar erro, se houver */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-md z-20">
          {error}
        </div>
      )}

      <MapContainer
        center={initialCenter}
        zoom={11}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        attributionControl={true}
        className="w-full h-full google-maps-style"
      >
        <MapController />
        {mapCenter && mapZoom && <MapUpdater center={mapCenter} zoom={mapZoom} />}
        <ZoomControl position="bottomright" />

        {/* Marcadores para os imóveis */}
        {imoveis.map((imovel) => (
          <Marker
            key={imovel._id || imovel.Codigo}
            position={[parseFloat(imovel.Latitude), parseFloat(imovel.Longitude)]}
          >
            <ImovelPopup imovel={imovel} />
          </Marker>
        ))}

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
      </MapContainer>

      {/* Contador de imóveis */}
      {!loading && !error && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full  z-10 text-xs">
          <span className="font-bold">{imoveis.length}</span> imóveis encontrados
        </div>
      )}
    </div>
  );
};

export default MapComponent;
