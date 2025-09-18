"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, Marker, Popup } from "react-leaflet";
import Image from "next/image";

import { getImoveisParaMapa } from "@/app/services";
import { Button } from "@/app/components/ui/button";
import { formatterSlug } from "@/app/utils/formatter-slug";

/* =========================
   Helpers
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
  Foto?: { Foto?: string }[];
};

const isValidCoord = (lat: any, lng: any) => {
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

/* =========================
   Subcomponentes
========================= */

// Controller: invalida o tamanho quando o container muda (ResizeObserver) e em resize da janela
const MapController = ({ observeRef }: { observeRef?: React.RefObject<HTMLDivElement | null> }) => {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    // pequena espera para garantir render
    const t = setTimeout(invalidate, 200);

    window.addEventListener("resize", invalidate);

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

// Atualiza centro/zoom manualmente
const MapUpdater = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    if (center && Number.isFinite(zoom)) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
};

// Ajusta bounds com base nos imóveis válidos
const FitToMarkers = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 16);
      return;
    }
    const L = (window as any).L;
    if (L?.latLngBounds) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, points]);
  return null;
};

// Popup de imóvel
const ImovelPopup = ({ imovel }: { imovel: Imovel }) => {
  const slug = formatterSlug(imovel.Empreendimento || "");
  const fotoUrl = imovel?.Foto?.[0]?.Foto || "/placeholder-imovel.jpg";
  const href = `imovel-${imovel.Codigo}/${slug}`;

  return (
    <Popup>
      <div className="p-2">
        <Image
          src={fotoUrl}
          alt={imovel.Empreendimento || "Imóvel"}
          width={300}
          height={150}
          className="rounded-lg w-[300px] h-[150px] object-cover"
        />
        <h1 className="font-bold text-sm mt-4">{imovel.Empreendimento}</h1>
        <p className="text-xs">
          {imovel.Endereco}
          {imovel.Numero ? `, ${imovel.Numero}` : ""} {imovel.BairroComercial ? `- ${imovel.BairroComercial}` : ""}
          {imovel.Cidade ? `, ${imovel.Cidade}` : ""}
        </p>
        <p className="text-sm font-bold mt-1">
          {imovel.ValorVenda
            ? Number(imovel.ValorVenda).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            : "Consulte"}
        </p>
        <div className="mt-2">
          <Button link={href} text="Saiba mais" className="text-white" />
        </div>
      </div>
    </Popup>
  );
};

/* =========================
   Componente principal
========================= */
const MapComponent = ({ filtros }: { filtros: any }) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // centro/zoom iniciais (SP)
  const initialCenter: [number, number] = [-23.5505, -46.6333];

  // Decide zoom padrão quando não usamos bounds
  const getZoomLevel = () => {
    if (filtros?.bairrosSelecionados?.length) return 15;
    if (filtros?.cidadeSelecionada) return 12;
    return 11;
  };

  // Busca dados (sempre que filtros mudam)
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
        console.error("Erro ao buscar imóveis para o mapa:", err);
        setError("Não foi possível carregar os imóveis para o mapa");
      } finally {
        setLoading(false);
      }
    };
    buscarImoveisParaMapa();
  }, [filtros]);

  // Filtra imóveis com coordenadas válidas
  const validPoints = useMemo<[number, number][]>(() => {
    return imoveis
      .filter((i) => isValidCoord(i.Latitude, i.Longitude))
      .map((i) => [parseFloat(String(i.Latitude)), parseFloat(String(i.Longitude))]);
  }, [imoveis]);

  // Fix de ícones + CSS do Leaflet no Next
  useEffect(() => {
    // CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    // Ícones
    import("leaflet")
      .then((L) => {
        if (L && (L as any).Icon) {
          // @ts-ignore
          delete L.Icon.Default.prototype._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "/leaflet/marker-icon-2x.png",
            iconUrl: "/leaflet/marker-icon.png",
            shadowUrl: "/leaflet/marker-shadow.png",
          });
          // Exponho L para subcomponentes (fitBounds)
          (window as any).L = L;
        }
      })
      .catch((e) => console.error("Erro ao carregar Leaflet:", e));
  }, []);

  return (
    <div ref={wrapRef} className="w-full h-full rounded-lg overflow-hidden border border-gray-300 shadow-lg relative">
      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 z-20 grid place-items-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black" />
            <p className="mt-2 text-gray-700">Carregando imóveis...</p>
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-md z-20">
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
        {/* Observa tamanho do wrapper (abre/fecha filtros, breakpoints, etc.) */}
        <MapController observeRef={wrapRef} />

        {/* Fit inteligente: se houver pontos válidos, usamos bounds; caso contrário, cai no zoom default */}
        {validPoints.length > 0 ? (
          <FitToMarkers points={validPoints} />
        ) : (
          <MapUpdater center={initialCenter} zoom={getZoomLevel()} />
        )}

        <ZoomControl position="bottomright" />

        {/* Markers somente com coordenadas válidas */}
        {imoveis.map((imovel) => {
          const lat = imovel.Latitude;
          const lng = imovel.Longitude;
          if (!isValidCoord(lat, lng)) return null;
          const position: [number, number] = [parseFloat(String(lat)), parseFloat(String(lng))];
          const key = String(imovel._id ?? imovel.Codigo ?? `${position[0]}-${position[1]}`);
          return (
            <Marker key={key} position={position}>
              <ImovelPopup imovel={imovel} />
            </Marker>
          );
        })}

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
      </MapContainer>

      {/* Contador */}
      {!loading && !error && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full z-10 text-xs shadow">
          <span className="font-bold">{imoveis.length}</span> imóveis encontrados
        </div>
      )}
    </div>
  );
};

export default MapComponent;
