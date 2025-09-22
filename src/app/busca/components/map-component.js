// src/app/busca/components/map-component.js

"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, Marker, Popup } from "react-leaflet";
import Image from "next/image"; // Usaremos o Image do Next.js aqui para performance!
import { Button } from "@/app/components/ui/button"; // Assumindo que este componente exista
import { formatterSlug } from "@/app/utils/formatter-slug";

// --- INÍCIO DA MODIFICAÇÃO ---

// Componente de Popup Customizado e Otimizado
const ImovelPopup = ({ imovel }) => {
  const slug = formatterSlug(imovel.Empreendimento || "");

  // Lógica para buscar a foto de destaque (a mesma que definimos antes)
  const getFotoDestaqueUrl = (imovel) => {
    const temFoto = imovel.Foto && Array.isArray(imovel.Foto) && imovel.Foto.length > 0;
    if (!temFoto) return '/placeholder-imovel.jpg';
    
    const fotoDestaqueObj = imovel.Foto.find(foto => foto && foto.Destaque === "Sim");
    if (fotoDestaqueObj && fotoDestaqueObj.Foto) return fotoDestaqueObj.Foto;
    
    return imovel.Foto[0]?.Foto || '/placeholder-imovel.jpg';
  };

  const fotoUrl = getFotoDestaqueUrl(imovel);

  // Lógica de Valor (simplificada do seu CardImovel)
  const valorPrincipal = imovel.ValorVenda
    ? Number(imovel.ValorVenda).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "Consulte";

  return (
    <Popup>
      {/* Usamos um wrapper para evitar que o Leaflet quebre o estilo */}
      <div className="w-[240px] font-sans">
        <div className="relative w-full h-[130px] rounded-lg overflow-hidden mb-2">
          <Image
            src={fotoUrl}
            alt={`Destaque do imóvel ${imovel.Empreendimento}`}
            layout="fill"
            objectFit="cover"
            className="bg-gray-200"
          />
        </div>
        <h3 className="font-bold text-sm truncate">{imovel.Empreendimento}</h3>
        <p className="text-xs text-gray-600 truncate">{imovel.BairroComercial || imovel.Endereco}</p>
        <p className="text-base font-bold text-green-700 mt-1">{valorPrincipal}</p>
        <a href={`/imovel/${imovel.Codigo}/${slug}`} target="_blank" rel="noopener noreferrer" className="!no-underline">
           <button 
             className="w-full mt-3 px-3 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
           >
             Ver Detalhes
           </button>
        </a>
      </div>
    </Popup>
  );
};

// --- FIM DA MODIFICAÇÃO ---


// Componentes de controle do mapa (sem alterações)
const MapController = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [map]);
  return null;
};

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
};


const MapComponent = ({ filtros }) => {
  console.log("### MAPA RENDERIZADO: MapComponent.js ###"); // Log de confirmação
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([-23.5505, -46.6333]);
  const [mapZoom, setMapZoom] = useState(11);

  useEffect(() => {
    const buscarImoveisParaMapa = async () => {
      try {
        setLoading(true);
        // A sua função getImoveisParaMapa já deve estar pegando os filtros
        // Vamos garantir que a API retorne o campo 'Foto'
        const params = new URLSearchParams();
        if (filtros?.categoriaSelecionada) params.append('categoria', filtros.categoriaSelecionada);
        if (filtros?.cidadeSelecionada) params.append('cidade', filtros.cidadeSelecionada);
        if (filtros?.bairrosSelecionados?.length > 0) {
          filtros.bairrosSelecionados.forEach(bairro => params.append('bairros', bairro));
        }
        
        const response = await fetch(`/api/imoveis/mapa?${params.toString()}`);
        const data = await response.json();

        setImoveis(data.data || []);

      } catch (err) {
        console.error("Erro ao buscar imóveis para o mapa:", err);
        setError("Não foi possível carregar os imóveis.");
      } finally {
        setLoading(false);
      }
    };
    buscarImoveisParaMapa();
  }, [filtros]);

  useEffect(() => {
    try {
      import("leaflet").then((L) => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        } );
      });
    } catch (error) {
      console.error("Erro ao carregar o Leaflet:", error);
    }
  }, []);

  useEffect(() => {
    if (imoveis.length === 0) return;

    const imoveisValidos = imoveis.filter(imovel =>
      imovel.Latitude && imovel.Longitude &&
      !isNaN(parseFloat(imovel.Latitude)) && !isNaN(parseFloat(imovel.Longitude)) &&
      parseFloat(imovel.Latitude) !== 0 && parseFloat(imovel.Longitude) !== 0
    );
    
    if (imoveisValidos.length === 0) return;

    const somaLat = imoveisValidos.reduce((soma, imovel) => soma + parseFloat(imovel.Latitude), 0);
    const somaLng = imoveisValidos.reduce((soma, imovel) => soma + parseFloat(imovel.Longitude), 0);
    setMapCenter([somaLat / imoveisValidos.length, somaLng / imoveisValidos.length]);

    if (imoveisValidos.length === 1) setMapZoom(16);
    else if (imoveisValidos.length <= 5) setMapZoom(14);
    else setMapZoom(12);
  }, [imoveis]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300 shadow-lg relative">
      {loading && (
        <div className="absolute inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-700">Carregando imóveis...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-md z-50">
          {error}
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ width: "100%", height: "100%", minHeight: '500px' }}
        zoomControl={false}
        className="z-10"
      >
        <MapController />
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <ZoomControl position="bottomright" />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {imoveis.map((imovel ) => (
          // Validação para garantir que o marcador só seja renderizado com coordenadas válidas
          (imovel.Latitude && imovel.Longitude) && (
            <Marker
              key={imovel._id || imovel.Codigo}
              position={[parseFloat(imovel.Latitude), parseFloat(imovel.Longitude)]}
            >
              {/* AQUI ESTÁ A MÁGICA: USANDO O NOVO COMPONENTE DE POPUP */}
              <ImovelPopup imovel={imovel} />
            </Marker>
          )
        ))}
      </MapContainer>

      {!loading && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full z-20 text-xs shadow-lg">
          <span className="font-bold">{imoveis.length}</span> imóveis encontrados
        </div>
      )}
    </div>
  );
};

export default MapComponent;
