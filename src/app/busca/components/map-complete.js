// src/app/busca/components/map-complete.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useFiltersStore from "@/app/store/filtrosStore";
import { getImoveis } from "@/app/services";

// Corrige o bug do marker padrão do Leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/* Helpers */
const coerceNumber = (v) => {
  if (v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

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

/**
 * FUNÇÃO BASEADA NO PADRÃO DA PÁGINA DO IMÓVEL
 * Extrai a URL da foto seguindo a mesma lógica do MapComponent
 */
const getCoverUrl = (imovelFoto) => {
  try {
    let imageUrl = null;
    
  console.log('🔍 Campos de foto disponíveis:', {
  Foto: m.Foto,
  Foto1: m.Foto1,
  FotoPrincipal: m.FotoPrincipal,
  ImagemCapa: m.ImagemCapa,
  todasAsChaves: Object.keys(m).filter(k => k.toLowerCase().includes('foto') || k.toLowerCase().includes('imag'))
});
    // MÉTODO 1: Array de fotos (mais comum - padrão da página do imóvel)
    if (Array.isArray(imovelFoto) && imovelFoto.length > 0) {
      const foto = imovelFoto[0];
      
      if (foto && typeof foto === 'object') {
        // Prioridade: FotoGrande > Foto > FotoMedia > FotoPequena
        const possibleUrls = [
          foto.FotoGrande,
          foto.Foto,
          foto.FotoMedia,
          foto.FotoPequena
        ];
        
        for (const url of possibleUrls) {
          if (url && typeof url === 'string' && url.trim() !== '') {
            imageUrl = url.trim();
            break;
          }
        }
      } else if (foto && typeof foto === 'string' && foto.trim() !== '') {
        imageUrl = foto.trim();
      }
    }
    
    // MÉTODO 2: String direta
    if (!imageUrl && typeof imovelFoto === 'string' && imovelFoto.trim() !== '') {
      imageUrl = imovelFoto.trim();
    }
    
    // MÉTODO 3: Objeto único
    if (!imageUrl && imovelFoto && typeof imovelFoto === 'object' && !Array.isArray(imovelFoto)) {
      const possibleUrls = [
        imovelFoto.FotoGrande,
        imovelFoto.Foto,
        imovelFoto.FotoMedia,
        imovelFoto.FotoPequena
      ];
      
      for (const url of possibleUrls) {
        if (url && typeof url === 'string' && url.trim() !== '') {
          imageUrl = url.trim();
          break;
        }
      }
    }
    
    // VALIDAÇÃO E OTIMIZAÇÃO DA URL
    if (imageUrl) {
      // Garantir HTTPS
      if (imageUrl.startsWith('http://')) {
        imageUrl = imageUrl.replace('http://', 'https://');
      }
      
      // Se URL relativa, converter para absoluta
      if (imageUrl.startsWith('/')) {
        imageUrl = `https://npiconsultoria.com.br${imageUrl}`;
      }
      
      return imageUrl;
    }
    
    // FALLBACK - Placeholder em base64
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjNmNGY2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNWU3ZWI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0idXJsKCNncmFkKSIvPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2MCwgOTApIj4KICAgIDxyZWN0IHg9Ii00MCIgeT0iLTIwIiB3aWR0aD0iODAiIGhlaWdodD0iNTAiIGZpbGw9IiNkMWQ1ZGIiIHJ4PSIyIi8+CiAgICA8cmVjdCB4PSItMzAiIHk9Ii0xMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjOWNhM2FmIi8+CiAgICA8cmVjdCB4PSItNSIgeT0iLTEwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiM5Y2EzYWYiLz4KICAgIDxyZWN0IHg9IjE1IiB5PSItMTAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iIzljYTNhZiIvPgogICAgPHJlY3QgeD0iLTMwIiB5PSIxMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjOWNhM2FmIi8+CiAgICA8cmVjdCB4PSItNSIgeT0iMTAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iIzljYTNhZiIvPgogICAgPHJlY3QgeD0iMTUiIHk9IjEwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiM5Y2EzYWYiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iLTQ1LC0yMCAwLC0zNSA0NSwtMjAiIGZpbGw9IiM5Y2EzYWYiLz4KICAgIDxyZWN0IHg9Ii03IiB5PSIxNSIgd2lkdGg9IjE0IiBoZWlnaHQ9IjE1IiBmaWxsPSIjNmI3MjgwIi8+CiAgPC9nPgogIDx0ZXh0IHg9IjE2MCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNmI3MjgwIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjExIiBmb250LXdlaWdodD0iNTAwIj5JbWFnZW0gbsOjbyBkaXNwb27DrXZlbDwvdGV4dD4KPC9zdmc+";
    
  } catch (error) {
    console.error('Erro ao obter URL da foto:', error);
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjNmNGY2O3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNWU3ZWI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgZmlsbD0idXJsKCNncmFkKSIvPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2MCwgOTApIj4KICAgIDxyZWN0IHg9Ii00MCIgeT0iLTIwIiB3aWR0aD0iODAiIGhlaWdodD0iNTAiIGZpbGw9IiNkMWQ1ZGIiIHJ4PSIyIi8+CiAgICA8cmVjdCB4PSItMzAiIHk9Ii0xMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjOWNhM2FmIi8+CiAgICA8cmVjdCB4PSItNSIgeT0iLTEwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiM5Y2EzYWYiLz4KICAgIDxyZWN0IHg9IjE1IiB5PSItMTAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iIzljYTNhZiIvPgogICAgPHJlY3QgeD0iLTMwIiB5PSIxMCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBmaWxsPSIjOWNhM2FmIi8+CiAgICA8cmVjdCB4PSItNSIgeT0iMTAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgZmlsbD0iIzljYTNhZiIvPgogICAgPHJlY3QgeD0iMTUiIHk9IjEwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGZpbGw9IiM5Y2EzYWYiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iLTQ1LC0yMCAwLC0zNSA0NSwtMjAiIGZpbGw9IiM5Y2EzYWYiLz4KICAgIDxyZWN0IHg9Ii03IiB5PSIxNSIgd2lkdGg9IjE0IiBoZWlnaHQ9IjE1IiBmaWxsPSIjNmI3MjgwIi8+CiAgPC9nPgogIDx0ZXh0IHg9IjE2MCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNmI3MjgwIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjExIiBmb250LXdlaWdodD0iNTAwIj5JbWFnZW0gbsOjbyBkaXNwb27DrXZlbDwvdGV4dD4KPC9zdmc+";
  }
};

const formatBRL = (n) => {
  const num = Number(String(n).replace(/\D/g, ""));
  if (!Number.isFinite(num) || num === 0) return "";
  try {
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  } catch {
    return `R$ ${num}`;
  }
};

function FitToMarkers({ points }) {
  const map = useMap();
  const didFitRef = useRef(false);

  useEffect(() => {
    if (!map || didFitRef.current) return;
    if (!points || points.length === 0) return;

    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
      didFitRef.current = true;
    }
  }, [map, points]);

  return null;
}

export default function MapComplete({ filtros }) {
  const store = useFiltersStore();
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // monta params coerentes com a page (cards)
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

    // bairros
    const bairros = store.bairrosSelecionados?.length
      ? store.bairrosSelecionados
      : filtros?.bairrosSelecionados?.length
      ? filtros.bairrosSelecionados
      : [];
    if (Array.isArray(bairros) && bairros.length > 0) params.bairrosArray = bairros;

    // finalidade — aliases de locação p/ garantir consistência com os pins
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

    // preços (somente se usuário informou)
    Object.assign(
      params,
      buildPriceParams(
        isRent,
        store.precoMin ?? filtros?.precoMin ?? null,
        store.precoMax ?? filtros?.precoMax ?? null
      )
    );

    // área, somente se > 0
    const areaMin = store.areaMin ?? filtros?.areaMin;
    const areaMax = store.areaMax ?? filtros?.areaMax;
    if (areaMin && String(areaMin) !== "0") params.areaMinima = String(areaMin);
    if (areaMax && String(areaMax) !== "0") params.areaMaxima = String(areaMax);

    if (store.abaixoMercado || filtros?.abaixoMercado) params.apenasCondominios = true;
    if (store.proximoMetro || filtros?.proximoMetro) params.proximoMetro = true;

    return params;
  }, [store, filtros]);

  // busca os imóveis para o mapa
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // usa a mesma API, mas pode aumentar o limite para mais pins no mapa
        const res = await getImoveis(searchParams, 1, 200);
        const list = Array.isArray(res?.imoveis) ? res.imoveis : [];

        // transforma em markers com lat/lng válidos
        const withCoords = list
          .map((it) => {
            const ll = getLatLng(it);
            if (!ll) return null;
            return { ...it, __lat: ll.lat, __lng: ll.lng };
          })
          .filter(Boolean);

        if (mounted) setMarkers(withCoords);
      } catch (err) {
        console.error("[MAP] Erro ao carregar imóveis do mapa:", err);
        if (mounted) setMarkers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [searchParams]);

  // Ponto inicial (fallback)
  const initialCenter = [ -23.55052, -46.633308 ]; // SP como fallback
  const points = markers.map((m) => ({ lat: m.__lat, lng: m.__lng }));

  return (
    <div className="w-full h-full">
      <MapContainer
        center={initialCenter}
        zoom={12}
        scrollWheelZoom
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ajusta o mapa para abranger os markers ao carregar */}
        {points.length > 0 && <FitToMarkers points={points} />}

        {markers.map((m) => {
          const key = m.Codigo || m._id || `${m.__lat}-${m.__lng}-${Math.random()}`;
          
          // CORREÇÃO PRINCIPAL: Passa m.Foto para getCoverUrl
          // Tenta TODOS os campos possíveis de foto
const foto = getCoverUrl(m.Foto) || 
             getCoverUrl(m.Foto1) || 
             getCoverUrl(m.FotoPrincipal) || 
             getCoverUrl(m.ImagemCapa) || 
             m.Foto1 || 
             m.FotoPrincipal || 
             m.ImagemCapa ||
             '/placeholder-imovel.jpg';
          
          // Adiciona suporte para m.Empreendimento e outros campos
          const titulo =
            m.Empreendimento ||
            m.NomeImovel ||
            m.Titulo ||
            `${m.Categoria || m.Tipo || "Imóvel"} ${m.Codigo ? `• ${m.Codigo}` : ""}`;
          const cidade = m.Cidade || m.cidade || "";
          const bairro = m.Bairro || m.BairroComercial || m.bairro || "";
          const endereco = m.Endereco || "";
          const numero = m.Numero || "";
          
          // Compatibilidade com campos antigos
          const quartos = m.Quartos || m.DormitoriosAntigo;
          const vagas = m.Vagas || m.VagasAntigo;
          const area = m.AreaPrivativa || m.MetragemAnt;
          
          const finalidade = (m.Finalidade || m.Status || m.TipoNegocio || "").toString().toLowerCase();
          const isRent =
            finalidade.includes("alug") || finalidade.includes("loca") || finalidade === "locacao";
          
          // Adiciona suporte para ValorAntigo
          const precoBruto =
            (isRent
              ? (m.ValorAluguelNumerico ?? m.ValorAluguel ?? m.Aluguel)
              : (m.ValorNumerico ?? m.ValorVenda ?? m.Valor ?? m.Preco ?? m.ValorAntigo)) ?? null;
          const preco = formatBRL(String(precoBruto).replace(/\D/g, ""));

          return (
            <Marker key={key} position={[m.__lat, m.__lng]}>
              <Popup maxWidth={320} minWidth={280}>
                <div 
                  style={{
                    width: '300px',
                    margin: '-20px',
                    overflow: 'hidden',
                    borderRadius: '8px',
                    background: 'white'
                  }}
                >
                  <a
                    href={`/imovel/${m.Codigo}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'block',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    {/* Container da imagem */}
                    <div style={{
                      position: 'relative',
                      width: '300px',
                      height: '160px',
                      backgroundColor: '#f3f4f6',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={foto}
                        alt={titulo}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      
                      {/* Badge de preço sobre a imagem */}
                      {preco && (
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '10px',
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: 'bold'
                        }}>
                          {preco}{isRent ? "/mês" : ""}
                        </div>
                      )}
                    </div>
                    
                    {/* Informações do imóvel */}
                    <div style={{
                      padding: '12px'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        marginBottom: '6px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#111'
                      }}>
                        {titulo}
                      </div>
                      
                      {(endereco || bairro || cidade) && (
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginBottom: '8px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {endereco}
                          {numero ? `, ${numero}` : ""}
                          {endereco && (bairro || cidade) ? ", " : ""}
                          {bairro}
                          {bairro && cidade ? " • " : ""}
                          {cidade}
                        </div>
                      )}
                      
                      {/* Características */}
                      <div style={{
                        fontSize: '11px',
                        color: '#888',
                        display: 'flex',
                        gap: '10px'
                      }}>
                        {quartos && <span>{quartos} quartos</span>}
                        {vagas && <span>{vagas} vagas</span>}
                        {area && <span>{area}m²</span>}
                      </div>
                      
                      {/* Botão Ver Mais */}
                      <div style={{
                        marginTop: '10px',
                        textAlign: 'center',
                        padding: '8px',
                        backgroundColor: '#000',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        Ver Detalhes →
                      </div>
                    </div>
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Contador de imóveis */}
      {!loading && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 16px',
          borderRadius: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          fontSize: '13px',
          zIndex: 1000
        }}>
          <span style={{ fontWeight: 'bold' }}>{markers.length}</span> imóveis encontrados
        </div>
      )}
    </div>
  );
}
