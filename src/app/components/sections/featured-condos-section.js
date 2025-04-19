"use client";

import { useEffect, useRef, useState } from "react";
import CustomCard from "../ui/custom-card";
import { TitleSection } from "../ui/title-section";
import { getCondominioDestacado, getCondominios } from "@/app/services";

export function FeaturedCondosSection() {
  const [condominios, setCondominios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    async function fetchCondominios() {
      try {
        console.log("Buscando condomínios...");
        const response = await getCondominioDestacado();
        console.log("Resposta completa:", response);

        if (response && response.data && Array.isArray(response.data.data)) {
          console.log("Dados encontrados em response.data.data");
          setCondominios(response.data.data);
        } else if (response && response.data && Array.isArray(response.data)) {
          console.log("Dados encontrados em response.data");
          setCondominios(response.data);
        } else if (response && Array.isArray(response)) {
          console.log("Dados encontrados diretamente em response");
          setCondominios(response);
        } else {
          console.error("Formato de resposta inesperado:", response);
          setCondominios([]);
          setError("Formato de dados inválido recebido do servidor");
        }
      } catch (err) {
        console.error("Erro ao buscar condominios:", err);
        setError(err.response?.data?.message || "Erro ao buscar condominios.");
      } finally {
        setLoading(false);
      }
    }
    fetchCondominios();
  }, []);

  console.log("Condominios carregados:", condominios);
  console.log("Estado de carregamento:", loading);
  console.log("Erro:", error);

  return (
    <section className="w-full bg-zinc-100">
      <div className="container mx-auto py-16">
        <TitleSection
          center
          section="Destaque"
          title="Condomínios em Destaque"
          description="Os melhores condomínios de alto padrão."
        />
        <div
          ref={carouselRef}
          className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {loading ? (
            // Renderiza skeletons durante o carregamento
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : condominios && condominios.length > 0 ? (
            // Renderiza os condomínios quando disponíveis
            condominios.map((condominio) => {
              // Verificar se o condomínio tem fotos
              const temFoto =
                condominio.Foto &&
                Array.isArray(condominio.Foto) &&
                condominio.Foto.length > 0 &&
                condominio.Foto[0] &&
                condominio.Foto[0].Foto;

              console.log("Renderizando condomínio:", condominio.Empreendimento || "Sem nome");

              return (
                <CustomCard
                  key={condominio.Codigo || condominio._id || `condominio-${Math.random()}`}
                  id={condominio.Codigo || condominio._id}
                  image={temFoto ? condominio.Foto[0].Foto : null}
                  title={condominio.Empreendimento || "Condomínio"}
                  description={condominio.Endereco || "Endereço não disponível"}
                  sign="Condomínio"
                  slug={condominio.Slug}
                />
              );
            })
          ) : (
            // Mensagem quando não há condomínios
            <p className="text-center w-full py-8 col-span-full">
              {error ? `Erro: ${error}` : "Nenhum condomínio em destaque encontrado."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
