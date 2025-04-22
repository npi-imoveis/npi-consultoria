"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import AuthCheck from "../../../components/auth-check";
import { getImovelById, atualizarImovel, excluirImovel } from "@/app/services";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  TrashIcon,
  PlusCircleIcon,
  XCircleIcon,
  PhotoIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { getProprietario, getVinculos } from "@/app/admin/services";
import Proprietarios from "../../components/proprietarios";

export default function EditarImovel({ params }) {
  const router = useRouter();
  // Usar React.use() para desempacotar o objeto params (resolução para o aviso do Next.js)
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [imovel, setImovel] = useState(null);
  const [formData, setFormData] = useState({});
  const [displayValues, setDisplayValues] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showProprietarios, setShowProprietarios] = useState(false);

  // Função para formatar valores monetários
  const formatarParaReal = (valor) => {
    if (valor === null || valor === undefined || valor === "") return "";

    // Remove qualquer caractere não numérico
    const apenasNumeros = String(valor).replace(/\D/g, "");

    // Converte para número e formata
    try {
      const numero = parseInt(apenasNumeros, 10);
      return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    } catch (e) {
      console.error("Erro ao formatar valor:", e);
      return String(valor);
    }
  };

  // Função para extrair somente os números (remove formatação)
  const extrairNumeros = (valorFormatado) => {
    if (!valorFormatado) return "";
    return valorFormatado.replace(/\D/g, "");
  };

  // Carregar dados do imóvel usando o Codigo
  useEffect(() => {
    const fetchImovel = async () => {
      setIsLoading(true);
      try {
        const response = await getImovelById(id);
        if (response && response.data) {
          const imovelData = response.data;
          setImovel(imovelData);
          setFormData(imovelData);

          // Inicializa os valores de exibição formatados
          const valoresFormatados = {
            ValorVenda: formatarParaReal(imovelData.ValorVenda),
            ValorAluguelSite: formatarParaReal(imovelData.ValorAluguelSite),
            ValorCondominio: formatarParaReal(imovelData.ValorCondominio),
            ValorIptu: formatarParaReal(imovelData.ValorIptu),
          };
          setDisplayValues(valoresFormatados);
        } else {
          setError("Imóvel não encontrado");
        }
      } catch (error) {
        console.error("Erro ao carregar imóvel:", error);
        setError("Erro ao carregar dados do imóvel");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchImovel();
    }
  }, [id]);

  console.log("Dados do Imóvel", imovel);

  useEffect(() => {
    const fetchVinculos = async () => {
      const response = await getVinculos(id);
      console.log("Corretores vinculados", response);
    };
    fetchVinculos();
  }, [id]);

  // Função para lidar com mudanças nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Tratamento especial para campos monetários
    if (["ValorVenda", "ValorAluguelSite", "ValorCondominio", "ValorIptu"].includes(name)) {
      // Armazena o valor não formatado no formData
      const valorNumerico = extrairNumeros(value);
      setFormData((prevData) => ({
        ...prevData,
        [name]: valorNumerico,
      }));

      // Atualiza o valor formatado para exibição
      setDisplayValues((prevValues) => ({
        ...prevValues,
        [name]: formatarParaReal(valorNumerico),
      }));
    }
    // Tratamento especial para o campo de vídeo
    else if (name === "Video.1.Video") {
      setFormData((prevData) => ({
        ...prevData,
        Video: {
          ...(prevData.Video || {}),
          1: {
            ...(prevData.Video?.[1] || {}),
            Codigo: prevData.Video?.[1]?.Codigo || "",
            Destaque: prevData.Video?.[1]?.Destaque || "Nao",
            Tipo: "youtube",
            Video: value,
            VideoCodigo: prevData.Video?.[1]?.VideoCodigo || "1",
          },
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Função para adicionar uma nova imagem
  const addImage = () => {
    const newImageCode = Date.now().toString(); // Gera um código único baseado no timestamp
    setFormData((prevData) => {
      const newFoto = {
        ...(prevData.Foto || {}),
        [newImageCode]: {
          Codigo: newImageCode,
          Destaque: "Nao",
          Foto: "", // URL da imagem será adicionada pelo usuário
        },
      };
      return {
        ...prevData,
        Foto: newFoto,
      };
    });
  };

  // Função para atualizar uma imagem específica
  const updateImage = (codigo, field, value) => {
    setFormData((prevData) => {
      if (!prevData.Foto || !prevData.Foto[codigo]) return prevData;

      return {
        ...prevData,
        Foto: {
          ...prevData.Foto,
          [codigo]: {
            ...prevData.Foto[codigo],
            [field]: value,
          },
        },
      };
    });
  };

  // Função para remover uma imagem
  const removeImage = (codigo) => {
    if (!window.confirm("Tem certeza que deseja remover esta imagem?")) return;

    setFormData((prevData) => {
      if (!prevData.Foto) return prevData;

      const newFoto = { ...prevData.Foto };
      delete newFoto[codigo];

      return {
        ...prevData,
        Foto: Object.keys(newFoto).length > 0 ? newFoto : undefined,
      };
    });
  };

  // Função para definir uma imagem como destaque
  const setImageAsHighlight = (codigo) => {
    setFormData((prevData) => {
      if (!prevData.Foto) return prevData;

      // Criar um novo objeto Foto com todas as imagens definidas como não-destaque
      const updatedFoto = Object.keys(prevData.Foto).reduce((acc, key) => {
        acc[key] = {
          ...prevData.Foto[key],
          Destaque: key === codigo ? "Sim" : "Nao",
        };
        return acc;
      }, {});

      return {
        ...prevData,
        Foto: updatedFoto,
      };
    });
  };

  // Função para alterar a posição da imagem
  const changeImagePosition = (codigo, newPosition) => {
    console.log(`Trocando imagem ${codigo} com a posição ${newPosition}`);

    setFormData((prevData) => {
      // Obter as chaves ordenadas pelo valor Ordem ou pela ordem natural
      const keys = [...Object.keys(prevData.Foto)].sort((a, b) => {
        const orderA = prevData.Foto[a].Ordem || [...Object.keys(prevData.Foto)].indexOf(a);
        const orderB = prevData.Foto[b].Ordem || [...Object.keys(prevData.Foto)].indexOf(b);
        return orderA - orderB;
      });

      // Encontrar o índice atual da imagem que queremos mover
      const currentIndex = keys.indexOf(codigo);
      // Índice da posição desejada (ajuste para base 0)
      const targetIndex = newPosition - 1;

      // Se a posição atual é igual à desejada, não faz nada
      if (currentIndex === targetIndex) {
        return prevData;
      }

      // Obtém o código da imagem que está na posição de destino
      const targetCode = keys[targetIndex];

      // Criar nova ordem
      const newOrder = [...keys];

      // Trocar as posições (mantendo o resto da ordem)
      newOrder[currentIndex] = targetCode;
      newOrder[targetIndex] = codigo;

      // Criar novo objeto Foto com a nova ordem
      const newFoto = {};
      newOrder.forEach((key, idx) => {
        newFoto[key] = {
          ...prevData.Foto[key],
          Ordem: idx + 1,
        };
      });

      return {
        ...prevData,
        Foto: newFoto,
      };
    });
  };

  // Função para salvar as alterações
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // Usar o Codigo do imóvel para atualizar
      const result = await atualizarImovel(formData.Codigo, formData);
      if (result && result.success) {
        setSuccess("Imóvel atualizado com sucesso!");
        setTimeout(() => {
          router.push("/admin/imoveis");
        }, 2000);
      } else {
        setError(result?.message || "Erro ao atualizar imóvel");
      }
    } catch (error) {
      console.error("Erro ao atualizar imóvel:", error);
      setError("Ocorreu um erro ao salvar as alterações");
    } finally {
      setIsSaving(false);
    }
  };

  // Função para excluir o imóvel
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      // Usar o Codigo do imóvel para excluir
      const result = await excluirImovel(formData.Codigo);
      if (result && result.success) {
        setSuccess("Imóvel excluído com sucesso!");
        setTimeout(() => {
          router.push("/admin/imoveis");
        }, 2000);
      } else {
        setError(result?.message || "Erro ao excluir imóvel");
      }
    } catch (error) {
      console.error("Erro ao excluir imóvel:", error);
      setError("Ocorreu um erro ao excluir o imóvel");
    } finally {
      setIsDeleting(false);
    }
  };

  // Agrupar campos por categorias para melhor organização
  const fieldGroups = [
    {
      title: "Informações Básicas",
      fields: [
        {
          name: "Codigo",
          label: "Código",
          type: "text",
        },
        {
          name: "Ativo",
          label: "Ativo",
          type: "select",
          options: [
            { value: "Sim", label: "Sim" },
            { value: "Não", label: "Não" },
          ],
        },
        { name: "Empreendimento", label: "Empreendimento", type: "text" },
        { name: "Construtora", label: "Construtora", type: "text" },
        { name: "Categoria", label: "Categoria", type: "text" },
        {
          name: "Situacao",
          label: "Situação",
          type: "select",
          options: [
            { value: "EM CONSTRUÇÃO", label: "EM CONSTRUÇÃO" },
            { value: "LANÇAMENTO", label: "LANÇAMENTO" },
            { value: "PRÉ-LANÇAMENTO", label: "PRÉ-LANÇAMENTO" },
            { value: "PRONTO NOVO", label: "PRONTO NOVO" },
            { value: "PRONTO USADO", label: "PRONTO USADO" },
          ],
        },
        {
          name: "Status",
          label: "Status",
          type: "select",
          options: [
            { value: "LOCAÇÃO", label: "LOCAÇÃO" },
            { value: "LOCADO", label: "LOCADO" },
            { value: "PENDENTE", label: "PENDENTE" },
            { value: "SUSPENSO", label: "SUSPENSO" },
            { value: "VENDA", label: "VENDA" },
            { value: "VENDA E LOCAÇÃO", label: "VENDA E LOCAÇÃO" },
            { value: "VENDIDO", label: "VENDIDO" },
          ],
        },
        { name: "Slug", label: "Slug", type: "text" },
        {
          name: "Destacado",
          label: "Imóvel Destaque (Sim/Não)",
          type: "select",
          options: [
            { value: "Sim", label: "Sim" },
            { value: "Não", label: "Não" },
          ],
        },
        {
          name: "Condominio",
          label: "É Condomínio? (Sim/Não)",
          type: "select",
          options: [
            { value: "Sim", label: "Sim" },
            { value: "Não", label: "Não" },
          ],
        },
        {
          name: "CondominioDestaque",
          label: "Condomínio Destaque (Sim/Não)",
          type: "select",
          options: [
            { value: "Sim", label: "Sim" },
            { value: "Não", label: "Não" },
          ],
        },
      ],
    },
    {
      title: "Localização",
      fields: [
        { name: "Endereco", label: "Endereço", type: "text" },
        { name: "Numero", label: "Número", type: "text" },
        { name: "Complemento", label: "Complemento", type: "text" },
        { name: "Bairro", label: "Bairro", type: "text" },
        { name: "BairroComercial", label: "Bairro Comercial", type: "text" },
        { name: "Cidade", label: "Cidade", type: "text" },
        { name: "UF", label: "UF", type: "text" },
        { name: "CEP", label: "CEP", type: "text" },
        { name: "Latitude", label: "Latitude", type: "text" },
        { name: "Longitude", label: "Longitude", type: "text" },
      ],
    },
    {
      title: "Características",
      fields: [
        { name: "AreaPrivativa", label: "Área Privativa (m²)", type: "text" },
        { name: "AreaTotal", label: "Área Total (m²)", type: "text" },
        { name: "Dormitorios", label: "Dormitórios", type: "text" },
        { name: "Suites", label: "Suítes", type: "text" },
        { name: "BanheiroSocialQtd", label: "Banheiros Sociais", type: "text" },
        { name: "Vagas", label: "Vagas de Garagem", type: "text" },
        { name: "AnoConstrucao", label: "Ano de Construção", type: "text" },
      ],
    },
    {
      title: "Valores",
      fields: [
        { name: "ValorAntigo", label: "Valor de Venda (R$)", type: "text", isMonetary: true },
        {
          name: "ValorAluguelSite",
          label: "Valor de Aluguel (R$)",
          type: "text",
          isMonetary: true,
        },
        {
          name: "ValorCondominio",
          label: "Valor do Condomínio (R$)",
          type: "text",
          isMonetary: true,
        },
        { name: "ValorIptu", label: "Valor do IPTU (R$)", type: "text", isMonetary: true },
      ],
    },
    {
      title: "Corretores Vinculados",
      fields: [
        { name: "Corretor", label: "Corretor", type: "text" },
        {
          name: "Tipo",
          label: "Tipo",
          type: "select",
          options: [
            { value: "Captador", label: "Captador" },
            { value: "Promotor", label: "Promotor" },
          ],
        },
      ],
    },

    {
      title: "Descrições",
      fields: [
        { name: "DescricaoUnidades", label: "Descrição da Unidade", type: "textarea" },
        { name: "DescricaoDiferenciais", label: "Sobre o Condomínio", type: "textarea" },
        { name: "DestaquesLazer", label: "Destaques de Lazer", type: "textarea" },
        { name: "DestaquesLocalizacao", label: "Destaques de Localização", type: "textarea" },
        { name: "FichaTecnica", label: "Ficha Técnica", type: "textarea" },
      ],
    },
    {
      title: "Mídia",
      fields: [
        { name: "Tour360", label: "Link do Tour Virtual 360°", type: "text" },
        {
          name: "Video.1.Video",
          label: "ID do Vídeo (YouTube)",
          type: "text",
          placeholder: "Ex: mdcsckJg7rc",
        },
      ],
    },
    {
      title: "Imagens",
      type: "custom",
      render: () => (
        <div className="w-full space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium text-gray-700">Gerenciar Imagens</h3>
            <button
              type="button"
              onClick={addImage}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Adicionar Imagem
            </button>
          </div>

          <style jsx global>{`
            .flash-update {
              background-color: rgba(59, 130, 246, 0.1);
              transition: background-color 0.3s ease;
            }
          `}</style>

          {formData.Foto && Object.keys(formData.Foto).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 grid-fotos">
              {[...Object.keys(formData.Foto)]
                .sort((a, b) => {
                  // Primeiro, verificar se a ordem existe e usá-la
                  const orderA = formData.Foto[a].Ordem || Object.keys(formData.Foto).indexOf(a);
                  const orderB = formData.Foto[b].Ordem || Object.keys(formData.Foto).indexOf(b);
                  return orderA - orderB;
                })
                .map((codigo, index) => {
                  const image = formData.Foto[codigo];
                  return (
                    <div key={codigo} className="border p-4 rounded-md">
                      <div className="relative mb-3 h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {image.Foto ? (
                          <Image
                            src={image.Foto}
                            alt={`Imagem ${codigo}`}
                            width={300}
                            height={200}
                            className="object-contain w-full h-full"
                            unoptimized
                          />
                        ) : (
                          <PhotoIcon className="w-16 h-16 text-gray-400" />
                        )}
                        <div className="absolute top-0 left-0 bg-black/70 text-white px-2 py-1 text-xs font-semibold">
                          Posição: {index + 1}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL da Imagem
                          </label>
                          <input
                            type="text"
                            value={image.Foto || ""}
                            onChange={(e) => updateImage(codigo, "Foto", e.target.value)}
                            className="border-2 px-3 py-1.5 text-zinc-700 w-full text-sm rounded-md focus:outline-none focus:ring-black focus:border-black"
                            placeholder="https://..."
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`destaque-${codigo}`}
                            checked={image.Destaque === "Sim"}
                            onChange={() => setImageAsHighlight(codigo)}
                            className="h-4 w-4 border-gray-300 rounded text-black focus:ring-black"
                          />
                          <label htmlFor={`destaque-${codigo}`} className="text-sm text-gray-700">
                            Imagem em destaque
                          </label>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeImage(codigo)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 hover:bg-red-50"
                          >
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            Remover
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t">
                          <span className="text-xs text-gray-500">Posição:</span>
                          <select
                            className="border border-gray-300 rounded text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-black"
                            value={index + 1}
                            onChange={(e) =>
                              changeImagePosition(codigo, parseInt(e.target.value, 10))
                            }
                          >
                            {[...Array(Object.keys(formData.Foto).length)].map((_, i) => (
                              <option key={i} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-md">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Nenhuma imagem adicionada ainda.</p>
              <p className="text-sm text-gray-500">Clique em "Adicionar Imagem" para começar.</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <AuthCheck>
      <div className="">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <button type="button" onClick={() => router.push("/admin/imoveis")}>
                <ArrowLeftIcon className="w-10 h-10 mr-2 bg-gray-200 rounded-full p-2" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {isLoading
                  ? "Carregando..."
                  : `Editar Imóvel: ${formData?.Empreendimento} | Código: ${formData?.Codigo}`}
              </h1>
            </div>
            <div>
              <button
                className="bg-gray-200 text-black px-6 py-2 rounded-md font-bold hover:bg-gray-300"
                onClick={() => setShowProprietarios(!showProprietarios)}
              >
                Informações dos Proprietários
              </button>
            </div>
          </div>

          {showProprietarios && <Proprietarios id={id} />}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {fieldGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="bg-white rounded-lg overflow-hidden p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                    {group.title}
                  </h2>
                  {group.type === "custom" ? (
                    group.render()
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.fields.map((field, fieldIndex) => (
                        <div
                          key={fieldIndex}
                          className={field.type === "textarea" ? "col-span-full" : ""}
                        >
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            {field.label}
                          </label>
                          {field.type === "textarea" ? (
                            <textarea
                              id={field.name}
                              name={field.name}
                              value={formData[field.name] || ""}
                              onChange={handleChange}
                              rows={4}
                              className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                            />
                          ) : field.type === "select" ? (
                            <select
                              id={field.name}
                              name={field.name}
                              value={formData[field.name] || ""}
                              onChange={handleChange}
                              className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                            >
                              <option value="">Selecione uma opção</option>
                              {field.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : field.isMonetary ? (
                            <input
                              type="text"
                              id={field.name}
                              name={field.name}
                              value={displayValues[field.name] || ""}
                              onChange={handleChange}
                              className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                              placeholder="R$ 0"
                            />
                          ) : (
                            <input
                              type={field.type}
                              id={field.name}
                              name={field.name}
                              value={
                                field.name === "Video.1.Video"
                                  ? formData?.Video?.[1]?.Video || ""
                                  : formData[field.name] || ""
                              }
                              onChange={handleChange}
                              className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || isLoading}
                  className={`inline-flex items-center px-5 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${isDeleting ? "bg-gray-500" : "bg-red-600 hover:bg-red-700"
                    }`}
                >
                  <TrashIcon className="w-5 h-5 mr-2" />
                  {isDeleting ? "Excluindo..." : "Excluir Imóvel"}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isSaving ? "bg-gray-500" : "bg-black hover:bg-gray-800"
                    }`}
                >
                  {isSaving ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}
