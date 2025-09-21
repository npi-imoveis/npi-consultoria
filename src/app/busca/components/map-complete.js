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

// Inject custom styles
if (typeof document !== 'undefined' && !document.querySelector('#map-complete-styles')) {
  const styleSheet = document.createElement("style");
  styleSheet.id = 'map-complete-styles';
  styleSheet.innerHTML = `
    .property-popup .leaflet-popup-content-wrapper {
      padding: 0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }
    
    .property-popup .leaflet-popup-content {
      margin: 0;
      width: 320px !important;
    }
    
    .property-popup .leaflet-popup-tip {
      background: white;
    }
    
    .popup-content {
      background: white;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .property-link {
      display: block;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s;
    }
    
    .property-link:hover {
      transform: translateY(-2px);
    }
    
    .image-container {
      position: relative;
      width: 320px;
      height: 180px;
      background: #f3f4f6;
      overflow: hidden;
    }
    
    .image-skeleton {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    .skeleton-icon {
      color: #9ca3af;
    }
    
    .property-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s;
    }
    
    .property-image.loading {
      opacity: 0;
    }
    
    .price-badge {
      position: absolute;
      bottom: 12px;
      left: 12px;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      backdrop-filter: blur(4px);
    }
    
    .price-period {
      font-size: 12px;
      font-weight: 400;
      opacity: 0.9;
    }
    
    .highlight-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }
    
    .property-info {
      padding: 16px;
    }
    
    .property-title {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .property-location {
      font-size: 13px;
      color: #6b7280;
      margin: 0 0 12px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .property-features {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #374151;
      font-size: 12px;
    }
    
    .feature-item svg {
      color: #6b7280;
    }
    
    .property-cta {
      text-align: center;
      padding: 10px;
      background: #f9fafb;
      margin: 0 -16px -16px;
      border-top: 1px solid #e5e7eb;
    }
    
    .cta-text {
      font-size: 13px;
      font-weight: 600;
      color: #111827;
    }
    
    .map-wrapper {
      width: 100%;
      height: 100%;
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .leaflet-map {
      width: 100%;
      height: 100%;
    }

    .map-loading {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.95);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top-color: #111827;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .map-loading p {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .map-error {
      position: absolute;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 8px 16px;
      border-radius: 8px;
      z-index: 1000;
      font-size: 14px;
    }

    .map-counter {
      position: absolute;
      bottom: 16px;
      left: 16px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      padding: 8px 16px;
      border-radius: 24px;
      z-index: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .counter-indicator {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .counter-text {
      font-size: 13px;
      color: #6b7280;
    }

    .counter-text strong {
      color: #111827;
      font-weight: 700;
    }

    .leaflet-control-zoom {
      border: 1px solid #e5e7eb !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    }

    .leaflet-control-zoom a {
      color: #374151 !important;
      background: white !important;
      border-bottom: 1px solid #e5e7eb !important;
    }

    .leaflet-control-zoom a:hover {
      background: #f9fafb !important;
    }

    .leaflet-control-zoom a:last-child {
      border-bottom: none !important;
    }

    .leaflet-popup {
      animation: fadeInUp 0.3s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .map-counter {
        bottom: 12px;
        left: 12px;
        padding: 6px 12px;
      }

      .counter-text {
        font-size: 12px;
      }

      .leaflet-control-zoom {
        margin-bottom: 60px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

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

// Obtém URL da imagem de destaque
const getCoverUrl = (imovel) => {
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
  
  return candidates[0] || PLACEHOLDER_IMAGE;
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

// Componente do Card/Popup otimizado
function PropertyCard({ imovel }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Extrai informações do imóvel
  const foto = !imageError ? getCoverUrl(imovel) : PLACEHOLDER_IMAGE;
  const titulo = imovel.NomeImovel || imovel.Titulo || imovel.Empreendimento || 
                 `${imovel.Categoria || imovel.Tipo || "Imóvel"} ${imovel.Codigo ? `• ${imovel.Codigo}` : ""}`;
  const cidade = imovel.Cidade || imovel.cidade || "";
  const bairro = imovel.Bairro || imovel.BairroComercial || imovel.bairro || "";
  const endereco = imovel.Endereco || imovel.endereco || "";
  
  // Determina se é aluguel ou venda
  const finalidade = (imovel.Finalidade || imovel.Status || imovel.TipoNegocio || "").toString().toLowerCase();
  const isRent = finalidade.includes("alug") || finalidade.includes("loca") || finalidade === "locacao";
  
  // Obtém o preço correto
  const precoBruto = isRent
    ? (imovel.ValorAluguelNumerico ?? imovel.ValorAluguel ?? imovel.Aluguel)
    : (imovel.ValorNumerico ?? imovel.ValorVenda ?? imovel.Valor ?? imovel.Preco);
  
  const preco = formatBRL(precoBruto);
  
  // Informações adicionais
  const info = getPropertyInfo(imovel);
  
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };
  
  const handleImageLoad = () => {
    setImageLoading(false);
  };
  
  // URL do imóvel
  const href = `/imovel/${imovel.Codigo || imovel._id}`;
  
  return (
    <Popup 
      className="property-popup"
      maxWidth={320}
      minWidth={280}
      autoPan={true}
      keepInView={true}
    >
      <div className="popup-content">
        <a 
          href={href}
          target="_blank"
          rel="noreferrer"
          className="property-link"
        >
          {/* Container da Imagem */}
          <div className="image-container">
            {imageLoading && (
              <div className="image-skeleton">
                <div className="skeleton-icon">
                  <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}
            
            <img
              src={foto}
              alt={titulo}
              className={`property-image ${imageLoading ? 'loading' : ''}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            
            {/* Badge de preço sobre a imagem */}
            {preco && (
              <div className="price-badge">
                <span className="price-value">{preco}</span>
                {isRent && <span className="price-period">/mês</span>}
              </div>
            )}
            
            {/* Badge de destaque */}
            {imovel.Destaque && (
              <div className="highlight-badge">
                ★ Destaque
              </div>
            )}
          </div>
          
          {/* Informações do Imóvel */}
          <div className="property-info">
            <h3 className="property-title">{titulo}</h3>
            
            <p className="property-location">
              {endereco && <span>{endereco}</span>}
              {endereco && (bairro || cidade) && <span>, </span>}
              {bairro && <span>{bairro}</span>}
              {bairro && cidade && <span> • </span>}
              {cidade && <span>{cidade}</span>}
            </p>
            
            {/* Características */}
            <div className="property-features">
              {info.quartos && (
                <div className="feature-item">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>{info.quartos} {info.quartos > 1 ? "quartos" : "quarto"}</span>
                </div>
              )}
              
              {info.suites && (
                <div className="feature-item">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M7 7h10M7 12h10m-7 5h4" />
                  </svg>
                  <span>{info.suites} {info.suites > 1 ? "suítes" : "suíte"}</span>
                </div>
              )}
              
              {info.vagas && (
                <div className="feature-item">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{info.vagas} {info.vagas > 1 ? "vagas" : "vaga"}</span>
                </div>
              )}
              
              {info.area && (
                <div className="feature-item">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <span>{info.area} m²</span>
                </div>
              )}
            </div>
            
            {/* CTA */}
            <div className="property-cta">
              <span className="cta-text">Ver Detalhes →</span>
            </div>
          </div>
        </a>
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
        const res = await getImoveis(searchParams, 1, 200);
        const list = Array.isArray(res?.imoveis) ? res.imoveis : [];

        // Transforma em markers com lat/lng válidos
        const withCoords = list
          .map((it) => {
            const ll = getLatLng(it);
            if (!ll) return null;
            return { ...it, __lat: ll.lat, __lng: ll.lng };
          })
          .filter(Boolean);

        if (mounted) {
          setMarkers(withCoords);
        }
      } catch (err) {
        console.error("[MAP] Erro ao carregar imóveis:", err);
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
    <div className="map-wrapper">
      {/* Loading Overlay */}
      {loading && (
        <div className="map-loading">
          <div className="loading-spinner" />
          <p>Carregando imóveis no mapa...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="map-error">
          <span>{error}</span>
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
        <div className="map-counter">
          <div className="counter-indicator" />
          <span className="counter-text">
            <strong>{markers.length}</strong> imóveis encontrados
          </span>
        </div>
      )}
    </div>
  );
}
