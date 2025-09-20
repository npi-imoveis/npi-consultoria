// src/app/busca/components/map-complete.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useFiltersStore from "@/app/store/filtrosStore";
import { getImoveis } from "@/app/services";

// Corrige o bug do marker padrão do Leaflet no Webpack/Next
// (evita ícone quebrado em produção)
const DefaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
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

// mesmo helper da page: duplica campos de preço por modalidade
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
      out.precoMinimo = String(min);   // fallback
    }
    if (hasMax) {
      out.precoAluguelMax = String(max);
      out.valorAluguelMax = String(max);
      out.aluguelMax = String(max);
      out.precoMaximo = String(max);   // fallback
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

// tenta extrair lat/lng de diferentes formatos que podem vir da API
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

// tenta descobrir a melhor imagem de destaque
const getCoverUrl = (imovel) => {
  const candidates = [
    imovel?.Foto1,
    imovel?.fotoDestaque,
    imovel?.Capa,
    imovel?.ImagemCapa,
    Array.isArray(imovel?.Fotos) ? imovel.Fotos[0] : undefined,
  ].filter(Boolean);
  return candidates[0] || "/assets/default-property.jpg";
};

// formata preço (sem forçar piso)
const formatBRL = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "";
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
          const foto = getCoverUrl(m);
          const titulo =
            m.NomeImovel ||
            m.Titulo ||
            `${m.Categoria || m.Tipo || "Imóvel"} ${m.Codigo ? `• ${m.Codigo}` : ""}`;
          const cidade = m.Cidade || m.cidade || "";
          const bairro = m.Bairro || m.bairro || "";
          const finalidade = (m.Finalidade || m.Status || m.TipoNegocio || "").toString().toLowerCase();
          const isRent =
            finalidade.includes("alug") || finalidade.includes("loca") || finalidade === "locacao";
          const precoBruto =
            (isRent
              ? (m.ValorAluguelNumerico ?? m.ValorAluguel ?? m.Aluguel)
              : (m.ValorNumerico ?? m.Valor ?? m.Preco)) ?? null;
          const preco = formatBRL(String(precoBruto).replace(/\D/g, ""));

          return (
            <Marker key={key} position={[m.__lat, m.__lng]}>
              <Popup>
                <div className="w-[240px]">
                  <a
                    href={`/imovel/${m.Codigo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-md border border-gray-200"
                  >
                    <div className="relative w-full h-[140px] bg-gray-100">
                      {/* imagem de destaque */}
                      <img
                        src={foto}
                        alt={titulo}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      {/* etiqueta de preço */}
                      {preco && (
                        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[11px] px-2 py-1 rounded">
                          {preco}{isRent ? "/mês" : ""}
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="text-[12px] font-semibold line-clamp-2">{titulo}</div>
                      {(bairro || cidade) && (
                        <div className="text-[11px] text-gray-600 mt-0.5">
                          {bairro}{bairro && cidade ? " • " : ""}{cidade}
                        </div>
                      )}
                    </div>
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
