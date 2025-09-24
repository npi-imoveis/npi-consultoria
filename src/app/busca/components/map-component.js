"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, Marker, Popup } from "react-leaflet";
import Image from "next/image";

/* ---------- Popup com foto ---------- */
const ImovelPopup = ({ imovel }) => {
  const formatterSlug = (text) =>
    (text || "")
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");

  const slug = formatterSlug(imovel.Empreendimento || "");

  const getFotoDestaqueUrl = (imv) => {
    if (imv._fotoDestaqueProcessada) return imv._fotoDestaqueProcessada;

    if (!imv.Foto || !Array.isArray(imv.Foto) || imv.Foto.length === 0) {
      return imv.FotoDestaque || imv.imagemDestaque || imv.FotoPrincipal ||
        "https://via.placeholder.com/240x130/E5E7EB/6B7280?text=Sem+foto";
    }

    const destaque = imv.Foto.find((f) => f?.Destaque === "Sim" && f?.Foto);
    if (destaque?.Foto) return destaque.Foto;

    const primeira = imv.Foto.find((f) => f?.Foto && String(f.Foto).trim() !== "");
    if (primeira?.Foto) return primeira.Foto;

    const pequena = imv.Foto.find((f) => f?.FotoPequena && String(f.FotoPequena).trim() !== "");
    if (pequena?.FotoPequena) return pequena.FotoPequena;

    return "https://via.placeholder.com/240x130/E5E7EB/6B7280?text=Sem+foto";
  };

  const fotoUrl = getFotoDestaqueUrl(imovel);

  const valorPrincipal = imovel.ValorVenda
    ? Number(imovel.ValorVenda).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
    : imovel.ValorLocacao
    ? Number(imovel.ValorLocacao).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }) + "/mês"
    : "Consulte";

  const infoExtra = [
    imovel.AreaPrivativa || imovel.AreaConstruida ? `${imovel.AreaPrivativa || imovel.AreaConstruida} m²` : null,
    imovel.Dormitorios || imovel.Quartos ? `${imovel.Dormitorios || imovel.Quartos} dorm.` : null,
    imovel.Vagas ? `${imovel.Vagas} vaga${imovel.Vagas > 1 ? "s" : ""}` : null,
  ].filter(Boolean).join(" • ");

  return (
    <Popup>
      <div className="w-[240px] font-sans">
        <div className="relative w-full h-[130px] rounded-lg overflow-hidden mb-2 bg-gray-200">
          <Image
            src={fotoUrl}
            alt={`Imóvel ${imovel.Empreendimento || imovel.Codigo}`}
            fill
            style={{ objectFit: "cover" }}
            sizes="240px"
            priority={false}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.innerHTML = `
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f3f4f6;color:#6b7280;font-size:12px">
                  <div style="text-align:center;">
                    <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                    <div>Sem foto</div>
                  </div>
                </div>`;
            }}
          />
        </div>

        <h3 className="font-bold text-sm truncate" title={imovel.Empreendimento}>
          {imovel.Empreendimento || `Imóvel ${imovel.Codigo}`}
        </h3>

        <p className="text-xs text-gray-600 truncate" title={imovel.BairroComercial || imovel.Bairro || imovel.Endereco}>
          {imovel.BairroComercial || imovel.Bairro || imovel.Endereco || "Localização"}
        </p>

        {infoExtra && <p className="text-xs text-gray-500 mt-1">{infoExtra}</p>}

        <p className="text-base font-bold text-green-700 mt-1">{valorPrincipal}</p>

        <a href={`/imovel/${imovel.Codigo}/${slug}`} target="_blank" rel="noopener noreferrer" className="!no-underline">
          <button className="w-full mt-3 px-3 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
            Ver Detalhes
          </button>
        </a>
      </div>
    </Popup>
  );
};

/* ---------- Ajustes de mapa ---------- */
const MapController = () => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);
    return () => { clearTimeout(t); window.removeEventListener("resize", handleResize); };
  }, [map]);
  return null;
};

/* ---------- Componente principal ---------- */
export default function MapComponent({ filtros }) {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const buscarImoveisParaMapa = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filtros?.categoriaSelecionada) params.append("categoria", filtros.categoriaSelecionada);
        if (filtros?.cidadeSelecionada) params.append("cidade", filtros.cidadeSelecionada);
        if (filtros?.bairrosSelecionados?.length > 0) filtros.bairrosSelecionados.forEach((b) => params.append("bairros", b));
        const url = `/api/imoveis/mapa?${params.toString()}&t=${Date.now()}`;
        const resp = await fetch(url);
        const data = await resp.json();
        setImoveis(data.data || []);
      } catch (e) {
        console.error("Erro ao buscar imóveis do mapa:", e);
        setImoveis([]);
      } finally {
        setLoading(false);
      }
    };
    buscarImoveisParaMapa();
  }, [filtros]);

  useEffect(() => {
    if (!map || imoveis.length === 0) return;
    const pts = imoveis
      .filter((i) => i.Latitude && i.Longitude && !isNaN(parseFloat(i.Latitude)) && !isNaN(parseFloat(i.Longitude)))
      .map((p) => [parseFloat(p.Latitude), parseFloat(p.Longitude)]);
    if (pts.length) map.fitBounds(pts, { padding: [50, 50], maxZoom: 15 });
  }, [imoveis, map]);

  useEffect(() => {
    import("leaflet").then((L) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            <p className="mt-2 text-gray-700">Carregando mapa...</p>
          </div>
        </div>
      )}

      <MapContainer
        center={[-23.5505, -46.6333]}
        zoom={11}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        className="z-10"
        ref={setMap}
      >
        <MapController />
        <ZoomControl position="bottomright" />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        {imoveis.map((imovel) => {
          const lat = parseFloat(imovel.Latitude);
          const lng = parseFloat(imovel.Longitude);
          if (isNaN(lat) || isNaN(lng)) return null;
          return (
            <Marker key={imovel._id || imovel.Codigo} position={[lat, lng]}>
              <ImovelPopup imovel={imovel} />
            </Marker>
          );
        })}
      </MapContainer>

      {!loading && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full z-20 text-xs shadow-lg">
          <span className="font-bold">{imoveis.length}</span> imóveis encontrados
        </div>
      )}
    </div>
  );
}
