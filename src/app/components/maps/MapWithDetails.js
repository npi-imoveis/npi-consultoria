// src/app/components/maps/MapWithDetails.js
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, Marker, Popup } from "react-leaflet";
import Image from "next/image";

// Componente de Popup Customizado com fotos funcionando
const ImovelPopup = ({ imovel }) => {
  console.log("🔍 MapWithDetails - Objeto imovel:", imovel);
  console.log("📸 Foto array:", imovel.Foto);

  const formatterSlug = (text) => {
    if (!text) return "";
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const slug = formatterSlug(imovel.Empreendimento || "");

  const getFotoDestaqueUrl = (imovel) => {
    // Verificar se existe o campo Foto e se é um array
    if (!imovel.Foto || !Array.isArray(imovel.Foto) || imovel.Foto.length === 0) {
      console.log(`❌ Imóvel ${imovel.Codigo} - Sem fotos válidas`);
      return 'https://via.placeholder.com/240x130/E5E7EB/6B7280?text=Sem+foto';
    }

    console.log(`📸 Imóvel ${imovel.Codigo} - ${imovel.Foto.length} fotos encontradas`);
    
    // Procurar foto com Destaque = "Sim"
    const fotoDestaque = imovel.Foto.find(foto => {
      return foto && foto.Destaque === "Sim" && foto.Foto;
    });

    if (fotoDestaque && fotoDestaque.Foto) {
      console.log(`✅ Foto destaque: ${fotoDestaque.Foto}`);
      return fotoDestaque.Foto;
    }

    // Fallback: primeira foto disponível
    const primeiraFoto = imovel.Foto.find(foto => foto && foto.Foto);
    if (primeiraFoto && primeiraFoto.Foto) {
      console.log(`📷 Primeira foto: ${primeiraFoto.Foto}`);
      return primeiraFoto.Foto;
    }

    console.log(`❌ Nenhuma foto válida encontrada`);
    return 'https://via.placeholder.com/240x130/E5E7EB/6B7280?text=Sem+foto';
  };

  const fotoUrl = getFotoDestaqueUrl(imovel);
  const valorPrincipal = imovel.ValorVenda 
    ? Number(imovel.ValorVenda).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) 
    : "Consulte";

  return (
    <Popup>
      <div className="w-[240px] font-sans">
        {/* Debug info - remova depois que funcionar */}
        <div className="text-xs bg-green-100 p-1 mb-2 rounded">
          <div>MapWithDetails ativo!</div>
          <div>Fotos: {imovel.Foto?.length || 0}</div>
        </div>

        <div className="relative w-full h-[130px] rounded-lg overflow-hidden mb-2 bg-gray-200">
          <Image 
            src={fotoUrl} 
            alt={`Imóvel ${imovel.Empreendimento}`} 
            fill
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              console.log(`❌ Erro ao carregar: ${fotoUrl}`);
              e.target.src = 'https://via.placeholder.com/240x130/FF0000/FFFFFF?text=ERRO';
            }}
            onLoad={() => {
              console.log(`✅ Foto carregada: ${fotoUrl}`);
            }}
          />
        </div>
        
        <h3 className="font-bold text-sm truncate">{imovel.Empreendimento}</h3>
        <p className="text-xs text-gray-600 truncate">{imovel.BairroComercial || imovel.Endereco}</p>
        <p className="text-base font-bold text-green-700 mt-1">{valorPrincipal}</p>
        
        <a 
          href={`/imovel/${imovel.Codigo}/${slug}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="!no-underline"
        >
          <button className="w-full mt-3 px-3 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
            Ver Detalhes
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

// Componente principal do Mapa - ÚNICA DEFINIÇÃO
export default function MapWithDetails({ filtros }) {
  console.log("🚨 EXECUTANDO MapWithDetails.js - ARQUIVO CORRETO!");
  
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);

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
        
        console.log("🗺️ API URL:", url);
        const response = await fetch(url);
        const data = await response.json();
        console.log("📊 API Data:", data);
        
        setImoveis(data.data || []);
      } catch (err) {
        console.error("❌ Erro:", err);
      } finally {
        setLoading(false);
      }
    };
    buscarImoveisParaMapa();
  }, [filtros]);

  useEffect(() => {
    if (!map || imoveis.length === 0) return;
    const imoveisValidos = imoveis.filter(imovel => 
      imovel.Latitude && imovel.Longitude && 
      !isNaN(parseFloat(imovel.Latitude)) && 
      !isNaN(parseFloat(imovel.Longitude))
    );
    if (imoveisValidos.length === 0) return;
    const bounds = imoveisValidos.map(p => [parseFloat(p.Latitude), parseFloat(p.Longitude)]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [imoveis, map]);

  useEffect(() => {
    import("leaflet").then(L => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });
  }, []);

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-700">Carregando...</p>
          </div>
        </div>
      )}
      
      <MapContainer 
        center={[-23.5505, -46.6333]} 
        zoom={11} 
        style={{ width: "100%", height: "100%" }} 
        zoomControl={false} 
        className="z-10" 
        ref={setMap}
      >
        <MapController />
        <ZoomControl position="bottomright" />
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; OpenStreetMap' 
        />
        
        {imoveis.map((imovel) => (
          (imovel.Latitude && imovel.Longitude) && (
            <Marker 
              key={imovel._id || imovel.Codigo} 
              position={[parseFloat(imovel.Latitude), parseFloat(imovel.Longitude)]}
            >
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
}
