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

// FUNÇÃO CORRIGIDA para obter a URL da foto
const getCoverUrl = (imovel) => {
  // Debug para entender a estrutura
  console.log('Imovel completo:', imovel);
  
  // Lista de todos os campos possíveis de foto
  const possiblePhotoFields = [
    'Foto1',
    'FotoPrincipal', 
    'FotoDestaque',
    'ImagemCapa',
    'ImagemPrincipal',
    'FotoCapa',
    'Imagem',
    'Image',
    'Thumb',
    'Thumbnail'
  ];
  
  // Tenta encontrar a foto em campos diretos
  for (const field of possiblePhotoFields) {
    if (imovel[field]) {
      console.log(`Foto encontrada em: ${field} = ${imovel[field]}`);
      const url = imovel[field];
      // Se for caminho relativo, adiciona domínio
      if (url.startsWith('/')) {
        return `https://npiconsultoria.com.br${url}`;
      }
      return url;
    }
  }
  
  // Se tem array Foto
  if (imovel.Foto && Array.isArray(imovel.Foto) && imovel.Foto.length > 0) {
    const primeiraFoto = imovel.Foto[0];
    if (typeof primeiraFoto === 'string') return primeiraFoto;
    if (primeiraFoto?.Foto) return primeiraFoto.Foto;
    if (primeiraFoto?.url) return primeiraFoto.url;
  }
  
  // Se tem array Fotos  
  if (imovel.Fotos && Array.isArray(imovel.Fotos) && imovel.Fotos.length > 0) {
    const primeiraFoto = imovel.Fotos[0];
    if (typeof primeiraFoto === 'string') return primeiraFoto;
    if (primeiraFoto?.Foto) return primeiraFoto.Foto;
    if (primeiraFoto?.url) return primeiraFoto.url;
  }
  
  console.log('Nenhuma foto encontrada para o imovel:', imovel.Codigo);
  
  // Retorna placeholder
  return '/placeholder-imovel.jpg';
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
          
          // CORREÇÃO: Passa o objeto inteiro para getCoverUrl
          const foto = getCoverUrl(m);
          
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
                          e.target.src = '/placeholder-imovel.jpg';
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
