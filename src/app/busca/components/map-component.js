// src/app/busca/components/map-component.js
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, Marker, Popup } from "react-leaflet";
import Image from "next/image";

// Componente de Popup com Fotos
const ImovelPopup = ({ imovel }) => {
  console.log("📍 Renderizando popup para:", imovel.Codigo);
  console.log("📸 Array de fotos:", imovel.Foto);

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
    // Primeiro verifica se a API já processou a foto
    if (imovel._fotoDestaqueProcessada) {
      console.log(`✅ Usando foto pré-processada: ${imovel._fotoDestaqueProcessada}`);
      return imovel._fotoDestaqueProcessada;
    }

    // Verificar se existe o campo Foto e se é um array
    if (!imovel.Foto || !Array.isArray(imovel.Foto) || imovel.Foto.length === 0) {
      console.log(`❌ Imóvel ${imovel.Codigo} - Sem array de fotos`);
      
      // Tentar campos alternativos
      if (imovel.FotoDestaque) return imovel.FotoDestaque;
      if (imovel.imagemDestaque) return imovel.imagemDestaque;
      if (imovel.FotoPrincipal) return imovel.FotoPrincipal;
      
      return 'https://via.placeholder.com/240x130/E5E7EB/6B7280?text=Sem+foto';
    }

    console.log(`📸 Imóvel ${imovel.Codigo} - ${imovel.Foto.length} fotos encontradas`);
    
    // Procurar foto com Destaque = "Sim"
    const fotoDestaque = imovel.Foto.find(foto => 
      foto && foto.Destaque === "Sim" && foto.Foto
    );

    if (fotoDestaque && fotoDestaque.Foto) {
      console.log(`✅ Foto destaque encontrada: ${fotoDestaque.Foto}`);
      return fotoDestaque.Foto;
    }

    // Fallback: primeira foto com campo Foto preenchido
    const primeiraFoto = imovel.Foto.find(foto => 
      foto && foto.Foto && typeof foto.Foto === 'string' && foto.Foto.trim() !== ''
    );
    
    if (primeiraFoto && primeiraFoto.Foto) {
      console.log(`📷 Usando primeira foto: ${primeiraFoto.Foto}`);
      return primeiraFoto.Foto;
    }

    // Fallback 2: tentar FotoPequena
    const primeiraFotoPequena = imovel.Foto.find(foto => 
      foto && foto.FotoPequena && typeof foto.FotoPequena === 'string' && foto.FotoPequena.trim() !== ''
    );
    
    if (primeiraFotoPequena && primeiraFotoPequena.FotoPequena) {
      console.log(`📷 Usando FotoPequena: ${primeiraFotoPequena.FotoPequena}`);
      return primeiraFotoPequena.FotoPequena;
    }

    console.log(`❌ Nenhuma foto válida encontrada`);
    return 'https://via.placeholder.com/240x130/E5E7EB/6B7280?text=Sem+foto';
  };

  const fotoUrl = getFotoDestaqueUrl(imovel);
  
  // Formatar valor com verificação de locação também
  const valorPrincipal = imovel.ValorVenda 
    ? Number(imovel.ValorVenda).toLocaleString("pt-BR", { 
        style: "currency", 
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }) 
    : imovel.ValorLocacao 
    ? Number(imovel.ValorLocacao).toLocaleString("pt-BR", { 
        style: "currency", 
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }) + "/mês"
    : "Consulte";

  // Monta informações extras
  const getInfoExtra = () => {
    const infos = [];
    if (imovel.AreaPrivativa || imovel.AreaConstruida) {
      infos.push(`${imovel.AreaPrivativa || imovel.AreaConstruida} m²`);
    }
    if (imovel.Dormitorios || imovel.Quartos) {
      const qtd = imovel.Dormitorios || imovel.Quartos;
      infos.push(`${qtd} dorm.`);
    }
    if (imovel.Vagas) {
      infos.push(`${imovel.Vagas} vaga${imovel.Vagas > 1 ? 's' : ''}`);
    }
    return infos.join(' • ');
  };

  const infoExtra = getInfoExtra();

  return (
    <Popup>
      <div className="w-[240px] font-sans">
        {/* Imagem do imóvel */}
        <div className="relative w-full h-[130px] rounded-lg overflow-hidden mb-2 bg-gray-200">
          <Image 
            src={fotoUrl} 
            alt={`Imóvel ${imovel.Empreendimento || imovel.Codigo}`} 
            fill
            style={{ objectFit: 'cover' }}
            sizes="240px"
            priority={false}
            onError={(e) => {
              console.log(`❌ Erro ao carregar imagem: ${fotoUrl}`);
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.innerHTML = `
                <div style="
                  width: 100%; 
                  height: 100%; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center;
                  background: #f3f4f6;
                  color: #6b7280;
                  font-size: 12px;
                ">
                  <div style="text-align: center;">
                    <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                    <div>Sem foto</div>
                  </div>
                </div>
              `;
            }}
            onLoad={() => {
              console.log(`✅ Foto carregada com sucesso`);
            }}
          />
        </div>
        
        {/* Título */}
        <h3 className="font-bold text-sm truncate" title={imovel.Empreendimento}>
          {imovel.Empreendimento || `Imóvel ${imovel.Codigo}`}
        </h3>
        
        {/* Localização */}
        <p className="text-xs text-gray-600 truncate" title={imovel.BairroComercial || imovel.Bairro || imovel.Endereco}>
          {imovel.BairroComercial || imovel.Bairro || imovel.Endereco || "Localização"}
        </p>
        
        {/* Info extra (área, dormitórios, vagas) */}
        {infoExtra && (
          <p className="text-xs text-gray-500 mt-1">
            {infoExtra}
          </p>
        )}
        
        {/* Valor */}
        <p className="text-base font-bold text-green-700 mt-1">
          {valorPrincipal}
        </p>
        
        {/* Botão Ver Detalhes */}
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

// Componente de controle do mapa
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

// Componente principal do Mapa
export default function MapComponent({ filtros }) {
  console.log("🗺️ MapComponent iniciando...");
  
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const buscarImoveisParaMapa = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        // Adicionar filtros se existirem
        if (filtros?.categoriaSelecionada) {
          params.append('categoria', filtros.categoriaSelecionada);
        }
        if (filtros?.cidadeSelecionada) {
          params.append('cidade', filtros.cidadeSelecionada);
        }
        if (filtros?.bairrosSelecionados?.length > 0) {
          filtros.bairrosSelecionados.forEach(bairro => {
            params.append('bairros', bairro);
          });
        }
        
        const cacheBuster = `&t=${new Date().getTime()}`;
        const url = `/api/imoveis/mapa?${params.toString()}${cacheBuster}`;
        
        console.log("📍 Buscando imóveis da API:", url);
        const response = await fetch(url);
        const data = await response.json();
        
        console.log(`✅ ${data.data?.length || 0} imóveis recebidos`);
        if (data.data?.length > 0) {
          console.log("Primeiro imóvel (exemplo):", data.data[0]);
          console.log("Estrutura do campo Foto:", {
            temFoto: !!data.data[0].Foto,
            ehArray: Array.isArray(data.data[0].Foto),
            quantidade: data.data[0].Foto?.length || 0,
            primeiraFoto: data.data[0].Foto?.[0]
          });
        }
        
        setImoveis(data.data || []);
      } catch (err) {
        console.error("❌ Erro ao buscar imóveis:", err);
      } finally {
        setLoading(false);
      }
    };
    
    buscarImoveisParaMapa();
  }, [filtros]);

  // Ajustar bounds do mapa quando os imóveis mudarem
  useEffect(() => {
    if (!map || imoveis.length === 0) return;
    
    const imoveisValidos = imoveis.filter(imovel => 
      imovel.Latitude && imovel.Longitude && 
      !isNaN(parseFloat(imovel.Latitude)) && 
      !isNaN(parseFloat(imovel.Longitude))
    );
    
    if (imoveisValidos.length === 0) return;
    
    const bounds = imoveisValidos.map(p => [
      parseFloat(p.Latitude), 
      parseFloat(p.Longitude)
    ]);
    
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [imoveis, map]);

  // Configurar ícones do Leaflet
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
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-700">Carregando mapa...</p>
          </div>
        </div>
      )}
      
      {/* Mapa */}
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
        
        {/* Marcadores */}
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
      
      {/* Contador de imóveis */}
      {!loading && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full z-20 text-xs shadow-lg">
          <span className="font-bold">{imoveis.length}</span> imóveis encontrados
        </div>
      )}
    </div>
  );
}
