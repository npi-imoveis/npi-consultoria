// src/app/busca/components/Map.js
"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Usar o map-component.js que está na mesma pasta
const MapWithNoSSR = dynamic(
  () => import("./map-component"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-full w-full bg-gray-100 rounded-lg">
        <p className="text-center py-10">Carregando mapa...</p>
      </div>
    ),
  }
);

const Map = ({ filtros }) => {
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
