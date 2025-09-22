// src/app/busca/components/map-component.js
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, Marker, Popup } from "react-leaflet";
import Image from "next/image";

// Componente de Popup Customizado CORRIGIDO com fotos
const ImovelPopup = ({ imovel }) => {
  console.log("🔍 MAP-COMPONENT DEBUG:");
  console.log("1. Objeto imovel:", imovel);
  console.log("2. imovel.Foto:", imovel.Foto);
  console.log("3. É array?", Array.isArray(imovel.Foto));
  console.log("4. Tamanho:", imovel.Foto?.length);

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
        <div className="text-xs bg-blue-100 p-1 mb-2 rounded">
          <div>Fotos: {imovel.Foto?.length || 0}</div>
          <div>URL: {fotoUrl.slice(0, 30)}...</div>
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

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && zoom && center.length === 2) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
};

// Componente principal do mapa
export default function MapComponent({ filtros }) {
  console.log("🚨 EXECUTANDO map-component.js - ESTE É O ARQUIVO CORRETO!");
  
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([-23.5505, -46.6333]);
  const [mapZoom, setMapZoom] = useState(11);

  useEffect(() => {
    const buscarImoveisParaMapa = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (filtros?.categoriaSelecionada) params.append('categoria', filtros.categoriaSelecionada);
        if (filtros?.cidadeSelecionada) params.append('cidade', filtros.cidadeSelecionada);
        if (filtros?.bairrosSelecionados?.length > 0) {
          filtros.bairrosSelecionados.forEach(bairro => params.append('bairros', bairro));
        }
        
        const cacheBuster = `&t=${new Date().getTime()}`;
        const url = `/api/imoveis/mapa?${params.toString()}${cacheBuster}`;
        
        console.log("🗺️ Chamando API:", url);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📊 Dados da API:", data);
        
        if (data.data && Array.isArray(data.data)) {
          console.log("📋 Primeiro imóvel exemplo:", data.data[0]);
          setImoveis(data.data);
        } else {
          setImoveis([]);
        }

      } catch (err) {
        console.error("❌ Erro:", err);
        setError(err.message);
        setImoveis([]);
      } finally {
        setLoading(false);
      }
    };

    buscarImoveisParaMapa();
  }, [filtros]);

  // Configurar ícones do Leaflet
  useEffect(() => {
    const setupLeafletIcons = async () => {
      try {
        const L = await import("leaflet");
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
      } catch (error) {
        console.error("❌ Erro Leaflet:", error);
      }
    };

    setupLeafletIcons();
  }, []);

  // Atualizar centro do mapa
  useEffect(() => {
    if (imoveis.length === 0) return;

    const imoveisValidos = imoveis.filter(imovel =>
      imovel.Latitude && 
      imovel.Longitude && 
      !isNaN(parseFloat(imovel.Latitude)) && 
      !isNaN(parseFloat(imovel.Longitude))
    );

    if (imoveisValidos.length === 0) return;

    const somaLat = imoveisValidos.reduce((soma, imovel) => soma + parseFloat(imovel.Latitude), 0);
    const somaLng = imoveisValidos.reduce((soma, imovel) => soma + parseFloat(imovel.Longitude), 0);
    
    setMapCenter([somaLat / imoveisValidos.length, somaLng / imoveisValidos.length]);
    setMapZoom(imoveisValidos.length === 1 ? 16 : 12);
  }, [imoveis]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50">
        <p className="text-red-600">Erro: {error}</p>
      </div>
    );
  }

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
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ width: "100%", height: "100%" }} 
        zoomControl={false} 
        className="z-10"
      >
        <MapController />
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <ZoomControl position="bottomright" />
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; OpenStreetMap contributors' 
        />
        
        {imoveis.map((imovel) => {
          if (!imovel.Latitude || !imovel.Longitude) return null;
          
          const lat = parseFloat(imovel.Latitude);
          const lng = parseFloat(imovel.Longitude);
          
          if (isNaN(lat) || isNaN(lng)) return null;
          
          return (
            <Marker 
              key={imovel._id || imovel.Codigo} 
              position={[lat, lng]}
            >
              <ImovelPopup imovel={imovel} />
            </Marker>
          );
        })}
      </MapContainer>

      {!loading && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full z-20 text-xs shadow-lg">
          <span className="font-bold">{imoveis.length}</span> imóveis encontrados
        </div>
      )}
    </div>
  );
}
