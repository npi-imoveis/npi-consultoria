"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import AuthCheck from "../../../components/auth-check";
import { getImovelById, atualizarImovel, excluirImovel } from "@/app/services";
import { ArrowLeftIcon, ArrowPathIcon, TrashIcon, PlusCircleIcon, XCircleIcon, PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function EditarImovel({ params }) {
  const router = useRouter();
  // Usar React.use() para desempacotar o objeto params (resolução para o aviso do Next.js)
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [imovel, setImovel] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // Função para lidar com mudanças nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Tratamento especial para o campo de vídeo
    if (name === "Video.1.Video") {
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
        { name: "Codigo", label: "Código", type: "text" },
        { name: "Empreendimento", label: "Empreendimento", type: "text" },
        { name: "TituloSite", label: "Título para o Site", type: "text" },
        { name: "Categoria", label: "Categoria", type: "text" },
        { name: "Situacao", label: "Situação", type: "text" },
        { name: "Status", label: "Status", type: "text" },
        { name: "Slug", label: "Slug", type: "text" },
        { name: "Destacado", label: "Destaque (Sim/Não)", type: "text" },
        { name: "Condominio", label: "É Condomínio? (Sim/Não)", type: "text" },
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
        { name: "ValorVenda", label: "Valor de Venda (R$)", type: "text" },
        { name: "ValorAluguelSite", label: "Valor de Aluguel (R$)", type: "text" },
        { name: "ValorCondominio", label: "Valor do Condomínio (R$)", type: "text" },
        { name: "ValorIptu", label: "Valor do IPTU (R$)", type: "text" },
      ],
    },
    {
      title: "Descrições",
      fields: [
        { name: "DescricaoUnidades", label: "Descrição das Unidades", type: "textarea" },
        { name: "DescricaoDiferenciais", label: "Descrição dos Diferenciais", type: "textarea" },
        { name: "DestaquesDiferenciais", label: "Destaques dos Diferenciais", type: "textarea" },
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

          {formData.Foto && Object.keys(formData.Foto).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(formData.Foto).map((codigo) => {
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
                        />
                      ) : (
                        <PhotoIcon className="w-16 h-16 text-gray-400" />
                      )}
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
            <h1 className="text-xl font-bold text-gray-900">
              {isLoading
                ? "Carregando..."
                : `Editar Imóvel: ${formData?.TituloSite || formData?.Titulo || formData?.Codigo || id
                }`}
            </h1>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push("/admin/imoveis")}
                className="inline-flex items-center px-5 py-2 text-xs rounded-md text-gray-700 font-bold hover:text-black/50"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Voltar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isLoading}
                className={`inline-flex items-center px-5 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${isDeleting ? "bg-gray-500" : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                <TrashIcon className="w-5 h-5 mr-2" />
                {isDeleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>

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

              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={() => router.push("/admin/imoveis")}
                  className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 mr-3"
                >
                  Cancelar
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
