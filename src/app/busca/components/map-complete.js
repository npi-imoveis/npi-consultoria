// src/app/busca/components/map-complete.jsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useFiltersStore from "@/app/store/filtrosStore";
import { getImoveis } from "@/app/services";

/* =========================
   Placeholder Image Base64
========================= */
const PLACEHOLDER_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjNmNGY2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNWU3ZWI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICAKICA8cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0idXJsKCNncmFkKSIvPgogIAogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2MCwgOTApIj4KICAgIDxyZWN0IHg9Ii00MCIgeT0iLTIwIiB3aWR0aD0iODAiIGhlaWdodD0iNTAiIGZpbGw9IiNkMWQ1ZGIiIHJ4PSIyIi8+CiAgICA8cmVjdCB4PSItMzAiIHk9Ii0xMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjOWNhM2FmIi8+CiAgICA8cmVjdCB4PSItNSIgeT0iLTEwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiM5Y2EzYWYiLz4KICAgIDxyZWN0IHg9IjE1IiB5PSItMTAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iIzljYTNhZiIvPgogICAgPHJlY3QgeD0iLTMwIiB5PSIxMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjOWNhM2FmIi8+CiAgICA8cmVjdCB4PSItNSIgeT0iMTAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iIzljYTNhZiIvPgogICAgPHJlY3QgeD0iMTUiIHk9IjEwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiM5Y2EzYWYiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iLTQ1LC0yMCAwLC0zNSA0NSwtMjAiIGZpbGw9IiM5Y2EzYWYiLz4KICAgIDxyZWN0IHg9Ii03IiB5PSIxNSIgd2lkdGg9IjE0IiBoZWlnaHQ9IjE1IiBmaWxsPSIjNmI3MjgwIi8+CiAgPC9nPgogIAogIDx0ZXh0IHg9IjE2MCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNmI3MjgwIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSI1MDAiPgogICAgSW1hZ2VtIG7Do28gZGlzcG9uw612ZWwKICA8L3RleHQ+Cjwvc3ZnPg==";

