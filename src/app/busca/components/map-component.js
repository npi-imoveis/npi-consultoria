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
    // LOG detalhado da estrutura
    console.log(`LOG 4: Analisando fotos do imóvel ${imovel.Codigo}:`, {
      temFoto: !!imovel.Foto,
      ehArray: Array.isArray(imovel.Foto),
      quantidade: imovel.Foto?.length || 0,
      primeiraFoto: imovel.Foto?.[0],
      estrutura: imovel.Foto?.[0] ? Object.keys(imovel.Foto[0]) : []
    });

    const temFoto = imovel.Foto && Array.isArray(imovel.Foto) && imovel.Foto.length > 0;
    
    if (!temFoto) {
      console.log(`LOG 4a: Imóvel ${imovel.Codigo} não possui array 'Foto'.`);
      return 'https://via.placeholder.com/240x130/E5E7EB/6B7280?text=Sem+foto';
    }
    
    // CORREÇÃO PRINCIPAL: Verificar diferentes estruturas possíveis
    let urlFoto = null;
    
    // 1. Primeiro tenta encontrar foto com Destaque = "Sim"
    const fotoDestaqueSim = imovel.Foto.find(foto => 
      foto && foto.Destaque === "Sim" && foto.Foto
    );
    
    if (fotoDestaqueSim?.Foto) {
      urlFoto = fotoDestaqueSim.Foto;
      console.log(`LOG 4b: Foto com Destaque="Sim" encontrada:`, urlFoto);
    }
    
    // 2. Se não encontrou, tenta com Destaque = true (boolean)
    if (!urlFoto) {
      const fotoDestaqueTrue = imovel.Foto.find(foto => 
        foto && foto.Destaque === true && foto.Foto
      );
      
      if (fotoDestaqueTrue?.Foto) {
        urlFoto = fotoDestaqueTrue.Foto;
        console.log(`LOG 4c: Foto com Destaque=true encontrada:`, urlFoto);
      }
    }
    
    // 3. Se não encontrou, tenta campo FotoDestaque no objeto principal
    if (!urlFoto && imovel.FotoDestaque) {
      urlFoto = imovel.FotoDestaque;
      console.log(`LOG 4d: Usando FotoDestaque do imóvel:`, urlFoto);
    }
    
    // 4. Se não encontrou, tenta campo imagemDestaque
    if (!urlFoto && imovel.imagemDestaque) {
      urlFoto = imovel.imagemDestaque;
      console.log(`LOG 4e: Usando imagemDestaque do imóvel:`, urlFoto);
    }
    
    // 5. Se não encontrou, pega a primeira foto disponível com campo Foto preenchido
    if (!urlFoto) {
      const primeiraFotoValida = imovel.Foto.find(foto => 
        foto && foto.Foto && typeof foto.Foto === 'string' && foto.Foto.trim() !== ''
      );
      
      if (primeiraFotoValida?.Foto) {
        urlFoto = primeiraFotoValida.Foto;
        console.log(`LOG 4f: Usando primeira foto válida:`, urlFoto);
      }
    }
    
    // 6. Última tentativa: primeira foto do array, independente do campo Destaque
    if (!urlFoto && imovel.Foto[0]) {
      // Verifica diferentes possíveis estruturas
      if (imovel.Foto[0].Foto) {
        urlFoto = imovel.Foto[0].Foto;
      } else if (imovel.Foto[0].url) {
        urlFoto = imovel.Foto[0].url;
      } else if (imovel.Foto[0].src) {
        urlFoto = imovel.Foto[0].src;
      } else if (typeof imovel.Foto[0] === 'string') {
        urlFoto = imovel.Foto[0];
      }
      
      if (urlFoto) {
        console.log(`LOG 4g: Usando primeira foto do array (fallback):`, urlFoto);
      }
    }
    
    // Validação e processamento da URL
    if (urlFoto) {
      // Remove espaços em branco
      urlFoto = urlFoto.trim();
      
      // Se a URL não começar com http, adiciona o protocolo
      if (!urlFoto.startsWith('http://') && !urlFoto.startsWith('https://')) {
        // Se começar com //, adiciona https:
        if (urlFoto.startsWith('//')) {
          urlFoto = 'https:' + urlFoto;
        } 
        // Se começar com /, assume que é um caminho relativo
        else if (urlFoto.startsWith('/')) {
          // Você pode ajustar o domínio base aqui se necessário
          urlFoto = window.location.origin + urlFoto;
        }
        // Se não tiver protocolo nem barra, assume que é uma URL completa sem protocolo
        else {
          urlFoto = 'https://' + urlFoto;
        }
      }
      
      console.log(`LOG 4h: URL final processada:`, urlFoto);
      return urlFoto;
    }
    
    console.log(`LOG 4i: Nenhuma foto válida encontrada, usando placeholder`);
    return 'https://via.placeholder.com/240x130/E5E7EB/6B7280?text=Sem+foto';
  };

  const fotoUrl = getFotoDestaqueUrl(imovel);

  const valorPrincipal = imovel.ValorVenda ? 
    Number(imovel.ValorVenda).toLocaleString("pt-BR", { 
      style: "currency", 
      currency: "BRL" 
    }) : "Consulte";

  // Adiciona informações extras se disponíveis
  const getInfoExtra = () => {
    const infos = [];
    if (imovel.AreaPrivativa) infos.push(`${imovel.AreaPrivativa}m²`);
    if (imovel.Dormitorios) infos.push(`${imovel.Dormitorios} dorm.`);
    if (imovel.Vagas) infos.push(`${imovel.Vagas} vaga${imovel.Vagas > 1 ? 's' : ''}`);
    return infos.join(' • ');
  };

  const infoExtra = getInfoExtra();

  return (
    <Popup>
      <div className="w-[240px] font-sans">
        {/* Container da imagem com fallback melhorado */}
        <div className="relative w-full h-[130px] rounded-lg overflow-hidden mb-2 bg-gray-200">
          <Image 
            src={fotoUrl} 
            alt={`Destaque do imóvel ${imovel.Empreendimento || imovel.Codigo}`} 
            fill
            style={{ objectFit: 'cover' }}
            sizes="240px"
            priority={false}
            onError={(e) => {
              console.log(`❌ Erro ao carregar imagem: ${fotoUrl}`);
              // Define uma imagem de erro diretamente
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
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
              console.log(`✅ Imagem carregada com sucesso: ${fotoUrl.substring(0, 50)}...`);
            }}
          />
        </div>
        
        {/* Título do imóvel */}
        <h3 className="font-bold text-sm truncate" title={imovel.Empreendimento}>
          {imovel.Empreendimento || `Imóvel ${imovel.Codigo}`}
        </h3>
        
        {/* Localização */}
        <p className="text-xs text-gray-600 truncate" title={imovel.BairroComercial || imovel.Endereco}>
          {imovel.BairroComercial || imovel.Endereco || "Localização não informada"}
        </p>
        
        {/* Informações extras (área, dormitórios, vagas) */}
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
        console.log("LOG 2c: Estrutura do campo Foto:", {
          foto: data.data?.[0]?.Foto,
          ehArray: Array.isArray(data.data?.[0]?.Foto),
          primeiraFoto: data.data?.[0]?.Foto?.[0]
        });
        
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
      imovel.Latitude && imovel.Longitude && 
      !isNaN(parseFloat(imovel.Latitude)) && 
      !isNaN(parseFloat(imovel.Longitude))
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
        map-component.js v2.0
      </div>
      
      {loading && (
        <div className="absolute inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-700">Carregando imóveis...</p>
          </div>
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
};

export default MapComponent;
