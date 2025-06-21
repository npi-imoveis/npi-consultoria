"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthCheck from "../../components/auth-check";
import ImageUploadModal from "./../../components/add-modal";
import Modal from "../../components/modal";
import FormHeader from "./@components/FormHeader";
import FormFooter from "./@components/FormFooter";
import BasicInfoSection from "./@components/sections/BasicInfoSection";
import LocationSection from "./@components/sections/LocationSection";
import FeaturesSection from "./@components/sections/FeaturesSection";
import ValuesSection from "./@components/sections/ValuesSection";
import BrokerSection from "./@components/sections/BrokerSection";
import DescriptionSection from "./@components/sections/DescriptionSection";
import MediaSection from "./@components/sections/MediaSection";
import ImagesSection from "./@components/sections/ImagesSection";
import useImovelForm from "./@components/hooks/useImovelForm";
import useImovelSubmit from "./@components/hooks/useImovelSubmit";
import useImageUpload from "./@components/hooks/useImageUpload";
import useImovelStore from "../../store/imovelStore";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { formatarParaReal } from "@/app/utils/formatter-real";
import ProprietariosSection from "./@components/sections/ProprietariosSection";
import VincularImovelSection from "./@components/sections/VincularImovel";
import { desativarImovel } from "@/app/services";

// Importe dynamic do Next.js
import dynamic from 'next/dynamic';

// Crie um componente wrapper dinâmico para o conteúdo principal da página
// Isso garante que o conteúdo dentro de ImovelGerenciarContent só será renderizado no cliente
const ImovelGerenciarContent = dynamic(() => Promise.resolve(function ImovelGerenciarContent({
  isModalOpen, setIsModalOpen, showProprietarios, setShowProprietarios,
  showVincularImovel, setShowVincularImovel, isDesativando, setIsDesativando,
  router, imovelSelecionado, mode, limparImovelSelecionado, isAutomacao,
  formData, setFormData, displayValues, setDisplayValues, handleChange,
  newImovelCode, fileInputRef, showImageModal, setShowImageModal, addImage,
  addSingleImage, updateImage, removeImage, setImageAsHighlight, changeImagePosition,
  validation, handleImagesUploaded, handleSubmit, isSaving, error, success,
  setError, setSuccess, handleFileUpload, handleFileInputChange, getFormTitle,
  handleCancel, toggleProprietarios, toggleVincularImovel, handleDesativarImovel,
  title, description
}) {
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
          title={title()}
          description={description()}
          buttonText="Ver no site"
          link={`/imovel-${formData.Codigo || newImovelCode}/${formData?.Slug}`}
        />
      )}

      <div className="">
        <FormHeader
          title={getFormTitle()}
          error={error}
          success={success}
          isAutomacao={isAutomacao}
        />
        <div className="flex justify-between gap-2 py-4">
          {formData.Ativo === "Sim" && (
            <button
              onClick={handleDesativarImovel}
              disabled={isDesativando || mode !== "edit"}
              className={`border-2 bg-red-100 font-bold px-4 py-2 rounded-md min-w-[180px] ${
                isDesativando
                  ? "bg-red-300 text-red-500 cursor-not-allowed"
                  : mode !== "edit"
                  ? "bg-red-100 text-red-400 cursor-not-allowed border-red-200"
                  : "text-red-700 hover:text-red-900 hover:border-red-400"
              }`}
            >
              {isDesativando ? "Desativando..." : "Desativar Imóvel"}
            </button>
          )}
          <div className="w-full flex justify-end gap-2">
            <button
              onClick={toggleProprietarios}
              className={`font-bold px-4 py-2 rounded-md ${
                showProprietarios
                  ? "bg-[#8B6F48] text-white hover:bg-[#8B6F48]/40"
                  : "bg-gray-200 text-gray-500 hover:bg-gray-300"
              }`}
            >
              Proprietários
            </button>

            {/* Only show the Vincular Imóvel button in edit mode and if Automacao is true */}
            {mode === "edit" && (
              <button
                onClick={toggleVincularImovel}
                className={`font-bold px-4 py-2 rounded-md ${
                  showVincularImovel
                    ? "bg-[#8B6F48] text-white hover:bg-[#8B6F48]/40"
                    : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                }`}
              >
                Duplicar Imóvel
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {showProprietarios && (
            <ProprietariosSection id={formData.Codigo} key="proprietarios-section" />
          )}
          {showVincularImovel && (
            <VincularImovelSection
              formData={formData}
              displayValues={displayValues}
              onChange={handleChange}
              validation={validation}
              key="vincular-section"
            />
          )}

          {/* Basic Info Section with updated Ativo field */}
          <BasicInfoSection
            formData={{
              ...formData,
              Ativo: formData.Ativo || "Sim",
            }}
            displayValues={displayValues}
            onChange={handleChange}
            validation={validation}
            key="basic-info-section"
          />

          {/* Location Section */}
          <LocationSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChange}
            validation={validation}
            key="location-section"
          />

          {/* Features Section */}
          <FeaturesSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChange}
            key="features-section"
          />

          {/* Values Section */}
          <ValuesSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChange}
            key="values-section"
          />

          {/* Broker Section */}
          <BrokerSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChange}
            key="broker-section"
          />

          {/* Description Section */}
          <DescriptionSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChange}
            key="description-section"
          />

          {/* Media Section */}
          <MediaSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChange}
            key="media-section"
          />

          {/* Images Section */}
          <ImagesSection
            formData={formData}
            addSingleImage={addSingleImage}
            showImageModal={addImage}
            updateImage={updateImage}
            removeImage={removeImage}
            setImageAsHighlight={setImageAsHighlight}
            changeImagePosition={changeImagePosition}
            validation={validation}
            key="images-section"
          />
          {error && (
            <div className="bg-red-100 p-4 text-red-500 rounded-lg">
              {error}: verifique se esse imóvel já esta cadastrado anteriormente.
            </div>
          )}

          <FormFooter
            isSaving={isSaving}
            isValid={validation.isFormValid}
            isEditMode={mode === "edit"}
            onCancel={handleCancel}
            key="form-footer"
          />
        </form>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: "none" }}
        />
      </div>
    </AuthCheck>
  );
}), { ssr: false }); // MUITO IMPORTANTE: ssr: false aqui

