"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Carregamento dinâmico dos componentes do Leaflet para evitar problemas com SSR
const MapWithNoSSR = dynamic(
  () => import("./map-component"), // Vamos criar esse arquivo em seguida
  {
    ssr: false, // Isso impede que o componente seja renderizado no servidor
    loading: () => (
      <div className="flex justify-center items-center h-full w-full bg-gray-100 rounded-lg">
        <p className="text-center py-10">Carregando mapa...</p>
      </div>
    ),
  }
);

const Map = ({ filtros }) => {
  // Estado para controlar se estamos no navegador
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="absolute top-0 left-0 w-full h-full bg-gray-100 rounded-lg"></div>;
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <MapWithNoSSR filtros={filtros} />
    </div>
  );
};

export default Map;
