"use client";

import { useEffect, useState, useRef } from "react";

const MapMobile = ({ filtros, isVisible, setIsVisible }) => {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Função para obter URL da foto
  const getFotoUrl = (imovel) => {
    if (imovel._fotoDestaqueProcessada) {
      return imovel._fotoDestaqueProcessada;
    }

    if (imovel.Foto && Array.isArray(imovel.Foto) && imovel.Foto.length > 0) {
      const fotoDestaque = imovel.Foto.find(f => f?.Destaque === "Sim" && f?.Foto);
      if (fotoDestaque?.Foto) return fotoDestaque.Foto;

      const primeiraFoto = imovel.Foto.find(f => f?.Foto);
      if (primeiraFoto?.Foto) return primeiraFoto.Foto;

      const fotoPequena = imovel.Foto.find(f => f?.FotoPequena);
      if (fotoPequena?.FotoPequena) return fotoPequena.FotoPequena;
    }

    if (imovel.FotoDestaque) return imovel.FotoDestaque;
    if (imovel.FotoPrincipal) return imovel.FotoPrincipal;
    if (imovel.imagemDestaque) return imovel.imagemDestaque;

    return null;
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !isVisible) return;

    let isMounted = true;

    const loadMap = async () => {
      try {
        console.log('[MapMobile] Iniciando carregamento do mapa...');
        
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        const L = (await import('leaflet')).default;

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

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
            const isValid = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 &&
                          lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
            return isValid;
          });

          console.log(`[MapMobile] Total: ${data.data.length}, Válidos: ${validProperties.length}`);

          if (mapRef.current && !mapInstanceRef.current) {
            const map = L.map(mapRef.current).setView([-23.6050, -46.6950], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 18
            }).addTo(map);

            mapInstanceRef.current = map;
            setMapReady(true);
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
              
              const fotoUrl = getFotoUrl(imovel);
              
              const valor = imovel.ValorVenda 
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

              const slug = (imovel.Empreendimento || "")
                .toString()
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
              
              const popupContent = `
                <div style="width: 240px; font-family: system-ui, -apple-system, sans-serif;">
                  ${fotoUrl ? `
                    <div style="
                      width: 100%;
                      height: 130px;
                      margin: -10px -10px 10px -10px;
                      overflow: hidden;
                      border-radius: 8px 8px 0 0;
                    ">
                      <img 
                        src="${fotoUrl}" 
                        alt="${imovel.Empreendimento || 'Imóvel'}"
                        style="
                          width: 100%;
                          height: 100%;
                          object-fit: cover;
                        "
                        onerror="this.style.display='none'; this.parentElement.style.display='none';"
                      />
                    </div>
                  ` : `
                    <div style="
                      width: 100%;
                      height: 80px;
                      margin: -10px -10px 10px -10px;
                      background: #f3f4f6;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      border-radius: 8px 8px 0 0;
                    ">
                      <svg width="40" height="40" fill="#9ca3af" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                    </div>
                  `}
                  
                  <div style="padding: 0;">
                    <h3 style="
                      margin: 0 0 6px 0;
                      font-size: 14px;
                      font-weight: 600;
                      color: #111827;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    ">
                      ${imovel.Empreendimento || 'Imóvel ' + imovel.Codigo}
                    </h3>
                    
                    <p style="
                      margin: 0 0 6px 0;
                      font-size: 12px;
                      color: #6b7280;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    ">
                      ${imovel.BairroComercial || imovel.Bairro || imovel.Endereco || 'Localização'}
                    </p>
                    
                    ${infos.length > 0 ? `
                      <p style="
                        margin: 0 0 8px 0;
                        font-size: 11px;
                        color: #9ca3af;
                      ">
                        ${infos.join(' • ')}
                      </p>
                    ` : ''}
                    
                    <p style="
                      margin: 0 0 10px 0;
                      font-size: 16px;
                      font-weight: 700;
                      color: #059669;
                    ">
                      ${valor}
                    </p>
                    
                    <a 
                      href="/imovel/${imovel.Codigo}/${slug}" 
                      target="_blank"
                      style="
                        display: block;
                        width: 100%;
                        padding: 8px;
                        background: #000;
                        color: white;
                        text-align: center;
                        text-decoration: none;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 600;
                      "
                      onmouseover="this.style.background='#374151'"
                      onmouseout="this.style.background='#000'"
                    >
                      Ver Detalhes
                    </a>
                  </div>
                </div>
              `;
              
              marker.bindPopup(popupContent, {
                maxWidth: 260,
                minWidth: 240,
                className: 'custom-popup'
              });
              
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
        console.error('[MapMobile] Erro:', error);
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
  }, [filtros, isVisible]);

  // Se não está visível, não renderiza nada
  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[9998] md:hidden"
        onClick={() => setIsVisible(false)}
        aria-hidden="true"
      />

      {/* Container do Mapa */}
      <div
        className={`fixed inset-0 z-[9999] md:hidden transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header com botão fechar */}
        <div className="absolute top-0 left-0 right-0 bg-white z-[10000] p-4 border-b shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-base">Mapa dos Imóveis</h2>
            <button
              onClick={() => setIsVisible(false)}
              className="flex items-center justify-center bg-zinc-200 font-bold text-xs py-2 px-4 rounded-md hover:bg-gray-100"
            >
              Fechar Mapa
            </button>
          </div>
        </div>

        {/* Mapa */}
        <div className="absolute inset-0 pt-[60px]">
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
      </div>
    </>
  );
};

export default MapMobile;
