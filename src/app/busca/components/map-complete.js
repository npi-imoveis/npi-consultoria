"use client";

import { useEffect, useRef, useState } from "react";

const MapComplete = ({ filtros }: { filtros: any }) => {
  const [imoveis, setImoveis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let isMounted = true;

    const loadMap = async () => {
      try {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }
        await new Promise((r) => setTimeout(r, 300));

        const L = (await import("leaflet")).default;
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const params = new URLSearchParams();
        if (filtros?.categoriaSelecionada) params.append("categoria", filtros.categoriaSelecionada);
        if (filtros?.cidadeSelecionada) params.append("cidade", filtros.cidadeSelecionada);
        if (filtros?.bairrosSelecionados?.length) {
          filtros.bairrosSelecionados.forEach((b: string) => params.append("bairros", b));
        }

        const url = `/api/imoveis/mapa?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!isMounted) return;

        if (Array.isArray(data?.data)) {
          setImoveis(data.data);

          if (mapRef.current && !mapInstanceRef.current) {
            const map = L.map(mapRef.current).setView([-23.605, -46.695], 13);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: "© OpenStreetMap contributors",
              maxZoom: 18,
            }).addTo(map);
            mapInstanceRef.current = map;
          }

          if (mapInstanceRef.current) {
            markersRef.current.forEach((m) => mapInstanceRef.current.removeLayer(m));
            markersRef.current = [];

            const valid = data.data.filter((i: any) => {
              const lat = parseFloat(i.Latitude);
              const lng = parseFloat(i.Longitude);
              return (
                !Number.isNaN(lat) &&
                !Number.isNaN(lng) &&
                lat !== 0 &&
                lng !== 0 &&
                lat >= -90 &&
                lat <= 90 &&
                lng >= -180 &&
                lng <= 180
              );
            });

            const bounds: [number, number][] = [];
            valid.forEach((imovel: any, idx: number) => {
              const lat = parseFloat(imovel.Latitude);
              const lng = parseFloat(imovel.Longitude);
              const marker = (window as any).L.marker([lat, lng]).addTo(mapInstanceRef.current);
              const html = `
                <div style="padding:8px;min-width:200px;">
                  <strong>${idx + 1}. ${imovel.Empreendimento || "Imóvel"}</strong><br/>
                  <small>${imovel.Endereco || ""}</small><br/>
                  <small>${imovel.BairroComercial || ""}</small>
                  ${
                    imovel.ValorVenda
                      ? `<br/><strong style="color:green;">
                        ${Number(imovel.ValorVenda).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
                      </strong>`
                      : ""
                  }
                </div>`;
              marker.bindPopup(html);
              markersRef.current.push(marker);
              bounds.push([lat, lng]);
            });

            if (bounds.length) {
              mapInstanceRef.current.fitBounds((window as any).L.latLngBounds(bounds), {
                padding: [50, 50],
                maxZoom: 15,
              });
            }
          }
        }
      } catch (e) {
        console.error("[MapComplete] Erro:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const t = setTimeout(loadMap, 80);
    return () => {
      isMounted = false;
      clearTimeout(t);
    };
  }, [filtros]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300 shadow-lg relative">
      {loading && (
        <div className="absolute inset-0 bg-white z-50 grid place-items-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-700">Carregando mapa...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "500px" }} />
      {!loading && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg z-[55]">
          <div className="text-sm">
            <span className="font-bold text-lg">{imoveis.length}</span> imóveis encontrados
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComplete;
