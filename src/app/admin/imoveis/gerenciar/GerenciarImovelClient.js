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

export default function GerenciarImovelClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProprietarios, setShowProprietarios] = useState(false);
  const [showVincularImovel, setShowVincularImovel] = useState(false);
  const [isDesativando, setIsDesativando] = useState(false);
  const [downloadingPhotos, setDownloadingPhotos] = useState(false);
  const router = useRouter();

  const imovelSelecionado = useImovelStore((state) => state.imovelSelecionado);
  const mode = useImovelStore((state) => state.mode);
  const limparImovelSelecionado = useImovelStore((state) => state.limparImovelSelecionado);
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
    removeAllImages,
    setImageAsHighlight,
    changeImagePosition,
    validation,
    handleImagesUploaded,
  } = useImovelForm();

  const { handleSubmit, isSaving, error, success, setError, setSuccess } = useImovelSubmit(
    formData,
    setIsModalOpen,
    mode,
    imovelSelecionado?._id
  );

  const { handleFileUpload } = useImageUpload(updateImage, setSuccess, setError);

  const downloadAllPhotos = async () => {
    if (!formData.Foto || formData.Foto.length === 0) {
      setError('Não há fotos para baixar');
      return;
    }

    setDownloadingPhotos(true);
    setError('');
    
    try {
      const downloadPromises = formData.Foto.map((photo, index) => {
        return new Promise((resolve) => {
          const link = document.createElement('a');
          link.href = photo.Foto;
          link.download = `imovel-${formData.Codigo || 'novo'}-${index + 1}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          resolve();
        });
      });

      await Promise.all(downloadPromises);
      setSuccess(`Download de ${formData.Foto.length} fotos concluído`);
    } catch (err) {
      console.error('Erro ao baixar fotos:', err);
      setError('Erro durante o download das fotos');
    } finally {
      setDownloadingPhotos(false);
    }
  };

  useEffect(() => {
    if (imovelSelecionado && mode === "edit") {
      const formatMonetaryDisplayValues = () => {
        const displayObj = {};
        ["ValorAntigo", "ValorAluguelSite", "ValorCondominio", "ValorIptu"].forEach((field) => {
          if (imovelSelecionado[field]) {
            const value = typeof imovelSelecionado[field] === "string"
              ? imovelSelecionado[field].replace(/\D/g, "")
              : imovelSelecionado[field];
            displayObj[field] = formatarParaReal(value);
          }
        });
        return displayObj;
      };

      const processPhotos = () => {
        if (!imovelSelecionado.Foto) return [];
        if (Array.isArray(imovelSelecionado.Foto)) {
          return imovelSelecionado.Foto.map((foto, index) => ({
            ...foto,
            Codigo: `photo-${Date.now()}-${index}`,
            Destaque: foto.Destaque || "Nao",
            Ordem: foto.Ordem || index + 1,
          }));
        }
        if (typeof imovelSelecionado.Foto === "object") {
          return Object.keys(imovelSelecionado.Foto).map((key, index) => ({
            ...imovelSelecionado.Foto[key],
            Codigo: key,
            Destaque: imovelSelecionado.Foto[key].Destaque || "Nao",
            Ordem: imovelSelecionado.Foto[key].Ordem || index + 1,
          }));
        }
        return [];
      };

      const processVideos = () => {
        console.log('🐛 DEBUG processVideos - DADOS RECEBIDOS:', {
          'imovelSelecionado completo': imovelSelecionado,
          'imovelSelecionado.Video RAW': imovelSelecionado.Video,
          'tipo': typeof imovelSelecionado.Video,
          'isArray': Array.isArray(imovelSelecionado.Video),
          'isObject': typeof imovelSelecionado.Video === 'object',
          'keys': imovelSelecionado.Video ? Object.keys(imovelSelecionado.Video) : 'sem keys',
          'JSON.stringify': JSON.stringify(imovelSelecionado.Video)
        });
        
        if (!imovelSelecionado.Video) {
          console.log('❌ Video é falsy, retornando {}');
          return {};
        }
        
        if (typeof imovelSelecionado.Video === 'object' && !Array.isArray(imovelSelecionado.Video)) {
          console.log('✅ Usando estrutura objeto:', imovelSelecionado.Video);
          return imovelSelecionado.Video;
        }
        
        if (Array.isArray(imovelSelecionado.Video)) {
          const videosObj = {};
          imovelSelecionado.Video.forEach((video, index) => {
            if (video.Video) {
              videosObj[index + 1] = { Video: video.Video };
            }
          });
          console.log('🔄 Convertido de array:', videosObj);
          return videosObj;
        }
        
        if (typeof imovelSelecionado.Video === 'string') {
          const videoObj = {
            "1": {
              Video: imovelSelecionado.Video
            }
          };
          console.log('🛡️ Convertido de string:', videoObj);
          return videoObj;
        }
        
        console.log('❓ Tipo desconhecido, retornando {}');
        return {};
      };

      setFormData({
        ...imovelSelecionado,
        Foto: processPhotos(),
        Video: processVideos(),
        Slug: formatterSlug(imovelSelecionado.Empreendimento || ""),
      });

      setDisplayValues(formatMonetaryDisplayValues());
    }
  }, [imovelSelecionado, mode, setFormData, setDisplayValues]);

  useEffect(() => {
    return () => {
      // Não limpamos ao desmontar para manter o estado
    };
  }, []);

  // CSS para esconder elementos de vídeo indesejados em campos de formulário
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      input[type="text"] video,
      input[type="number"] video,
      input:not([type="file"]) video,
      input:not([type="file"]) audio,
      .form-field video:not(.media-preview),
      [data-field] video:not([data-video-preview]),
      input + video,
      input ~ video {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const codigo = fileInputRef.current.getAttribute("data-codigo");
      handleFileUpload(codigo, files[0]);
      e.target.value = "";
    }
  };

  const getFormTitle = () => {
    if (mode === "edit" && formData.Empreendimento) {
      return `Editar Imóvel: ${formData.Empreendimento}`;
    }
    return "Cadastrar Novo Imóvel";
  };

  const handleCancel = () => {
    const redirectPath = imovelSelecionado && imovelSelecionado.Automacao === false
      ? "/admin/imoveis"
      : "/admin/automacao";
    limparImovelSelecionado();
    router.push(redirectPath);
  };

  const toggleProprietarios = () => {
    setShowProprietarios(!showProprietarios);
    if (!showProprietarios && showVincularImovel) {
      setShowVincularImovel(false);
    }
  };

  const toggleVincularImovel = () => {
    setShowVincularImovel(!showVincularImovel);
    if (!showVincularImovel && showProprietarios) {
      setShowProprietarios(false);
    }
  };

  const handleDesativarImovel = async () => {
    if (!formData.Codigo) {
      setError("Não é possível desativar um imóvel sem código.");
      return;
    }

    if (typeof window !== 'undefined' && !window.confirm(
        "Tem certeza que deseja desativar este imóvel? Ele será movido para a lista de imóveis inativos."
      )) {
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
    if (isAutomacao) return `O imóvel ${formData?.Empreendimento} foi cadastrado com sucesso com o código ${newImovelCode}.`;
    if (mode === "create") return `O imóvel ${formData?.Empreendimento} foi cadastrado com sucesso com o código ${newImovelCode}.`;
    if (mode === "edit") return `O imóvel ${formData?.Empreendimento} com Código ${formData?.Codigo} foi atualizado com sucesso.`;
    return "";
  };

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

          <BasicInfoSection
            formData={{ ...formData, Ativo: formData.Ativo || "Sim" }}
            displayValues={displayValues}
            onChange={handleChange}
            validation={validation}
            key="basic-info-section"
          />

          <LocationSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChange}
            validation={validation}
            key="location-section"
          />

          <FeaturesSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChange}
            key="features-section"
          />

          <ValuesSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChange}
            key="values-section"
          />

          <BrokerSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChange}
            key="broker-section"
          />

          <DescriptionSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChange}
            key="description-section"
          />

          <MediaSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChange}
            key="media-section"
          />

          <ImagesSection
            formData={formData}
            addSingleImage={addSingleImage}
            showImageModal={addImage}
            updateImage={updateImage}
            removeImage={removeImage}
            removeAllImages={removeAllImages}
            downloadAllPhotos={downloadAllPhotos}
            downloadingPhotos={downloadingPhotos}
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
}
