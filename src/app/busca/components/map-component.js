"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, Marker, Popup } from "react-leaflet";
import Image from "next/image";
import dynamic from "next/dynamic";

import { getImoveisParaMapa } from "@/app/services";
import { Button } from "@/app/components/ui/button";
import { formatterSlug } from "@/app/utils/formatter-slug";

/* =========================
   Placeholder Image Base64
========================= */
const PLACEHOLDER_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjNmNGY2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNWU3ZWI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICAKICA8cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0idXJsKCNncmFkKSIvPgogIAogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2MCwgOTApIj4KICAgIDxyZWN0IHg9Ii00MCIgeT0iLTIwIiB3aWR0aD0iODAiIGhlaWdodD0iNTAiIGZpbGw9IiNkMWQ1ZGIiIHJ4PSIyIi8+CiAgICA8cmVjdCB4PSItMzAiIHk9Ii0xMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjOWNhM2FmIi8+CiAgICA8cmVjdCB4PSItNSIgeT0iLTEwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiM5Y2EzYWYiLz4KICAgIDxyZWN0IHg9IjE1IiB5PSItMTAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iIzljYTNhZiIvPgogICAgPHJlY3QgeD0iLTMwIiB5PSIxMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjOWNhM2FmIi8+CiAgICA8cmVjdCB4PSItNSIgeT0iMTAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iIzljYTNhZiIvPgogICAgPHJlY3QgeD0iMTUiIHk9IjEwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiM5Y2EzYWYiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iLTQ1LC0yMCAwLC0zNSA0NSwtMjAiIGZpbGw9IiM5Y2EzYWYiLz4KICAgIDxyZWN0IHg9Ii03IiB5PSIxNSIgd2lkdGg9IjE0IiBoZWlnaHQ9IjE1IiBmaWxsPSIjNmI3MjgwIi8+CiAgPC9nPgogIAogIDx0ZXh0IHg9IjE2MCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNmI3MjgwIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZvbnQtd2VpZ2h0PSI1MDAiPgogICAgSW1hZ2VtIG7Do28gZGlzcG9uw612ZWwKICA8L3RleHQ+Cjwvc3ZnPg==";

/* =========================
   Leaflet Icon URLs CDN
========================= */
const LEAFLET_ICONS = {
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
};

/* =========================
   Types & Interfaces
========================= */
type Imovel = {
  _id?: string;
  Codigo?: string | number;
  Empreendimento?: string;
  Endereco?: string;
  BairroComercial?: string;
  Cidade?: string;
  Numero?: string | number;
  Latitude?: string | number;
  Longitude?: string | number;
  ValorVenda?: number | string;
  Quartos?: number;
  Suites?: number;
  Vagas?: number;
  AreaPrivativa?: number;
  Foto?: { Foto?: string }[];
};

/* =========================
   Helpers
========================= */
const isValidCoord = (lat: any, lng: any): boolean => {
  const la = parseFloat(lat);
  const ln = parseFloat(lng);
  return (
    Number.isFinite(la) &&
    Number.isFinite(ln) &&
    la !== 0 &&
    ln !== 0 &&
    la >= -90 &&
    la <= 90 &&
    ln >= -180 &&
    ln <= 180
  );
};

const formatCurrency = (value: number | string | undefined): string => {
  if (!value) return "Consulte-nos";
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "Consulte-nos";
  return numValue.toLocaleString("pt-BR", { 
    style: "currency", 
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

/* =========================
   Subcomponentes
========================= */

// Controller: invalida o tamanho quando o container muda
const MapController = ({ observeRef }: { observeRef?: React.RefObject<HTMLDivElement | null> }) => {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => {
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    };
    
    // Aguarda render completo
    const t = setTimeout(invalidate, 300);

    // Listener para resize da janela
    window.addEventListener("resize", invalidate);

    // ResizeObserver para mudanças no container
    let ro: ResizeObserver | null = null;
    if (observeRef?.current && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => invalidate());
      ro.observe(observeRef.current);
    }

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", invalidate);
      ro?.disconnect();
    };
  }, [map, observeRef]);

  return null;
};

// Atualiza centro/zoom
const MapUpdater = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    if (center && Number.isFinite(zoom)) {
      map.setView(center, zoom, { animate: true });
    }
  }, [map, center, zoom]);
  return null;
};

// Ajusta bounds com base nos imóveis
const FitToMarkers = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!points.length) return;
    
    if (points.length === 1) {
      map.setView(points[0], 16, { animate: true });
      return;
    }
    
    const L = (window as any).L;
    if (L?.latLngBounds) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { 
        padding: [50, 50], 
        maxZoom: 15,
        animate: true 
      });
    }
  }, [map, points]);
  
  return null;
};

