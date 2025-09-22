"use client";

import { useEffect, useRef, useState } from "react";

const MapComplete = ({ filtros }) => {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const loadMap = async () => {
      try {
        console.log('[MapComplete] Iniciando carregamento do mapa...');
        
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link );
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        const L = (await import('leaflet')).default;

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        } );

        if (!isMounted) return;

        const params = new URLSearchParams();
        
        if (filtros?.categoriaSelecionada) {
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
          filtros.bairrosSelecionados.forEach(bairro => {
            params.append('bairros', bairro);
          });
        }

        const url = `/api/imoveis/mapa?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!isMounted) return;

        if (data.data && Array.isArray(data.data)) {
          setImoveis(data.data);

          const validProperties = data.data.filter(imovel => {
            const lat = parseFloat(imovel.Latitude);
            const lng = parseFloat(imovel.Longitude);
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 &&
                   lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
          });

          if (mapRef.current && !mapInstanceRef.current) {
            const map = L.map(mapRef.current).setView([-23.6050, -46.6950], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 18
            } ).addTo(map);

            mapInstanceRef.current = map;
          }

          if (mapInstanceRef.current) {
            markersRef.current.forEach(marker => {
              mapInstanceRef.current.removeLayer(marker);
            });
            markersRef.current = [];

            const bounds = [];
            validProperties.forEach((imovel) => {
              const lat = parseFloat(imovel.Latitude);
              const lng = parseFloat(imovel.Longitude);

              const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current);
              
              // --- INÍCIO DA MODIFICAÇÃO ---
              // 1. Obter a URL da foto de destaque
              // Baseado na estrutura do seu outro componente, assumindo imovel.Foto[0].Foto
              // Adicionado fallback para uma imagem placeholder caso não haja foto.
              const fotoDestaqueUrl = imovel.Foto && imovel.Foto.length > 0 && imovel.Foto[0].Foto
                ? imovel.Foto[0].Foto
                : '/placeholder-imovel.jpg'; // Crie ou use um placeholder em sua pasta /public

              // 2. Criar o conteúdo HTML do popup com a imagem
              const popupContent = `
                <div style="font-family: sans-serif; min-width: 220px; line-height: 1.5;">
                  <img 
                    src="${fotoDestaqueUrl}" 
                    alt="Destaque do imóvel ${imovel.Empreendimento || 'sem nome'}" 
                    style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
                    loading="lazy"
                  />
                  <strong style="font-size: 14px;">${imovel.Empreendimento || 'Imóvel'}</strong>  

                  <small style="color: #555;">${imovel.BairroComercial || ''}</small>
                  ${imovel.ValorVenda ? `  
<strong style="color: #008000; font-size: 15px;">
                    ${Number(imovel.ValorVenda).toLocaleString("pt-BR", { 
                      style: "currency", 
                      currency: "BRL" 
                    })}
                  </strong>` : ''}
                </div>
              `;
              // --- FIM DA MODIFICAÇÃO ---
              
              marker.bindPopup(popupContent);
              markersRef.current.push(marker);
              bounds.push([lat, lng]);
            });

            if (bounds.length > 0) {
              const latLngBounds = L.latLngBounds(bounds);
              mapInstanceRef.current.fitBounds(latLngBounds, { 
                padding: [50, 50],
                maxZoom: 15
              });
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

    const timer = setTimeout(loadMap, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
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