export default function GerenciarImovel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProprietarios, setShowProprietarios] = useState(false);
  const [showVincularImovel, setShowVincularImovel] = useState(false);
  const [isDesativando, setIsDesativando] = useState(false);
  const router = useRouter();

  // Acessar o store para verificar se estamos em modo de edição
  const imovelSelecionado = useImovelStore((state) => state.imovelSelecionado);
  const mode = useImovelStore((state) => state.mode);
  const limparImovelSelecionado = useImovelStore((state) => state.limparImovelSelecionado);

  // Check if Automacao is true in the selected property
  const isAutomacao = imovelSelecionado?.Automacao === true;

  const {
    formData,
    setFormData,
    displayValues,
    setDisplayValues,
    handleChange,
    newImovelCode,
    fileInputRef,
    showImageModal,
    setShowImageModal,
    addImage,
    addSingleImage,
    updateImage,
    removeImage,
    setImageAsHighlight,
    changeImagePosition,
    validation,
    handleImagesUploaded,
  } = useImovelForm();

  const { handleSubmit, isSaving, error, success, setError, setSuccess } = useImovelSubmit(
    formData,
    setIsModalOpen,
    mode
  );

  const { handleFileUpload } = useImageUpload(updateImage, setSuccess, setError);

  // Carregar dados do imóvel do store se estiver no modo de edição
  useEffect(() => {
    if (imovelSelecionado && mode === "edit") {
      // Formatação de valores monetários para exibição
      const formatMonetaryDisplayValues = () => {
        const displayObj = {};

        // Processar os valores monetários
        ["ValorAntigo", "ValorAluguelSite", "ValorCondominio", "ValorIptu"].forEach((field) => {
          if (imovelSelecionado[field]) {
            // Converte para número
            const value =
              typeof imovelSelecionado[field] === "string"
                ? imovelSelecionado[field].replace(/\D/g, "")
                : imovelSelecionado[field];

            // Formata como moeda
            displayObj[field] = formatarParaReal(value);
          }
        });

        return displayObj;
      };

      // Processar dados de fotos para o formato correto
      const processPhotos = () => {
        if (!imovelSelecionado.Foto) return [];

        // Se já for um array, usá-lo diretamente
        if (Array.isArray(imovelSelecionado.Foto)) {
          return imovelSelecionado.Foto.map((foto, index) => ({
            ...foto,
            Codigo: `photo-${Date.now()}-${index}`,
            Destaque: foto.Destaque || "Nao",
            Ordem: foto.Ordem || index + 1,
          }));
        }

        // Se for um objeto, converter para array
        if (typeof imovelSelecionado.Foto === "object") {
          return Object.keys(imovelSelecionado.Foto).map((key, index) => {
            const foto = imovelSelecionado.Foto[key];
            return {
              ...foto,
              Codigo: key,
              Destaque: foto.Destaque || "Nao",
              Ordem: foto.Ordem || index + 1,
            };
          });
        }

        return [];
      };

      // Processar dados de vídeo
      const processVideos = () => {
        if (!imovelSelecionado.Video) return {};

        // Converte o array de vídeos para o formato de objeto usado no formulário
        const videosObj = {};

        if (Array.isArray(imovelSelecionado.Video)) {
          imovelSelecionado.Video.forEach((video) => {
            if (video.Codigo) {
              videosObj[video.Codigo] = {
                ...video,
              };
            }
          });
        }

        return videosObj;
      };

      // Preenche o formData com os dados do imóvel
      setFormData({
        ...imovelSelecionado,
        Foto: processPhotos(),
        Video: processVideos(),
        // Garante que o Slug seja gerado corretamente a partir do Empreendimento
        Slug: formatterSlug(imovelSelecionado.Empreendimento || ""),
      });

      // Atualiza os valores de exibição formatados
      setDisplayValues(formatMonetaryDisplayValues());
    }
  }, [imovelSelecionado, mode, setFormData, setDisplayValues]);

  // Limpar imóvel selecionado quando componente for desmontado
  useEffect(() => {
    return () => {
      // Não limpamos ao desmontar para manter o imóvel no store
      // para caso o usuário retorne à página
    };
  }, []);

  // Handler for file input change
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const codigo = fileInputRef.current.getAttribute("data-codigo");
      handleFileUpload(codigo, files[0]);
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = "";
    }
  };

  // Determinar o título do formulário com base no modo
  const getFormTitle = () => {
    if (mode === "edit" && formData.Empreendimento) {
      return `Editar Imóvel: ${formData.Empreendimento}`;
    }
    return "Cadastrar Novo Imóvel";
  };

  // Cancelar edição e voltar para o modo de criação
  // Importante: Esta função limpa o store antes de navegar para evitar
  // que dados persistam indevidamente entre sessões
  const handleCancel = () => {
    // Determinar para qual página redirecionar com base na propriedade Automacao
    const redirectPath =
      imovelSelecionado && imovelSelecionado.Automacao === false
        ? "/admin/imoveis"
        : "/admin/automacao";

    // Limpar o imóvel selecionado e histórico no store
    limparImovelSelecionado();

    // Redirecionar usando o Next.js router
    router.push(redirectPath);
  };

  // Toggle functions with mutual exclusivity
  const toggleProprietarios = () => {
    setShowProprietarios(!showProprietarios);
    // Close the other section if it's open
    if (!showProprietarios && showVincularImovel) {
      setShowVincularImovel(false);
    }
  };

  const toggleVincularImovel = () => {
    setShowVincularImovel(!showVincularImovel);
    // Close the other section if it's open
    if (!showVincularImovel && showProprietarios) {
      setShowProprietarios(false);
    }
  };

  // Função para desativar o imóvel
  const handleDesativarImovel = async () => {
    if (!formData.Codigo) {
      setError("Não é possível desativar um imóvel sem código.");
      return;
    }

    // Adicionando a verificação para window
    if (typeof window !== 'undefined' && !window.confirm(
        "Tem certeza que deseja desativar este imóvel? Ele será movido para a lista de imóveis inativos."
      )
    ) {
      return;
    }

    setIsDesativando(true);
    setError("");
    setSuccess("");

    try {
      const result = await desativarImovel(formData.Codigo);
      if (result && result.success) {
        setSuccess("Imóvel desativado com sucesso!");
        setTimeout(() => {
          router.push("/admin/imoveis");
        }, 2000);
      } else {
        setError(result?.message || "Erro ao desativar imóvel");
      }
    } catch (error) {
      console.error("Erro ao desativar imóvel:", error);
      setError("Ocorreu um erro ao desativar o imóvel");
    } finally {
      setIsDesativando(false);
    }
  };

  const title = () => {
    if (isAutomacao) return "Imóvel cadastrado com sucesso";
    if (mode === "create") return "Imóvel cadastrado com sucesso";
    if (mode === "edit") return `Imóvel ${formData?.Empreendimento} atualizado com sucesso`;
    return "";
  };

  const description = () => {
    if (isAutomacao)
      return `O imóvel ${formData?.Empreendimento} foi cadastrado com sucesso com o código ${newImovelCode}. Ele agora está disponível na lista de imóveis do site.`; // ou algum valor padrão
    if (mode === "create")
      return `O imóvel ${formData?.Empreendimento} foi cadastrado com sucesso com o código ${newImovelCode}. Ele agora está disponível na lista de imóveis do site.`;
    if (mode === "edit")
      return `O imóvel ${formData?.Empreendimento} com Código ${formData?.Codigo} foi atualizado com sucesso.`;
    return "";
  };

  // Coleta todas as props que o ImovelGerenciarContent precisa
  const contentProps = {
    isModalOpen, setIsModalOpen, showProprietarios, setShowProprietarios,
    showVincularImovel, setShowVincularImovel, isDesativando, setIsDesativando,
    router, imovelSelecionado, mode, limparImovelSelecionado, isAutomacao,
    formData, setFormData, displayValues, setDisplayValues, handleChange,
    newImovelCode, fileInputRef, showImageModal, setShowImageModal, addImage,
    addSingleImage, updateImage, removeImage, setImageAsHighlight, changeImagePosition,
    validation, handleImagesUploaded, handleSubmit, isSaving, error, success,
    setError, setSuccess, handleFileUpload, handleFileInputChange, getFormTitle,
    handleCancel, toggleProprietarios, toggleVincularImovel, handleDesativarImovel,
    title, description
  };

  return (
    <ImovelGerenciarContent {...contentProps} />
  );
}
