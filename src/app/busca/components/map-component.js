"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, Marker, Popup } from "react-leaflet";
import Image from "next/image";

// TESTE 1: ALERTA IMEDIATO
alert("🚨🚨🚨 MAP-COMPONENT.JS ESTÁ CARREGANDO! 🚨🚨🚨");
console.log("🔴🔴🔴 ARQUIVO MAP-COMPONENT.JS VERSÃO 3.0 🔴🔴🔴");

// Componente de Popup Customizado e Otimizado
const ImovelPopup = ({ imovel }) => {
  console.log("🟢 POPUP RENDERIZANDO:", imovel.Codigo);
  
  const formatterSlug = (text) => {
    if (!text) return "";
    return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  };

  const slug = formatterSlug(imovel.Empreendimento || "");

  // SEMPRE retornar uma foto para teste
  const getFotoDestaqueUrl = (imovel) => {
    // FORÇAR IMAGEM DE TESTE
    return "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop";
  };

  const fotoUrl = getFotoDestaqueUrl(imovel);
  const valorPrincipal = imovel.ValorVenda ? Number(imovel.ValorVenda).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Consulte";

  return (
    <Popup>
      <div className="w-[240px] font-sans">
        {/* TESTE VISUAL: FUNDO VERMELHO */}
        <div style={{ backgroundColor: 'red', color: 'white', padding: '10px', marginBottom: '10px' }}>
          🔴 TESTE V3.0 - POPUP NOVO! 🔴
        </div>
        
        {/* IMAGEM DE TESTE */}
        <div className="relative w-full h-[130px] rounded-lg overflow-hidden mb-2 bg-gray-200">
          <img 
            src={fotoUrl}
            alt="TESTE FOTO"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '5px',
            background: 'yellow',
            color: 'black',
            padding: '5px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            FOTO TESTE
          </div>
        </div>
        
        <h3 className="font-bold text-sm truncate">{imovel.Empreendimento || "TESTE EMPREENDIMENTO"}</h3>
        <p className="text-xs text-gray-600 truncate">{imovel.BairroComercial || "TESTE BAIRRO"}</p>
        
        {/* MOSTRAR TODOS OS CAMPOS DISPONÍVEIS */}
        <div style={{ fontSize: '10px', background: '#f0f0f0', padding: '5px', margin: '5px 0' }}>
          <div>Área: {imovel.AreaPrivativa || 'N/A'} m²</div>
          <div>Quartos: {imovel.Quartos || imovel.Dormitorios || 'N/A'}</div>
          <div>Vagas: {imovel.Vagas || 'N/A'}</div>
          <div>Tem Foto? {imovel.Foto ? 'SIM' : 'NÃO'}</div>
        </div>
        
        <p className="text-base font-bold text-green-700 mt-1">{valorPrincipal}</p>
        
        <a href={`/imovel/${imovel.Codigo}/${slug}`} target="_blank" rel="noopener noreferrer" className="!no-underline">
          <button style={{ 
            width: '100%',
            marginTop: '10px',
            padding: '10px',
            background: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}>
            🔴 VER DETALHES (TESTE) 🔴
          </button>
        </a>
      </div>
    </Popup>
  );
};

// Componentes de controle do mapa
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

// O componente principal
const MapComponent = ({ filtros }) => {
  console.log("🔴🔴🔴 MapComponent RENDERIZANDO - VERSÃO 3.0! 🔴🔴🔴");
  
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([-23.5505, -46.6333]);
  const [mapZoom, setMapZoom] = useState(11);

  useEffect(() => {
    const buscarImoveisParaMapa = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filtros?.categoriaSelecionada) params.append('categoria', filtros.categoriaSelecionada);
        if (filtros?.cidadeSelecionada) params.append('cidade', filtros.cidadeSelecionada);
        if (filtros?.bairrosSelecionados?.length > 0) {
          filtros.bairrosSelecionados.forEach(bairro => params.append('bairros', bairro));
        }
        
        const cacheBuster = `&t=${new Date().getTime()}`;
        const url = `/api/imoveis/mapa?${params.toString()}${cacheBuster}`;
        
        console.log("🔴 CHAMANDO API:", url);

        const response = await fetch(url);
        const data = await response.json();

        console.log("🔴 DADOS RECEBIDOS:", data);
        
        setImoveis(data.data || []);

      } catch (err) {
        console.error("ERRO:", err);
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
        });
      });
    } catch (error) {
      console.error("Erro ao carregar o Leaflet:", error);
    }
  }, []);

  useEffect(() => {
    if (imoveis.length === 0) return;
    const imoveisValidos = imoveis.filter(imovel =>
      imovel.Latitude && imovel.Longitude && !isNaN(parseFloat(imovel.Latitude)) && !isNaN(parseFloat(imovel.Longitude))
    );
    if (imoveisValidos.length === 0) return;
    const somaLat = imoveisValidos.reduce((soma, imovel) => soma + parseFloat(imovel.Latitude), 0);
    const somaLng = imoveisValidos.reduce((soma, imovel) => soma + parseFloat(imovel.Longitude), 0);
    setMapCenter([somaLat / imoveisValidos.length, somaLng / imoveisValidos.length]);
    if (imoveisValidos.length === 1) setMapZoom(16);
    else setMapZoom(12);
  }, [imoveis]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300 shadow-lg relative">
      {/* TESTE VISUAL GIGANTE */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'red',
        color: 'white',
        padding: '20px',
        fontSize: '20px',
        fontWeight: 'bold',
        zIndex: 9999,
        border: '5px solid yellow'
      }}>
        🔴 VERSÃO 3.0 TESTE 🔴
      </div>
      
      {loading && (
        <div className="absolute inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-700">Carregando imóveis...</p>
          </div>
        </div>
      )}
      <MapContainer center={mapCenter} zoom={mapZoom} style={{ width: "100%", height: "100%", minHeight: '500px' }} zoomControl={false} className="z-10">
        <MapController />
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <ZoomControl position="bottomright" />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        {imoveis.map((imovel) => (
          (imovel.Latitude && imovel.Longitude) && (
            <Marker key={imovel._id || imovel.Codigo} position={[parseFloat(imovel.Latitude), parseFloat(imovel.Longitude)]}>
              <ImovelPopup imovel={imovel} />
            </Marker>
          )
        ))}
      </MapContainer>
      {!loading && (
        <div className="absolute bottom-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full z-20 text-xs shadow-lg">
          <span className="font-bold">{imoveis.length}</span> imóveis (VERSÃO 3.0)
        </div>
      )}
    </div>
  );
};

export default MapComponent;