// Corrige o bug do marker padrão do Leaflet no Webpack/Next
const DefaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/* =========================
   Helpers
========================= */
const coerceNumber = (v) => {
  if (v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// Duplica campos de preço por modalidade
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

// Extrai lat/lng de diferentes formatos
const getLatLng = (item) => {
  const lat =
    coerceNumber(item?.Latitude) ??
    coerceNumber(item?.Lat) ??
    coerceNumber(item?.latitude) ??
    (Array.isArray(item?.Coordenadas) ? coerceNumber(item.Coordenadas[0]) : undefined) ??
    undefined;

  const lng =
    coerceNumber(item?.Longitude) ??
    coerceNumber(item?.Lng) ??
    coerceNumber(item?.longitude) ??
    (Array.isArray(item?.Coordenadas) ? coerceNumber(item.Coordenadas[1]) : undefined) ??
    undefined;

  if (typeof lat === "number" && typeof lng === "number") {
    return { lat, lng };
  }
  return null;
};

// Obtém URL da imagem de destaque - DEBUG: LOG DE TODOS OS CAMPOS
const getCoverUrl = (imovel) => {
  console.log('🖼️ [DEBUG-FOTO] Estrutura completa do imóvel:', imovel);
  console.log('🖼️ [DEBUG-FOTO] Campos de foto disponíveis:', {
    Foto1: imovel?.Foto1,
    fotoDestaque: imovel?.fotoDestaque,
    Capa: imovel?.Capa,
    ImagemCapa: imovel?.ImagemCapa,
    Fotos: imovel?.Fotos,
    Foto: imovel?.Foto,
    imagens: imovel?.imagens,
    Imagens: imovel?.Imagens
  });
  
  // Tenta múltiplos campos possíveis
  const candidates = [
    imovel?.Foto1,
    imovel?.fotoDestaque,
    imovel?.Capa,
    imovel?.ImagemCapa,
    // Se tiver array de Fotos
    Array.isArray(imovel?.Fotos) && imovel.Fotos[0]?.Foto 
      ? imovel.Fotos[0].Foto 
      : undefined,
    Array.isArray(imovel?.Fotos) 
      ? imovel.Fotos[0] 
      : undefined,
    // Se tiver campo Foto como array
    Array.isArray(imovel?.Foto) && imovel.Foto[0]?.Foto
      ? imovel.Foto[0].Foto
      : undefined,
  ].filter(Boolean);
  
  const resultado = candidates[0] || PLACEHOLDER_IMAGE;
  console.log('🖼️ [DEBUG-FOTO] URL final escolhida:', resultado);
  
  return resultado;
};

// Formata preço em BRL
const formatBRL = (n) => {
  const num = Number(String(n).replace(/\D/g, ""));
  if (!Number.isFinite(num) || num === 0) return null;
  
  try {
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  } catch {
    return `R$ ${num.toLocaleString("pt-BR")}`;
  }
};

// Obtém informações do imóvel
const getPropertyInfo = (imovel) => {
  return {
    quartos: imovel?.Quartos || imovel?.quartos || imovel?.Dormitorios || null,
    suites: imovel?.Suites || imovel?.suites || null,
    vagas: imovel?.Vagas || imovel?.vagas || imovel?.Garagem || null,
    area: imovel?.AreaPrivativa || imovel?.areaPrivativa || imovel?.Area || null,
    banheiros: imovel?.Banheiros || imovel?.banheiros || null,
  };
};

/* =========================
   Componentes Auxiliares
========================= */

// Ajusta o mapa para os markers
function FitToMarkers({ points }) {
  const map = useMap();
  const didFitRef = useRef(false);

  useEffect(() => {
    if (!map || didFitRef.current) return;
    if (!points || points.length === 0) return;

    requestAnimationFrame(() => {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      if (bounds.isValid()) {
        if (points.length === 1) {
          map.setView([points[0].lat, points[0].lng], 16, { animate: true });
        } else {
          map.fitBounds(bounds, { 
            padding: [50, 50], 
            maxZoom: 15,
            animate: true 
          });
        }
        didFitRef.current = true;
      }
    });
  }, [map, points]);

  return null;
}

// Invalida o tamanho do mapa quando necessário
function MapController() {
  const map = useMap();
  
  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    };
    
    // Invalida após um pequeno delay para garantir render completo
    const timer = setTimeout(handleResize, 300);
    
    // Listener para resize da janela
    window.addEventListener("resize", handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);
  
  return null;
}

// 🔥🔥🔥 VERSÃO DEBUG DO CARD COM FOTO FORÇADA 🔥🔥🔥
function PropertyCard({ imovel }) {
  // URL do imóvel
  const href = `/imovel/${imovel.Codigo || imovel._id}`;
  
  // 🔥 FORÇAR IMAGEM DE TESTE VERDE
  const fotoTeste = "https://via.placeholder.com/320x180/4CAF50/FFFFFF?text=FOTO+TESTE+DEBUG";
  
  // Obter preço
  const finalidade = (imovel.Finalidade || imovel.Status || imovel.TipoNegocio || "").toString().toLowerCase();
  const isRent = finalidade.includes("alug") || finalidade.includes("loca") || finalidade === "locacao";
  const precoBruto = isRent
    ? (imovel.ValorAluguelNumerico ?? imovel.ValorAluguel ?? imovel.Aluguel)
    : (imovel.ValorNumerico ?? imovel.ValorVenda ?? imovel.Valor ?? imovel.Preco);
  const preco = formatBRL(precoBruto);
  
  // Debug: Log do imóvel
  console.log('🎯 [DEBUG-CARD] Renderizando card para imóvel:', {
    Codigo: imovel.Codigo,
    Nome: imovel.NomeImovel || imovel.Titulo,
    Preco: preco,
    Estrutura: imovel
  });
  
  return (
    <Popup 
      className="property-popup-debug"
      maxWidth={320}
      minWidth={280}
      autoPan={true}
      keepInView={true}
    >
      <div style={{
        width: '320px',
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '2px solid #4CAF50' // Borda verde para identificar
      }}>
        {/* 🖼️ IMAGEM FORÇADA DE TESTE */}
        <div style={{ position: 'relative', width: '320px', height: '180px' }}>
          <img
            src={fotoTeste}
            alt="TESTE DEBUG"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              display: 'block'
            }}
          />
          {/* Badge de preço */}
          {preco && (
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(0,0,0,0.85)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {preco} {isRent && '/mês'}
            </div>
          )}
        </div>
        
        {/* 📝 INFORMAÇÕES DO IMÓVEL */}
        <div style={{ padding: '15px' }}>
          <h3 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: '#111'
          }}>
            {imovel.NomeImovel || imovel.Titulo || imovel.Empreendimento || `Imóvel ${imovel.Codigo}`}
          </h3>
          
          <p style={{ 
            margin: '0 0 10px 0', 
            fontSize: '13px', 
            color: '#666' 
          }}>
            {imovel.Endereco || imovel.endereco || ''} 
            {imovel.Cidade && ` - ${imovel.Cidade}`}
            {imovel.Bairro && ` - ${imovel.Bairro}`}
          </p>
          
          {/* 🔍 DEBUG INFO - IMPORTANTE! */}
          <div style={{ 
            background: '#ffeb3b', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '11px',
            marginTop: '10px',
            border: '1px solid #f57c00',
            fontFamily: 'monospace'
          }}>
            <strong style={{color: '#e65100'}}>🔍 DEBUG INFO:</strong><br/>
            <div style={{marginTop: '5px'}}>
              Código: <strong>{imovel.Codigo || 'N/A'}</strong><br/>
              Tem Foto1? <strong style={{color: imovel.Foto1 ? 'green' : 'red'}}>{imovel.Foto1 ? '✅ SIM' : '❌ NÃO'}</strong><br/>
              Tem Fotos[]? <strong style={{color: imovel.Fotos ? 'green' : 'red'}}>{imovel.Fotos ? `✅ SIM (${imovel.Fotos.length} fotos)` : '❌ NÃO'}</strong><br/>
              Tem Foto[]? <strong style={{color: imovel.Foto ? 'green' : 'red'}}>{imovel.Foto ? `✅ SIM (${imovel.Foto.length} fotos)` : '❌ NÃO'}</strong><br/>
              Tem Imagens[]? <strong style={{color: imovel.Imagens ? 'green' : 'red'}}>{imovel.Imagens ? `✅ SIM` : '❌ NÃO'}</strong><br/>
              {imovel.Foto1 && <span>Foto1: {imovel.Foto1.substring(0, 50)}...</span>}
            </div>
          </div>
          
          {/* Características */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginTop: '10px',
            fontSize: '12px',
            color: '#666'
          }}>
            {imovel.Quartos && <span>🛏️ {imovel.Quartos} quartos</span>}
            {imovel.Vagas && <span>🚗 {imovel.Vagas} vagas</span>}
            {imovel.AreaPrivativa && <span>📐 {imovel.AreaPrivativa}m²</span>}
          </div>
          
          {/* Botão CTA */}
          <a 
            href={href}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              marginTop: '15px',
              padding: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Ver Detalhes →
          </a>
        </div>
      </div>
    </Popup>
  );
}