// Card/Popup Otimizado do Imóvel
const ImovelPopup = ({ imovel }: { imovel: Imovel }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const slug = formatterSlug(imovel.Empreendimento || "");
  const fotoUrl = !imageError && imovel?.Foto?.[0]?.Foto 
    ? imovel.Foto[0].Foto 
    : PLACEHOLDER_IMAGE;
  const href = `/imovel-${imovel.Codigo}/${slug}`;

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Popup 
      className="custom-popup"
      maxWidth={320}
      minWidth={280}
      autoPan={true}
      keepInView={true}
    >
      <div className="p-0 -m-[20px] rounded-lg overflow-hidden">
        {/* Container da Imagem com Skeleton */}
        <div className="relative w-[320px] h-[180px] bg-gray-100">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <Image
            src={fotoUrl}
            alt={imovel.Empreendimento || "Imóvel"}
            width={320}
            height={180}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            priority={false}
            quality={85}
            placeholder="empty"
            unoptimized={fotoUrl === PLACEHOLDER_IMAGE}
          />
          
          {/* Badge de preço sobre a imagem */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <p className="text-white font-bold text-lg drop-shadow-lg">
              {formatCurrency(imovel.ValorVenda)}
            </p>
          </div>
        </div>

        {/* Informações do Imóvel */}
        <div className="p-4 bg-white">
          <h3 className="font-bold text-base text-gray-900 mb-1 line-clamp-1">
            {imovel.Empreendimento || "Imóvel"}
          </h3>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {imovel.Endereco}
            {imovel.Numero ? `, ${imovel.Numero}` : ""}
            {imovel.BairroComercial ? ` - ${imovel.BairroComercial}` : ""}
            {imovel.Cidade ? `, ${imovel.Cidade}` : ""}
          </p>

          {/* Características */}
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
            {imovel.Quartos && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{imovel.Quartos} quartos</span>
              </div>
            )}
            
            {imovel.Vagas && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{imovel.Vagas} vagas</span>
              </div>
            )}
            
            {imovel.AreaPrivativa && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>{imovel.AreaPrivativa} m²</span>
              </div>
            )}
          </div>

          {/* Botão CTA */}
          <Button 
            link={href} 
            text="Ver Detalhes" 
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
          />
        </div>
      </div>
    </Popup>
  );
};

/* =========================
   Componente Principal
========================= */
const MapComponent = ({ filtros }: { filtros: any }) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Centro inicial (São Paulo)
  const initialCenter: [number, number] = [-23.5505, -46.6333];

  // Define zoom baseado nos filtros
  const getZoomLevel = useCallback(() => {
    if (filtros?.bairrosSelecionados?.length) return 15;
    if (filtros?.cidadeSelecionada) return 12;
    return 11;
  }, [filtros]);

  // Busca imóveis
  useEffect(() => {
    const buscarImoveisParaMapa = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filtrosParaMapa = {
          categoria: filtros?.categoriaSelecionada,
          cidade: filtros?.cidadeSelecionada,
          bairros: filtros?.bairrosSelecionados,
          quartos: filtros?.quartos,
          banheiros: filtros?.banheiros,
          vagas: filtros?.vagas,
        };
        
        const response = await getImoveisParaMapa(filtrosParaMapa);
        setImoveis(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        console.error("Erro ao buscar imóveis:", err);
        setError("Não foi possível carregar os imóveis");
      } finally {
        setLoading(false);
      }
    };
    
    buscarImoveisParaMapa();
  }, [filtros]);

  // Filtra pontos válidos
  const validPoints = useMemo<[number, number][]>(() => {
    return imoveis
      .filter((i) => isValidCoord(i.Latitude, i.Longitude))
      .map((i) => [parseFloat(String(i.Latitude)), parseFloat(String(i.Longitude))]);
  }, [imoveis]);

  // Setup Leaflet
  useEffect(() => {
    // CSS do Leaflet
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    // Estilos customizados para o popup
    if (!document.querySelector('#leaflet-custom-styles')) {
      const style = document.createElement("style");
      style.id = 'leaflet-custom-styles';
      style.innerHTML = `
        .custom-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 8px;
          overflow: hidden;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          width: 320px !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
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
        .leaflet-popup-content-wrapper {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        }
        @media (max-width: 768px) {
          .leaflet-marker-icon {
            width: 20px !important;
            height: 30px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Configuração dos ícones
    import("leaflet")
      .then((L) => {
        if (L && (L as any).Icon) {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: LEAFLET_ICONS.iconRetinaUrl,
            iconUrl: LEAFLET_ICONS.iconUrl,
            shadowUrl: LEAFLET_ICONS.shadowUrl,
          });
          (window as any).L = L;
          setMapReady(true);
        }
      })
      .catch((e) => console.error("Erro ao carregar Leaflet:", e));
  }, []);

  if (!mapReady) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300 shadow-lg flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black" />
          <p className="mt-2 text-gray-700">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={wrapRef} 
      className="w-full h-full rounded-lg overflow-hidden border border-gray-300 shadow-lg relative"
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/90 z-[1000] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-black border-t-transparent" />
            <p className="mt-3 text-gray-700 font-medium">Carregando imóveis...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md z-[1000] shadow-lg">
          {error}
        </div>
      )}

      <MapContainer
        center={initialCenter}
        zoom={getZoomLevel()}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        scrollWheelZoom
        doubleClickZoom
        dragging
        attributionControl
        className="w-full h-full"
      >
        <MapController observeRef={wrapRef} />

        {validPoints.length > 0 ? (
          <FitToMarkers points={validPoints} />
        ) : (
          <MapUpdater center={initialCenter} zoom={getZoomLevel()} />
        )}

        <ZoomControl position="bottomright" />

        {/* Markers com coordenadas válidas */}
        {imoveis.map((imovel) => {
          const lat = imovel.Latitude;
          const lng = imovel.Longitude;
          
          if (!isValidCoord(lat, lng)) return null;
          
          const position: [number, number] = [
            parseFloat(String(lat)), 
            parseFloat(String(lng))
          ];
          
          const key = String(
            imovel._id ?? 
            imovel.Codigo ?? 
            `${position[0]}-${position[1]}`
          );
          
          return (
            <Marker key={key} position={position}>
              <ImovelPopup imovel={imovel} />
            </Marker>
          );
        })}

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />
      </MapContainer>

      {/* Contador de Imóveis */}
      {!loading && !error && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-full z-[500] shadow-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm">
              <span className="font-bold text-gray-900">{imoveis.length}</span>
              <span className="text-gray-600"> imóveis encontrados</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Export com lazy loading para melhor performance
export default dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300 shadow-lg flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black" />
        <p className="mt-2 text-gray-700">Carregando mapa...</p>
      </div>
    </div>
  )
});
