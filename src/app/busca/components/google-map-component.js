// src/app/busca/components/google-map-component.js
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import Image from 'next/image';

// API Key do Google Maps (usando a do projeto de referência)
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Componente do Popup customizado para imóveis
const ImovelPopup = ({ imovel, onClose }) => {
  const formatterSlug = (text) => {
    if (!text) return "";
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const slug = formatterSlug(imovel.Empreendimento || "");

  const getFotoDestaqueUrl = (imovel) => {
    // Verificar se existe o campo Foto e se é um array
    if (!imovel.Foto || !Array.isArray(imovel.Foto) || imovel.Foto.length === 0) {
      // Tentar campos alternativos
      if (imovel.FotoDestaque) return imovel.FotoDestaque;
      if (imovel.imagemDestaque) return imovel.imagemDestaque;
      if (imovel.FotoPrincipal) return imovel.FotoPrincipal;
      
      return 'https://via.placeholder.com/300x200/E5E7EB/6B7280?text=Sem+foto';
    }
    
    // Procurar foto com Destaque = "Sim"
    const fotoDestaque = imovel.Foto.find(foto => 
      foto && foto.Destaque === "Sim" && foto.Foto
    );

    if (fotoDestaque && fotoDestaque.Foto) {
      return fotoDestaque.Foto;
    }

    // Fallback: primeira foto com campo Foto preenchido
    const primeiraFoto = imovel.Foto.find(foto => 
      foto && foto.Foto && typeof foto.Foto === 'string' && foto.Foto.trim() !== ''
    );
    
    if (primeiraFoto && primeiraFoto.Foto) {
      return primeiraFoto.Foto;
    }

    return 'https://via.placeholder.com/300x200/E5E7EB/6B7280?text=Sem+foto';
  };

  const fotoUrl = getFotoDestaqueUrl(imovel);
  
  // Formatar valor
  const valorPrincipal = imovel.ValorVenda 
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

  // Monta informações extras
  const getInfoExtra = () => {
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
    return infos.join(' • ');
  };

  const infoExtra = getInfoExtra();

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-[300px] min-w-[280px] relative">
      {/* Botão fechar */}
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-800 text-sm z-10"
      >
        ×
      </button>
      
      {/* Imagem do imóvel */}
      <div className="relative w-full h-[160px] rounded-lg overflow-hidden mb-3 bg-gray-200">
        <Image 
          src={fotoUrl} 
          alt={`Imóvel ${imovel.Empreendimento || imovel.Codigo}`} 
          fill
          style={{ objectFit: 'cover' }}
          sizes="300px"
          priority={false}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement.innerHTML = `
              <div style="
                width: 100%; 
                height: 100%; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                background: #f3f4f6;
                color: #6b7280;
                font-size: 14px;
              ">
                <div style="text-align: center;">
                  <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                  <div>Sem foto</div>
                </div>
              </div>
            `;
          }}
        />
      </div>
      
      {/* Título */}
      <h3 className="font-bold text-base truncate mb-1" title={imovel.Empreendimento}>
        {imovel.Empreendimento || `Imóvel ${imovel.Codigo}`}
      </h3>
      
      {/* Localização */}
      <p className="text-sm text-gray-600 truncate mb-2" title={imovel.BairroComercial || imovel.Bairro || imovel.Endereco}>
        {imovel.BairroComercial || imovel.Bairro || imovel.Endereco || "Localização"}
      </p>
      
      {/* Info extra (área, dormitórios, vagas) */}
      {infoExtra && (
        <p className="text-sm text-gray-500 mb-3">
          {infoExtra}
        </p>
      )}
      
      {/* Valor */}
      <p className="text-lg font-bold text-green-700 mb-3">
        {valorPrincipal}
      </p>
      
      {/* Botão Ver Detalhes */}
      <a 
        href={`/imovel/${imovel.Codigo}/${slug}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="!no-underline block"
      >
        <button className="w-full px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
          Ver Detalhes
        </button>
      </a>
    </div>
  );
};

const Map = ({ 
  center = { lat: -23.5505, lng: -46.6333 }, // Centro em São Paulo
  zoom = 11,
  imoveis = [],
  onPropertyClick,
  onClusterClick,
  onClearSelection,
  selectedCluster,
  selectedProperty,
  className 
}) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const clusterMarkersRef = useRef([]);
  const [popupInfo, setPopupInfo] = useState(null);
  const infoWindowRef = useRef(null);

  // Função para calcular distância entre dois pontos
  const getDistance = (pos1, pos2) => {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = pos1.lat * Math.PI/180;
    const φ2 = pos2.lat * Math.PI/180;
    const Δφ = (pos2.lat-pos1.lat) * Math.PI/180;
    const Δλ = (pos2.lng-pos1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distância em metros
  };

  // Função para agrupar marcadores próximos
  const clusterMarkers = useCallback((markers, zoom) => {
    const clusters = [];
    const processed = new Set();
    const clusterDistance = zoom >= 15 ? 0 : zoom >= 13 ? 80 : zoom >= 11 ? 150 : 300; // metros

    markers.forEach((marker, index) => {
      if (processed.has(index)) return;

      const cluster = {
        position: marker.getPosition(),
        markers: [marker],
        properties: [marker.property]
      };

      if (clusterDistance > 0) {
        markers.forEach((otherMarker, otherIndex) => {
          if (processed.has(otherIndex) || index === otherIndex) return;

          const distance = getDistance(
            { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() },
            { lat: otherMarker.getPosition().lat(), lng: otherMarker.getPosition().lng() }
          );

          if (distance < clusterDistance) {
            cluster.markers.push(otherMarker);
            cluster.properties.push(otherMarker.property);
            processed.add(otherIndex);
          }
        });
      }

      processed.add(index);
      clusters.push(cluster);
    });

    return clusters;
  }, []);

  // Função para criar marcador de cluster
  const createClusterMarker = useCallback((cluster) => {
    const count = cluster.markers.length;
    if (count <= 1) return null;

    const color = count > 10 ? '#8B6F4B' : count > 5 ? '#8B6F4B' : '#8B6F4B';
    
    const clusterMarker = new window.google.maps.Marker({
      position: cluster.position,
      map: googleMapRef.current,
      icon: {
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="${color}" stroke="#ffffff" stroke-width="3"/>
            <text x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold">
              ${count}
            </text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      },
      zIndex: 1000 + count
    });

    clusterMarker.addListener('click', () => {
      console.log("🔍 Cluster clicado com", cluster.properties.length, "propriedades:");
      console.log("Propriedades do cluster:", cluster.properties.map(p => ({
        Codigo: p.Codigo,
        _id: p._id,
        Empreendimento: p.Empreendimento
      })));
      
      onClusterClick?.(cluster.properties);
      
      // Limpar popup quando cluster é clicado
      setPopupInfo(null);
      
      // Fazer zoom para o cluster
      const bounds = new window.google.maps.LatLngBounds();
      cluster.markers.forEach(marker => bounds.extend(marker.getPosition()));
      googleMapRef.current.fitBounds(bounds);
    });

    return clusterMarker;
  }, [onClusterClick]);

  // Função para atualizar clusters baseado no zoom
  const updateClusters = useCallback(() => {
    if (!googleMapRef.current || !markersRef.current.length) return;

    const zoom = googleMapRef.current.getZoom();

    // Limpar clusters anteriores
    clusterMarkersRef.current.forEach(marker => marker.setMap(null));
    clusterMarkersRef.current = [];

    // Em zoom alto, mostrar todos os marcadores individuais
    if (zoom >= 15) {
      markersRef.current.forEach(marker => {
        marker.setVisible(true);
        marker.setMap(googleMapRef.current);
      });
      return;
    }

    // Em zoom baixo/médio, fazer clustering
    const clusters = clusterMarkers(markersRef.current, zoom);

    clusters.forEach(cluster => {
      if (cluster.markers.length > 1) {
        // Esconder marcadores individuais do cluster
        cluster.markers.forEach(marker => {
          marker.setVisible(false);
        });
        
        // Criar marcador de cluster
        const clusterMarker = createClusterMarker(cluster);
        if (clusterMarker) {
          clusterMarkersRef.current.push(clusterMarker);
        }
      } else {
        // Mostrar marcador individual
        cluster.markers[0].setVisible(true);
        cluster.markers[0].setMap(googleMapRef.current);
      }
    });
  }, [clusterMarkers, createClusterMarker]);

  const createMarker = useCallback((imovel) => {
    if (!googleMapRef.current || !imovel.Latitude || !imovel.Longitude) return null;

    const lat = parseFloat(imovel.Latitude);
    const lng = parseFloat(imovel.Longitude);
    
    if (isNaN(lat) || isNaN(lng)) return null;

    const valor = imovel.ValorVenda || imovel.ValorLocacao || 0;
    const precoTexto = valor >= 1000000 
      ? (valor / 1000000).toFixed(1) + 'M' 
      : valor >= 1000 
        ? (valor / 1000).toFixed(0) + 'k'
        : valor.toString();

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: googleMapRef.current,
      title: imovel.Empreendimento || imovel.Codigo,
      icon: {
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="#8B6F4B" stroke="#ffffff" stroke-width="3"/>
            <text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold">
              ${precoTexto}
            </text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 16)
      }
    });

    // Armazenar a propriedade no marcador
    marker.property = imovel;

    marker.addListener('click', () => {
      console.log("📍 Marcador individual clicado:", {
        Codigo: imovel.Codigo,
        _id: imovel._id,
        Empreendimento: imovel.Empreendimento
      });
      
      onPropertyClick?.(imovel);
      
      // Mostrar popup customizado apenas para marcadores individuais
      setPopupInfo({
        imovel,
        position: { lat, lng }
      });
    });

    return marker;
  }, [onPropertyClick]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_BOTTOM
      }
    });

    // Criar marcadores após o mapa estar pronto
    markersRef.current = imoveis.map(createMarker).filter(Boolean);

    googleMapRef.current.addListener('click', () => {
      setPopupInfo(null);
      onClearSelection?.();
    });

    // Adicionar listeners para zoom para atualizar clusters
    googleMapRef.current.addListener('zoom_changed', updateClusters);
    googleMapRef.current.addListener('bounds_changed', updateClusters);

    // Inicializar clusters após um pequeno delay
    setTimeout(() => {
      updateClusters();
    }, 200);

    // Ajustar bounds se há imóveis
    if (imoveis.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      imoveis.forEach(imovel => {
        if (imovel.Latitude && imovel.Longitude) {
          const lat = parseFloat(imovel.Latitude);
          const lng = parseFloat(imovel.Longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            bounds.extend({ lat, lng });
          }
        }
      });
      
      if (!bounds.isEmpty()) {
        googleMapRef.current.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [center, zoom, imoveis, createMarker, updateClusters, onClearSelection]);

  useEffect(() => {
    if (window.google) {
      initializeMap();
    }
  }, [initializeMap]);

  // Cleanup
  useEffect(() => {
    return () => {
      // Limpar clusters
      clusterMarkersRef.current.forEach(marker => marker.setMap(null));
      clusterMarkersRef.current = [];
      
      // Limpar marcadores
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  // Atualizar centro do mapa quando selectedCluster mudar
  useEffect(() => {
    if (selectedCluster && googleMapRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      selectedCluster.forEach(imovel => {
        if (imovel.Latitude && imovel.Longitude) {
          const lat = parseFloat(imovel.Latitude);
          const lng = parseFloat(imovel.Longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            bounds.extend({ lat, lng });
          }
        }
      });
      
      if (!bounds.isEmpty()) {
        googleMapRef.current.fitBounds(bounds);
      }
    }
  }, [selectedCluster]);

  // Destacar propriedade selecionada
  useEffect(() => {
    if (!selectedProperty) {
      setPopupInfo(null);
      return;
    }

    const ids = [selectedProperty?.Codigo, selectedProperty?._id, selectedProperty?.id, selectedProperty?.IdImovel]
      .filter((value) => value !== undefined && value !== null && value !== "")
      .map(String);

    if (ids.length === 0) {
      setPopupInfo(null);
      return;
    }

    const marker = markersRef.current.find((mk) => {
      const markerIds = [mk.property?.Codigo, mk.property?._id, mk.property?.id, mk.property?.IdImovel]
        .filter((value) => value !== undefined && value !== null && value !== "")
        .map(String);
      return markerIds.some((value) => ids.includes(value));
    });

    if (marker) {
      const position = marker.getPosition();
      setPopupInfo({
        imovel: marker.property,
        position: { lat: position.lat(), lng: position.lng() }
      });

      if (googleMapRef.current && position) {
        googleMapRef.current.panTo(position);
        if (googleMapRef.current.getZoom() < 15) {
          googleMapRef.current.setZoom(15);
        }
      }
    } else {
      setPopupInfo(null);
    }
  }, [selectedProperty]);

  useEffect(() => {
    if (!selectedCluster && !selectedProperty) {
      setPopupInfo(null);
    }
  }, [selectedCluster, selectedProperty]);

  return (
    <div className={`w-full h-full relative ${className || ''}`}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Contador de imóveis */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs shadow-lg">
          {(() => {
            const selectedCount = Array.isArray(selectedCluster) && selectedCluster.length
              ? selectedCluster.length
              : selectedProperty
              ? 1
              : null;

            const effectiveCount = selectedCount ?? imoveis.length;
            const plural = effectiveCount === 1 ? "imóvel" : "imóveis";
            const suffix = selectedCount != null ? "selecionado" + (effectiveCount === 1 ? "" : "s") : "encontrados";

            return (
              <span>
                <span className="font-bold">{effectiveCount}</span> {plural} {suffix}
              </span>
            );
          })()}
        </div>

        {((Array.isArray(selectedCluster) && selectedCluster.length) || selectedProperty) && (
          <button
            type="button"
            onClick={() => onClearSelection?.()}
            className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-blue-600 hover:text-blue-800 shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Ver todos os imóveis
          </button>
        )}
      </div>

      {/* Popup customizado */}
      {popupInfo && (
        <>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-20 z-20"
            onClick={() => setPopupInfo(null)}
          />
          
          {/* Popup */}
          <div 
            className="absolute z-30"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto'
            }}
          >
            <ImovelPopup 
              imovel={popupInfo.imovel}
              onClose={() => setPopupInfo(null)}
            />
          </div>
        </>
      )}
    </div>
  );
};

const GoogleMapComponent = (props) => {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-center p-8">
        <div>
          <p><strong>Google Maps API Key necessária</strong></p>
          <p>Configure sua chave da API do Google Maps</p>
        </div>
      </div>
    );
  }

  return (
    <Wrapper apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker']}>
      <Map {...props} />
    </Wrapper>
  );
};

export default GoogleMapComponent;