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
    // Only run on client
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const loadMap = async () => {
      try {
        console.log('[MapComplete] Iniciando carregamento do mapa...');
        
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Wait for CSS to load
        await new Promise(resolve => setTimeout(resolve, 500));

        // Dynamically import Leaflet
        const L = (await import('leaflet')).default;

        // Configure icon paths
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (!isMounted) return;

        // Build API query params
        const params = new URLSearchParams();
        
        // Use the exact same parameters as the search
        if (filtros?.categoriaSelecionada) {
          // Convert to API format
          let categoria = filtros.categoriaSelecionada;
          if (categoria === 'Casa em Condominio') {
            categoria = 'Casa em Condominio';
          }
          params.append('categoria', categoria);
        }
        
        if (filtros?.cidadeSelecionada) {
          params.append('cidade', filtros.cidadeSelecionada);
        }
        
        if (filtros?.bairrosSelecionados?.length > 0) {
          params.append('bairros', filtros.bairrosSelecionados.join(','));
        }

        const url = `/api/imoveis/mapa?${params.toString()}`;
        console.log('[MapComplete] Fetching from:', url);

        const response = await fetch(url);
        const data = await response.json();

        if (!isMounted) return;

        if (data.data && Array.isArray(data.data)) {
          setImoveis(data.data);

          // Filter ALL properties with valid coordinates
          const validProperties = data.data.filter(imovel => {
            const lat = parseFloat(imovel.Latitude);
            const lng = parseFloat(imovel.Longitude);
            const isValid = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 &&
                          lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
            
            if (!isValid) {
              console.log(`[MapComplete] Imóvel sem coordenadas válidas:`, imovel.Empreendimento, `Lat: ${imovel.Latitude}, Lng: ${imovel.Longitude}`);
            }
            
            return isValid;
          });

          console.log(`[MapComplete] Total: ${data.data.length}, Válidos: ${validProperties.length}`);
          console.log('[MapComplete] Imóveis válidos:', validProperties.map(i => ({
            nome: i.Empreendimento,
            lat: i.Latitude,
            lng: i.Longitude
          })));

          // Initialize map only once
          if (mapRef.current && !mapInstanceRef.current) {
            const map = L.map(mapRef.current).setView([-23.6050, -46.6950], 13); // Brooklin coordinates
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 18
            }).addTo(map);

            mapInstanceRef.current = map;
            setMapReady(true);
          }

          if (mapInstanceRef.current) {
            // Clear ALL existing markers
            markersRef.current.forEach(marker => {
              mapInstanceRef.current.removeLayer(marker);
            });
            markersRef.current = [];

            // Add ALL valid properties as markers
            const bounds = [];
            validProperties.forEach((imovel, index) => {
              const lat = parseFloat(imovel.Latitude);
              const lng = parseFloat(imovel.Longitude);

              const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current);
              
              const popupContent = `
                <div style="padding: 8px; min-width: 200px;">
                  <strong>${index + 1}. ${imovel.Empreendimento || 'Imóvel'}</strong><br/>
                  <small>${imovel.Endereco || ''}</small><br/>
                  <small>${imovel.BairroComercial || ''}</small>
                  ${imovel.ValorVenda ? `<br/><strong style="color: green;">
                    ${Number(imovel.ValorVenda).toLocaleString("pt-BR", { 
                      style: "currency", 
                      currency: "BRL" 
                    })}
                  </strong>` : ''}
                  <br/><small style="color: #666;">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</small>
                </div>
              `;
              
              marker.bindPopup(popupContent);
              markersRef.current.push(marker);
              bounds.push([lat, lng]);
            });

            // Fit map to show ALL markers
            if (bounds.length > 0) {
              const latLngBounds = L.latLngBounds(bounds);
              mapInstanceRef.current.fitBounds(latLngBounds, { 
                padding: [50, 50],
                maxZoom: 15
              });
              
              console.log(`[MapComplete] Mapa ajustado para mostrar ${markersRef.current.length} marcadores`);
            }
          }
        }
      } catch (error) {
        console.error('[MapComplete] Erro:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(loadMap, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      // Don't remove map on cleanup to avoid re-initialization issues
    };
  }, [filtros]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300 shadow-lg relative">
      {loading && (
        <div className="absolute inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-700">Carregando mapa...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
      
      {!loading && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg z-[1000]">
          <div className="text-sm">
            <span className="font-bold text-lg">{imoveis.length}</span> imóveis encontrados
          </div>
          {markersRef.current.length > 0 && (
            <div className="text-xs text-green-600">
              <span className="font-bold">{markersRef.current.length}</span> pontos no mapa
            </div>
          )}
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