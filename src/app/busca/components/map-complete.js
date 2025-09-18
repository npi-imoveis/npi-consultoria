"use client";

import { useEffect, useRef, useState } from "react";

const MapComplete = ({ filtros }) => {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Only client-side
    if (typeof window === "undefined") return;

    let isMounted = true;

    const loadMap = async () => {
      try {
        // Carrega CSS do Leaflet uma única vez
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        // Aguarda um pequeno tempo para o CSS estar aplicável
        await new Promise((r) => setTimeout(r, 300));

        const L = (await import("leaflet")).default;

        // Corrige paths de ícones
        try {
          delete L.Icon.Default.prototype._getIconUrl;
        } catch {}
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        if (!isMounted) return;

        // Monta query com os mesmos parâmetros dos filtros
        const params = new URLSearchParams();

        if (filtros?.categoriaSelecionada) {
          let categoria = filtros.categoriaSelecionada;
          // ajuste de nomenclatura se precisar (mantive seu exemplo)
          if (categoria === "Casa em Condominio") {
            categoria = "Casa em Condominio";
          }
          params.append("categoria", categoria);
        }

        if (filtros?.cidadeSelecionada) {
          params.append("cidade", filtros.cidadeSelecionada);
        }

        if (Array.isArray(filtros?.bairrosSelecionados) && filtros.bairrosSelecionados.length > 0) {
          filtros.bairrosSelecionados.forEach((b) => params.append("bairros", b));
        }

        const url = `/api/imoveis/mapa?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!isMounted) return;

        const lista = Array.isArray(data?.data) ? data.data : [];
        setImoveis(lista);

        // Filtra apenas imóveis com coordenadas válidas
        const validos = lista.filter((imovel) => {
          const lat = parseFloat(imovel.Latitude);
          const lng = parseFloat(imovel.Longitude);
          return (
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat !== 0 &&
            lng !== 0 &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180
          );
        });

        // Inicializa o mapa apenas uma vez
        if (mapRef.current && !mapInstanceRef.current) {
          const map = L.map(mapRef.current).setView([-23.605, -46.695], 13); // Brooklin como base
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 18,
          }).addTo(map);
          mapInstanceRef.current = map;
          setMapReady(true);
        }

        if (mapInstanceRef.current) {
          // Remove markers antigos
          markersRef.current.forEach((m) => mapInstanceRef.current.removeLayer(m));
          markersRef.current = [];

          const bounds = [];
          validos.forEach((imovel, idx) => {
            const lat = parseFloat(imovel.Latitude);
            const lng = parseFloat(imovel.Longitude);

            const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current);

            const valVenda =
              imovel.ValorVenda != null
                ? Number(imovel.ValorVenda).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : null;

            const popupContent = `
              <div style="padding:8px;min-width:200px;">
                <strong>${idx + 1}. ${imovel.Empreendimento || "Imóvel"}</strong><br/>
                <small>${imovel.Endereco || ""}</small><br/>
                <small>${imovel.BairroComercial || ""}</small>
                ${valVenda ? `<br/><strong style="color:green;">${valVenda}</strong>` : ""}
                <br/><small style="color:#666;">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</small>
              </div>
            `;
            marker.bindPopup(popupContent);

            markersRef.current.push(marker);
            bounds.push([lat, lng]);
          });

          if (bounds.length > 0) {
            const latLngBounds = L.latLngBounds(bounds);
            mapInstanceRef.current.fitBounds(latLngBounds, {
              padding: [50, 50],
              maxZoom: 15,
            });
          }
        }
      } catch (error) {
        console.error("[MapComplete] Erro:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const t = setTimeout(loadMap, 100);

    return () => {
      isMounted = false;
      clearTimeout(t);
      // não destruímos o mapa pra evitar re-init no mesmo ciclo
    };
  }, [filtros]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300 shadow-lg relative">
      {loading && (
        <div className="absolute inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black" />
            <p className="mt-2 text-gray-700">Carregando mapa...</p>
          </div>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "500px" }} />

      {!loading && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg z-[1000]">
          <div className="text-sm">
            <span className="font-bold text-lg">{imoveis.length}</span> imóveis encontrados
          </div>
          {markersRef.current.length < imoveis.length && (
            <div className="text-xs text-orange-600">
              {imoveis.length - markersRef.current.length} sem coordenadas
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapComplete;
