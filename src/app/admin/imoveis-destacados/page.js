// src/app/admin/imoveis-destacados/page.js

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getImoveis } from "@/app/services";
import AuthCheck from "../components/auth-check";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { PhotoIcon } from "@heroicons/react/24/outline";

export default function ImoveisDestacados() {
  const [imoveis, setImoveis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [destacados, setDestacados] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar todos os imóveis
  useEffect(() => {
    const fetchImoveis = async () => {
      console.log("🔄 INICIANDO CARREGAMENTO DE IMÓVEIS...");
      setIsLoading(true);
      try {
        const response = await getImoveis({}, 1, 100);
        console.log("📦 RESPOSTA DA API:", response);
        
        if (response && response.imoveis) {
          console.log("🏠 TOTAL DE IMÓVEIS:", response.imoveis.length);
          console.log("🎯 PRIMEIRO IMÓVEL PARA DEBUG:", response.imoveis[0]);
          
          setImoveis(response.imoveis);

          // Identificar quais são destacados
          const destaques = response.imoveis
            .filter((imovel) => imovel.Destaque === "Sim" || Math.random() > 0.7)
            .map((imovel) => imovel.Codigo);

          setDestacados(destaques);
        }
      } catch (error) {
        console.error("❌ ERRO ao carregar imóveis:", error);
      } finally {
        setIsLoading(false);
        console.log("✅ CARREGAMENTO FINALIZADO");
      }
    };

    fetchImoveis();
  }, []);

  // Alternar o status de destaque de um imóvel
  const toggleDestaque = (codigo) => {
    setDestacados((prev) => {
      if (prev.includes(codigo)) {
        return prev.filter((id) => id !== codigo);
      } else {
        return [...prev, codigo];
      }
    });
  };

  // Salvar as alterações
  const salvarDestaques = async () => {
    setIsSaving(true);
    try {
      // TODO: Implementar chamada real para API
      // await updateDestacados(destacados);
      
      // Simulação de delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Imóveis destacados salvos: ${destacados.join(", ")}`);
    } catch (error) {
      console.error("Erro ao salvar destaques:", error);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // Formatar valores monetários
  const formatarValor = (valor) => {
    if (!valor) return "-";

    const valorNumerico =
      typeof valor === "number"
        ? valor
        : parseFloat(valor.toString().replace(/[^\d.,]/g, "").replace(",", "."));

    if (isNaN(valorNumerico)) return "-";

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valorNumerico);
  };

  // Obter URL da foto destaque
  const getFotoDestaque = (imovel) => {
    // Debug: vamos ver todos os campos de foto disponíveis
    console.log(`🖼️ ANÁLISE DE FOTO - Imóvel ${imovel.Codigo}:`, {
      FotoDestaque: imovel.FotoDestaque,
      ImagemPrincipal: imovel.ImagemPrincipal,
      Fotos: imovel.Fotos,
      Foto: imovel.Foto,
      FotoPrincipal: imovel.FotoPrincipal,
      Imagem: imovel.Imagem,
      foto_destaque: imovel.foto_destaque,
      imagem_principal: imovel.imagem_principal,
      'Todos os campos do imóvel': Object.keys(imovel)
    });

    // Prioridades para buscar a foto destaque:
    const fotoEscolhida = (
      imovel.FotoDestaque ||
      imovel.FotoPrincipal ||
      imovel.ImagemPrincipal ||
      imovel.Foto ||
      imovel.Imagem ||
      imovel.foto_destaque ||
      imovel.imagem_principal ||
      (imovel.Fotos && imovel.Fotos.length > 0 ? imovel.Fotos[0] : null)
    );

    console.log(`📸 FOTO ESCOLHIDA para ${imovel.Codigo}:`, fotoEscolhida);
    
    return fotoEscolhida;
  };

  // Componente para imagem com fallback
  const ImagemImovel = ({ imovel }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const fotoUrl = getFotoDestaque(imovel);

    // Função para tratar a URL da foto
    const tratarUrlFoto = (url) => {
      if (!url) return null;
      
      // Se a URL já estiver completa, retorna como está
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      // Se for uma URL relativa, pode precisar de tratamento
      // Ajuste conforme seu domínio/CDN
      if (url.startsWith('/')) {
        return url; // Next.js Image pode lidar com URLs relativas
      }
      
      return url;
    };

    const urlTratada = tratarUrlFoto(fotoUrl);

    if (!urlTratada || imageError) {
      return (
        <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <PhotoIcon className="w-6 h-6 text-gray-400" />
          <span className="text-xs text-gray-400 ml-1">
            {imovel.Codigo}
          </span>
        </div>
      );
    }

    return (
      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <Image
          src={urlTratada}
          alt={`Foto do imóvel ${imovel.Codigo}`}
          fill
          className={`object-cover transition-opacity duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          sizes="64px"
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
            console.error(`Erro ao carregar imagem do imóvel ${imovel.Codigo}:`, urlTratada);
            setImageError(true);
            setImageLoading(false);
          }}
        />
      </div>
    );
  };

  // Skeleton loading para a tabela
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="w-5 h-5 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="w-16 h-12 bg-gray-200 rounded-lg"></div>
      </td>
      <td className="px-6 py-4">
        <div className="w-20 h-4 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="w-32 h-4 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
      </td>
      <td className="px-6 py-4">
        <div className="w-28 h-4 bg-gray-200 rounded"></div>
      </td>
    </tr>
  );

  return (
    <AuthCheck>
      <div className="max-w-7xl mx-auto text-xs">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Imóveis Destacados
              </h1>
              <p className="text-gray-600">
                Selecione os imóveis que deseja destacar na página inicial do site.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {destacados.length} imóvel{destacados.length !== 1 ? 'eis' : ''} destacado{destacados.length !== 1 ? 's' : ''}
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destaque
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Foto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <SkeletonRow key={index} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Destaque
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Foto
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Código
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Título
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Categoria
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {imoveis.map((imovel) => (
                        <tr 
                          key={imovel.Codigo} 
                          className={`hover:bg-gray-50 transition-colors duration-150 ${
                            destacados.includes(imovel.Codigo) ? 'bg-yellow-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleDestaque(imovel.Codigo)}
                              className="focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-full p-1"
                              title={
                                destacados.includes(imovel.Codigo)
                                  ? "Remover destaque"
                                  : "Adicionar destaque"
                              }
                            >
                              {destacados.includes(imovel.Codigo) ? (
                                <StarIcon className="h-5 w-5 text-yellow-500" />
                              ) : (
                                <StarOutlineIcon className="h-5 w-5 text-gray-400 hover:text-yellow-500 transition-colors duration-150" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <ImagemImovel imovel={imovel} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {imovel.Codigo || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                            {imovel.TituloSite || imovel.Titulo || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {imovel.Categoria || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                            {formatarValor(
                              imovel.ValorVenda || imovel.ValorAluguelSite || imovel.Valor
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {imoveis.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum imóvel encontrado
                  </h3>
                  <p className="text-gray-500">
                    Não foi possível carregar os imóveis. Tente novamente.
                  </p>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Total: {imoveis.length} imóveis
                </div>
                <button
                  onClick={salvarDestaques}
                  disabled={isSaving}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    'Salvar Destaques'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}
