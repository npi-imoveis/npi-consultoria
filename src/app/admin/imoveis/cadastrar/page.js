"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthCheck from "../../components/auth-check";
import { cadastrarImovel, getImoveisByFilters } from "@/app/services";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  XCircleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { getImageUploadMetadata, uploadToS3 } from "@/app/utils/s3-upload";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { formatterNumber } from "@/app/utils/formatter-number";
import ImageUploadModal from "./../../components/add-modal";
import Modal from "../../components/modal";

export default function CadastrarImovel() {
  const router = useRouter();
  const provider = new OpenStreetMapProvider();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newImovelCode, setNewImovelCode] = useState("");

  const [formData, setFormData] = useState({
    Codigo: "",
    Empreendimento: "",
    TituloSite: "",
    Categoria: "",
    Situacao: "",
    Status: "",
    Slug: "",
    Destacado: "Não",
    Condominio: "Não",
    CondominioDestaque: "Não",
    Ativo: "Sim",
    Construtora: "",
    Endereco: "",
    Numero: "",
    Complemento: "",
    Bairro: "",
    BairroComercial: "",
    Cidade: "",
    UF: "",
    CEP: "",
    Latitude: "",
    Longitude: "",
    AreaPrivativa: "",
    AreaTotal: "",
    Dormitorios: "",
    Suites: "",
    BanheiroSocialQtd: "",
    Vagas: "",
    AnoConstrucao: "",
    ValorAntigo: "",
    ValorAluguelSite: "",
    ValorCondominio: "",
    ValorIptu: "",
    DescricaoUnidades: "",
    DescricaoDiferenciais: "",
    DestaquesDiferenciais: "",
    DestaquesLazer: "",
    DestaquesLocalizacao: "",
    FichaTecnica: "",
    Tour360: "",
    Corretor: "",
    Tipo: "",
    Video: {
      1: {
        Codigo: "1",
        Destaque: "Nao",
        Tipo: "youtube",
        Video: "",
        VideoCodigo: "1",
      },
    },
    Foto: {},
  });

  const [displayValues, setDisplayValues] = useState({
    ValorAntigo: "",
    ValorAluguelSite: "",
    ValorCondominio: "",
    ValorIptu: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const newCode = generateRandomCode();
    setNewImovelCode(newCode);
    setFormData((prevData) => ({
      ...prevData,
      Codigo: newCode,
    }));
  }, []);
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

  // Função para buscar coordenadas usando OpenStreetMap
  const fetchCoordinates = async (address) => {
    try {
      const searchQuery = `${address.logradouro}, ${address.bairro}, ${address.localidade} - ${address.uf}, ${address.cep}, Brasil`;
      const results = await provider.search({ query: searchQuery });

      if (results && results.length > 0) {
        const { y: lat, x: lng } = results[0];
        return { latitude: lat, longitude: lng };
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
      return null;
    }
  };

  // Função para buscar endereço pelo CEP
  const fetchAddressByCep = async (cep) => {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, "");

    // Verifica se o CEP tem 8 dígitos
    if (cleanCep.length !== 8) return;

    try {
      setIsSaving(true); // Usa o mesmo estado para indicar carregamento
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        // Buscar coordenadas após obter o endereço
        const coordinates = await fetchCoordinates(data);

        setFormData((prevData) => ({
          ...prevData,
          Endereco: data.logradouro || prevData.Endereco,
          Bairro: data.bairro || prevData.Bairro,
          BairroComercial: data.bairro || prevData.Bairro, // Preenche BairroComercial com o mesmo valor do Bairro
          Cidade: data.localidade || prevData.Cidade,
          UF: data.uf || prevData.UF,
          Latitude: coordinates?.latitude?.toString() || prevData.Latitude,
          Longitude: coordinates?.longitude?.toString() || prevData.Longitude,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Função para lidar com mudanças nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Tratamento especial para campos monetários
    if (["ValorAntigo", "ValorAluguelSite", "ValorCondominio", "ValorIptu"].includes(name)) {
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
            Codigo: prevData.Video?.[1]?.Codigo || "1",
            Destaque: prevData.Video?.[1]?.Destaque || "Nao",
            Tipo: "youtube",
            Video: value,
            VideoCodigo: prevData.Video?.[1]?.VideoCodigo || "1",
          },
        },
      }));
    } else {
      setFormData((prevData) => {
        // Se o campo alterado for Empreendimento, gerar o slug automaticamente
        if (name === "Empreendimento") {
          return {
            ...prevData,
            [name]: value,
            Slug: formatterSlug(value),
          };
        }

        // Se o campo alterado for CEP, buscar o endereço
        if (name === "CEP" && value.length >= 8) {
          // Permite executar apenas quando tiver 8 ou mais caracteres
          fetchAddressByCep(value);
        }

        return {
          ...prevData,
          [name]: value,
        };
      });
    }
  };

  // Função para adicionar imagens via modal
  const addImage = () => {
    setShowImageModal(true);
  };

  // Função para adicionar uma imagem manualmente (para compatibilidade)
  const addSingleImage = () => {
    const newImageCode = Date.now().toString(); // Gera um código único baseado no timestamp
    setFormData((prevData) => {
      const newFoto = {
        ...(prevData.Foto || {}),
        [newImageCode]: {
          Codigo: newImageCode,
          Destaque: "Nao",
          Foto: "", // URL da imagem será adicionada pelo usuário
          isUploading: false,
        },
      };
      return {
        ...prevData,
        Foto: newFoto,
      };
    });
  };

  // Função para processar as imagens enviadas pelo modal
  const handleImagesUploaded = (uploadedImages) => {
    if (!uploadedImages.length) return;

    setFormData((prevData) => {
      const newFoto = { ...(prevData.Foto || {}) };

      // Adiciona as novas imagens ao objeto Foto
      uploadedImages.forEach((image) => {
        newFoto[image.Codigo] = {
          Codigo: image.Codigo,
          Destaque: image.Destaque || "Nao",
          Foto: image.Foto,
        };
      });

      return {
        ...prevData,
        Foto: newFoto,
      };
    });

    // Exibe mensagem de sucesso
    setSuccess(`${uploadedImages.length} imagem(ns) enviada(s) com sucesso!`);
    setTimeout(() => {
      setSuccess("");
    }, 3000);
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

  const generateRandomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Função para lidar com upload de arquivo
  const handleFileUpload = async (codigo, file) => {
    try {
      // Indicar que o upload está em andamento
      updateImage(codigo, "isUploading", true);

      // Obter metadados para upload
      const metadata = await getImageUploadMetadata(file);

      // Fazer upload para S3 via API
      const success = await uploadToS3(metadata);

      if (success) {
        // Atualizar URL da imagem no estado
        updateImage(codigo, "Foto", metadata.fileUrl);
        updateImage(codigo, "isUploading", false);
        setSuccess("Imagem enviada com sucesso para o Amazon S3!");
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        throw new Error("Falha ao fazer upload da imagem");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      setError("Erro ao fazer upload da imagem: " + error.message);
      updateImage(codigo, "isUploading", false);
    }
  };

  // Função para acionar o input de arquivo
  const triggerFileInput = (codigo) => {
    // Armazenar o código atual para uso quando o arquivo for selecionado
    fileInputRef.current.setAttribute("data-codigo", codigo);
    fileInputRef.current.click();
  };

  // Função para lidar com a seleção de arquivos
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const codigo = fileInputRef.current.getAttribute("data-codigo");
      handleFileUpload(codigo, files[0]);
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = "";
    }
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
        Foto: Object.keys(newFoto).length > 0 ? newFoto : {},
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
    setFormData((prevData) => {
      if (!prevData.Foto) return prevData;

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
      const fotosArray = formData.Foto ? Object.values(formData.Foto) : [];

      const payload = {
        ...formData,

        ValorAntigo: formatterNumber(formData.ValorAntigo),
        Foto: fotosArray,
      };

      const result = await cadastrarImovel(payload);
      if (result && result.success) {
        setNewImovelCode(newCode);
        setSuccess("Imóvel cadastrado com sucesso!");
        setIsModalOpen(true);
      } else {
        setError(result?.message || "Erro ao cadastrar imóvel");
      }
    } catch (error) {
      console.error("Erro ao cadastrar imóvel:", error);
      setError("Ocorreu um erro ao salvar o imóvel");
    } finally {
      setIsSaving(false);
    }
  };

  // Agrupar campos por categorias para melhor organização
  const fieldGroups = [
    {
      title: "Informações Básicas",
      fields: [
        { name: "Codigo", label: "Código (Gerado automaticamente)", type: "text", disabled: true },
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
        {
          name: "Categoria",
          label: "Categoria",
          type: "select",
          options: [
            { value: "Apartamento", label: "Apartamento" },
            { value: "Casa", label: "Casa" },
            { value: "Casa Comercial", label: "Casa Comercial" },
            { value: "Casa em Condominio", label: "Casa em Condominio" },
            { value: "Cobertura", label: "Cobertura" },
            { value: "Flat", label: "Flat" },
            { value: "Garden", label: "Garden" },
            { value: "Loft", label: "Loft" },
            { value: "Loja", label: "Loja" },
            { value: "Prédio Comercial", label: "Prédio Comercial" },
            { value: "Sala Comercial", label: "Sala Comercial" },
            { value: "Terreno", label: "Terreno" },
          ],
        },
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
        { name: "CEP", label: "CEP", type: "text" },
        { name: "Endereco", label: "Endereço", type: "text" },
        { name: "Numero", label: "Número", type: "text" },
        { name: "Complemento", label: "Complemento", type: "text" },
        { name: "Bairro", label: "Bairro", type: "text" },
        { name: "BairroComercial", label: "Bairro Comercial", type: "text" },
        { name: "Cidade", label: "Cidade", type: "text" },
        { name: "UF", label: "UF", type: "text" },
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addSingleImage}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Adicionar URL
              </button>
              <button
                type="button"
                onClick={addImage}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Upload de Imagens
              </button>
            </div>
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
      {showImageModal && (
        <ImageUploadModal
          title="Upload de Imagens"
          onClose={() => setShowImageModal(false)}
          onUploadComplete={handleImagesUploaded}
        />
      )}
      {isModalOpen && (
        <Modal
          title="Imóvel Cadastrado com Sucesso"
          description={`O imóvel ${formData?.Empreendimento} foi cadastrado com sucesso com o código ${newImovelCode}! Ele agora está disponível na lista de imóveis do site.`}
          buttonText="Ver no site"
          link={`/imovel-${newImovelCode}/${formData?.Slug}`}
        />
      )}
      <div className="">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-gray-900">Cadastrar Novo Imóvel</h1>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push("/admin/imoveis")}
                className="inline-flex items-center px-5 py-2 text-xs rounded-md text-gray-700 font-bold hover:text-black/50"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Voltar
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
                            placeholder={field.placeholder || ""}
                            disabled={field.disabled}
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
                className={`inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  isSaving ? "bg-gray-500" : "bg-black hover:bg-gray-800"
                }`}
              >
                {isSaving ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Cadastrar Imóvel"
                )}
              </button>
            </div>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: "none" }}
          />
        </div>
      </div>
    </AuthCheck>
  );
}
