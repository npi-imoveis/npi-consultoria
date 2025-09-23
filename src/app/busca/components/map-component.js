"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, Marker, Popup } from "react-leaflet";
import Image from "next/image";

// ADICIONADO: Log de carregamento do arquivo
console.log("🚨 ARQUIVO MAP-COMPONENT.JS CARREGADO!");

// Componente de Popup Customizado e Otimizado
const ImovelPopup = ({ imovel }) => {
  // LOG 3: VERIFICAR O OBJETO 'imovel' QUE CHEGA AO POPUP
  console.log("LOG 3: Objeto 'imovel' recebido pelo ImovelPopup:", imovel);

  const formatterSlug = (text) => {
    if (!text) return "";
    return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
  };

  const slug = formatterSlug(imovel.Empreendimento || "");

  const getFotoDestaqueUrl = (imovel) => {
    const temFoto = imovel.Foto && Array.isArray(imovel.Foto) && imovel.Foto.length > 0;
    if (!temFoto) {
      console.log(`LOG 4a: Imóvel ${imovel.Codigo} não possui array 'Foto'.`);
      return 'https://via.placeholder.com/240x130/E5E7EB/6B7280?text=Sem+foto';
    }
    
    // CORREÇÃO: Primeiro procura por "Sim", depois por "Nao", depois primeira
    let fotoDestaqueObj = imovel.Foto.find(foto => foto && foto.Destaque === "Sim");
    
    if (fotoDestaqueObj && fotoDestaqueObj.Foto) {
      console.log(`LOG 4b: Imóvel ${imovel.Codigo} - Foto Destaque "Sim" encontrada:`, fotoDestaqueObj.Foto);
      return fotoDestaqueObj.Foto;
    }
    
    // NOVO: Se não tem "Sim", pega qualquer uma com "Nao"
    fotoDestaqueObj = imovel.Foto.find(foto => foto && foto.Destaque === "Nao" && foto.Foto);
    
    if (fotoDestaqueObj && fotoDestaqueObj.Foto) {
      console.log(`LOG 4c: Imóvel ${imovel.Codigo} - Usando foto com Destaque "Nao":`, fotoDestaqueObj.Foto);
      return fotoDestaqueObj.Foto;
    }
    
    // FALLBACK: Primeira foto disponível
    const primeiraFoto = imovel.Foto.find(foto => foto && foto.Foto);
    if (primeiraFoto && primeiraFoto.Foto) {
      console.log(`LOG 4d: Imóvel ${imovel.Codigo} - Usando primeira foto disponível:`, primeiraFoto.Foto);
      return primeiraFoto.Foto;
    }
    
    console.log(`LOG 4e: Nenhuma foto válida encontrada`);
    return 'https://via.placeholder.com/240x130/E5E7EB/6B7280?text=Sem+foto';
  };

  const fotoUrl = getFotoDestaqueUrl(imovel);

  const valorPrincipal = imovel.ValorVenda ? Number(imovel.ValorVenda).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Consulte";

  return (
    <Popup>
      <div className="w-[240px] font-sans">
        {/* CORREÇÃO: Versão atualizada do Next.js Image */}
        <div className="relative w-full h-[130px] rounded-lg overflow-hidden mb-2 bg-gray-200">
          <Image 
            src={fotoUrl} 
            alt={`Destaque do imóvel ${imovel.Empreendimento}`} 
            fill
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              console.log(`❌ Erro ao carregar imagem: ${fotoUrl}`);
              e.target.src = 'https://via.placeholder.com/240x130/FF0000/FFFFFF?text=ERRO';
            }}
            onLoad={() => {
              console.log(`✅ Imagem carregada com sucesso: ${fotoUrl}`);
            }}
          />
        </div>
        <h3 className="font-bold text-sm truncate">{imovel.Empreendimento}</h3>
        <p className="text-xs text-gray-600 truncate">{imovel.BairroComercial || imovel.Endereco}</p>
        <p className="text-base font-bold text-green-700 mt-1">{valorPrincipal}</p>
        <a href={`/imovel/${imovel.Codigo}/${slug}`} target="_blank" rel="noopener noreferrer" className="!no-underline">
           <button className="w-full mt-3 px-3 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">Ver Detalhes</button>
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
  console.log("🚨 EXECUTANDO MapComponent - FUNÇÃO PRINCIPAL!");
  
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
        
        // LOG 1: VERIFICAR A URL DA API
        console.log("LOG 1: Chamando API com a URL:", url);

        const response = await fetch(url);
        const data = await response.json();

        // LOG 2: VERIFICAR OS DADOS BRUTOS DA API
        console.log("LOG 2: Dados brutos recebidos da API:", data);
        console.log("LOG 2b: Primeiro imóvel exemplo:", data.data?.[0]);
        
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
      {/* ADICIONADO: Debug visual */}
      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs z-50">
        map-component.js ativo!
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
        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full z-20 text-xs shadow-lg">
          <span className="font-bold">{imoveis.length}</span> imóveis encontrados
        </div>
      )}
    </div>
  );
};

export default MapComponent;