/* =========================
   Componente Principal
========================= */
export default function MapComplete({ filtros }) {
  const store = useFiltersStore();
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monta parâmetros de busca
  const searchParams = useMemo(() => {
    const finalidadeUi = store.finalidade || filtros?.finalidade || "Comprar";
    const isRent = finalidadeUi === "Alugar";

    const params = {
      categoria: store.categoriaSelecionada || filtros?.categoriaSelecionada || undefined,
      cidade: store.cidadeSelecionada || filtros?.cidadeSelecionada || undefined,
      quartos: store.quartos || filtros?.quartos || undefined,
      banheiros: store.banheiros || filtros?.banheiros || undefined,
      vagas: store.vagas || filtros?.vagas || undefined,
    };

    // Bairros
    const bairros = store.bairrosSelecionados?.length
      ? store.bairrosSelecionados
      : filtros?.bairrosSelecionados?.length
      ? filtros.bairrosSelecionados
      : [];
    if (Array.isArray(bairros) && bairros.length > 0) {
      params.bairrosArray = bairros;
    }

    // Finalidade
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

    // Preços
    Object.assign(
      params,
      buildPriceParams(
        isRent,
        store.precoMin ?? filtros?.precoMin ?? null,
        store.precoMax ?? filtros?.precoMax ?? null
      )
    );

    // Área
    const areaMin = store.areaMin ?? filtros?.areaMin;
    const areaMax = store.areaMax ?? filtros?.areaMax;
    if (areaMin && String(areaMin) !== "0") params.areaMinima = String(areaMin);
    if (areaMax && String(areaMax) !== "0") params.areaMaxima = String(areaMax);

    if (store.abaixoMercado || filtros?.abaixoMercado) params.apenasCondominios = true;
    if (store.proximoMetro || filtros?.proximoMetro) params.proximoMetro = true;

    return params;
  }, [store, filtros]);

  // Busca os imóveis
  useEffect(() => {
    let mounted = true;
    
    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🗺️ [MAPA] Buscando imóveis com params:', searchParams);
        const res = await getImoveis(searchParams, 1, 200);
        console.log('🗺️ [MAPA] Resposta da API:', res);
        
        const list = Array.isArray(res?.imoveis) ? res.imoveis : [];
        console.log('🗺️ [MAPA] Total de imóveis recebidos:', list.length);

        // Transforma em markers com lat/lng válidos
        const withCoords = list
          .map((it) => {
            const ll = getLatLng(it);
            if (!ll) return null;
            return { ...it, __lat: ll.lat, __lng: ll.lng };
          })
          .filter(Boolean);
        
        console.log('🗺️ [MAPA] Imóveis com coordenadas válidas:', withCoords.length);

        if (mounted) {
          setMarkers(withCoords);
        }
      } catch (err) {
        console.error("❌ [MAPA] Erro ao carregar imóveis:", err);
        if (mounted) {
          setMarkers([]);
          setError("Não foi possível carregar os imóveis no mapa");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    
    return () => {
      mounted = false;
    };
  }, [searchParams]);

  // Centro inicial (São Paulo)
  const initialCenter = [-23.55052, -46.633308];
  const points = markers.map((m) => ({ lat: m.__lat, lng: m.__lng }));

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#111827',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Carregando imóveis no mapa...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '8px 16px',
          borderRadius: '8px',
          zIndex: 1000,
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <MapContainer
        center={initialCenter}
        zoom={12}
        scrollWheelZoom
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
        className="leaflet-map"
      >
        <MapController />
        <ZoomControl position="bottomright" />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Ajusta o mapa para os markers */}
        {points.length > 0 && <FitToMarkers points={points} />}

        {/* Renderiza os markers */}
        {markers.map((m) => {
          const key = m.Codigo || m._id || `${m.__lat}-${m.__lng}-${Math.random()}`;
          
          return (
            <Marker key={key} position={[m.__lat, m.__lng]}>
              <PropertyCard imovel={m} />
            </Marker>
          );
        })}
      </MapContainer>

      {/* Contador de Imóveis */}
      {!loading && !error && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          padding: '8px 16px',
          borderRadius: '24px',
          zIndex: 500,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#10b981',
            borderRadius: '50%',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }} />
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            <strong style={{ color: '#111827', fontWeight: '700' }}>
              {markers.length}
            </strong> imóveis encontrados
          </span>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
