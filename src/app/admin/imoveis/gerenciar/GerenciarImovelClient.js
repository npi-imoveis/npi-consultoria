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
  const [hasChanges, setHasChanges] = useState(false);
  
  // 🔥 ESTADO PARA CONTROLAR CARREGAMENTO INICIAL
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
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

  // 🔥 FUNÇÃO CRÍTICA: ATUALIZAÇÃO DE FOTOS SEM REORDENAR
  const handleUpdatePhotos = (fotosAtualizadas) => {
    console.group('📸 PARENT: Atualizando fotos no formData');
    console.log('📸 Total de fotos recebidas:', fotosAtualizadas.length);
    
    if (fotosAtualizadas.length > 0) {
      console.log('📸 Primeiras 3 fotos com suas ordens:');
      fotosAtualizadas.slice(0, 3).forEach((foto, index) => {
        console.log(`  ${index + 1}. Código: ${foto.Codigo}, Ordem: ${foto.Ordem}, Tipo: ${foto.tipoOrdenacao}`);
      });
      
      // 🔥 CRITICAL: Verificar se as ordens estão corretas
      const ordensSequenciais = fotosAtualizadas.map(f => f.Ordem).join(',');
      console.log('📊 Sequência de ordens:', ordensSequenciais);
    }
    
    // 🚀 ATUALIZAR ESTADO SEM MODIFICAR AS FOTOS
    setFormData(prev => ({
      ...prev,
      Foto: fotosAtualizadas // ← Preservar ordem exata recebida
    }));
    
    setHasChanges(true);
    console.groupEnd();
  };

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

  // 🔥 USEEFFECT OTIMIZADO PARA CARREGAMENTO INICIAL - NÃO REORDENAR
  useEffect(() => {
    if (imovelSelecionado && mode === "edit" && isInitialLoad) {
      console.group('🏠 Carregando dados do imóvel para edição');
      
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

      // 🔥 PROCESSAMENTO DE FOTOS CRÍTICO - PRESERVAR ORDEM EXATA DO BANCO
      const processPhotos = () => {
        if (!imovelSelecionado.Foto) return [];
        
        let fotosProcessadas = [];
        
        if (Array.isArray(imovelSelecionado.Foto)) {
          console.log('📸 Fotos já em formato array:', imovelSelecionado.Foto.length);
          
          // 🚀 PRESERVAR ORDEM EXATA DO BANCO - NÃO REORDENAR!
          fotosProcessadas = imovelSelecionado.Foto.map((foto, index) => {
            const fotoProcessada = {
              ...foto,
              Codigo: foto.Codigo || `photo-${Date.now()}-${index}`,
              Destaque: foto.Destaque || "Nao",
              // 🔥 CRITICAL: Preservar campo Ordem se existir, senão usar ordem/index
              Ordem: foto.Ordem !== undefined && foto.Ordem !== null ? foto.Ordem :
                     foto.ordem !== undefined && foto.ordem !== null ? foto.ordem :
                     index,
              tipoOrdenacao: 'banco' // Marcar como vindo do banco
            };
            
            // Remover campo conflitante
            delete fotoProcessada.ordem;
            
            return fotoProcessada;
          });
          
          // 🔥 VERIFICAR SE TEM ORDEM MANUAL SALVA
          const temOrdemManual = fotosProcessadas.some(f => 
            typeof f.Ordem === 'number' && f.Ordem >= 0
          );
          
          console.log('📸 Tem ordem manual salva no banco?', temOrdemManual);
          
          if (temOrdemManual) {
            // 🚀 SE TEM ORDEM MANUAL, PRESERVAR ORDEM EXATA
            console.log('📸 Preservando ordem manual do banco');
            
            // Verificar se ordens fazem sentido
            const ordens = fotosProcessadas.map(f => f.Ordem).sort((a, b) => a - b);
            const isSequential = ordens.every((ordem, index) => ordem === index);
            
            if (isSequential) {
              // Ordem sequencial válida - manter como está
              console.log('✅ Ordem sequencial válida detectada');
            } else {
              // Ordem não sequencial - pode ter gaps, normalizar
              console.log('⚠️ Ordem não sequencial, normalizando...');
              fotosProcessadas.sort((a, b) => a.Ordem - b.Ordem);
              fotosProcessadas = fotosProcessadas.map((foto, index) => ({
                ...foto,
                Ordem: index
              }));
            }
          } else {
            console.log('📸 Sem ordem manual detectada - usando ordem do array');
            // Aplicar ordem baseada na posição no array
            fotosProcessadas = fotosProcessadas.map((foto, index) => ({
              ...foto,
              Ordem: index,
              tipoOrdenacao: 'array'
            }));
          }
          
        } else if (typeof imovelSelecionado.Foto === "object") {
          console.log('📸 Convertendo fotos de objeto para array');
          
          const entries = Object.entries(imovelSelecionado.Foto);
          fotosProcessadas = entries.map(([key, foto], index) => ({
            ...foto,
            Codigo: key,
            Destaque: foto.Destaque || "Nao",
            Ordem: foto.Ordem !== undefined ? foto.Ordem : 
                   foto.ordem !== undefined ? foto.ordem : index,
            tipoOrdenacao: 'objeto'
          }));
        }
        
        console.log('📸 Fotos processadas:', {
          total: fotosProcessadas.length,
          primeirasFotosOrdem: fotosProcessadas.slice(0, 5).map(f => ({ 
            codigo: f.Codigo?.substring(0, 15) + '...', 
            Ordem: f.Ordem,
            tipoOrdenacao: f.tipoOrdenacao
          }))
        });
        
        return fotosProcessadas;
      };

      const processVideos = () => {
        if (!imovelSelecionado.Video) return {};
        const videosObj = {};
        if (Array.isArray(imovelSelecionado.Video)) {
          imovelSelecionado.Video.forEach((video) => {
            if (video.Codigo) {
              videosObj[video.Codigo] = { ...video };
            }
          });
        }
        return videosObj;
      };

      const dadosProcessados = {
        ...imovelSelecionado,
        Foto: processPhotos(), // ← Fotos com ordem preservada
        Video: processVideos(),
        Slug: formatterSlug(imovelSelecionado.Empreendimento || ""),
      };

      console.log('📋 Dados finais para formData:', {
        codigo: dadosProcessados.Codigo,
        totalFotos: dadosProcessados.Foto?.length,
        primeirasOrdens: dadosProcessados.Foto?.slice(0, 5).map(f => f.Ordem)
      });

      setFormData(dadosProcessados);
      setDisplayValues(formatMonetaryDisplayValues());
      setIsInitialLoad(false); // Marcar carregamento inicial como concluído
      
      console.groupEnd();
    }
  }, [imovelSelecionado, mode, isInitialLoad, setFormData, setDisplayValues]);

  useEffect(() => {
    return () => {
      // Cleanup se necessário
    };
  }, []);

  const handleChangeWithTracking = (e) => {
    handleChange(e);
    setHasChanges(true);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const codigo = fileInputRef.current.getAttribute("data-codigo");
      handleFileUpload(codigo, files[0]);
      e.target.value = "";
      setHasChanges(true);
    }
  };

  const getFormTitle = () => {
    if (mode === "edit" && formData.Empreendimento) {
      return `Editar Imóvel: ${formData.Empreendimento}`;
    }
    return "Cadastrar Novo Imóvel";
  };

  const handleCancel = () => {
    if (hasChanges && typeof window !== 'undefined') {
      if (!window.confirm("Há alterações não salvas. Deseja realmente sair?")) {
        return;
      }
    }
    
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

  // 🔥 SUBMIT OTIMIZADO COM DEBUG DETALHADO
  const handleSubmitWithOrder = async (e) => {
    e.preventDefault();
    
    console.group('🚀 SUBMIT: Estado final antes do envio');
    console.log('Total de fotos no formData:', formData.Foto?.length);
    
    if (formData.Foto && formData.Foto.length > 0) {
      console.log('📊 Ordens das fotos no formData:');
      formData.Foto.slice(0, 10).forEach((foto, index) => {
        console.log(`  ${index}: Código ${foto.Codigo} -> Ordem ${foto.Ordem}`);
      });
      
      // Verificar se há inconsistências
      const ordensNumericas = formData.Foto.map(f => f.Ordem);
      const temInconsistencias = ordensNumericas.some(ordem => 
        typeof ordem !== 'number' || ordem < 0
      );
      
      if (temInconsistencias) {
        console.warn('⚠️ ATENÇÃO: Inconsistências detectadas nas ordens:', ordensNumericas);
      } else {
        console.log('✅ Ordens consistentes detectadas');
      }
    }
    
    console.groupEnd();
    
    setHasChanges(false);
    await handleSubmit(e);
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

        <form onSubmit={handleSubmitWithOrder} className="space-y-8">
          {showProprietarios && (
            <ProprietariosSection id={formData.Codigo} key="proprietarios-section" />
          )}
          {showVincularImovel && (
            <VincularImovelSection
              formData={formData}
              displayValues={displayValues}
              onChange={handleChangeWithTracking}
              validation={validation}
              key="vincular-section"
            />
          )}

          <BasicInfoSection
            formData={{ ...formData, Ativo: formData.Ativo || "Sim" }}
            displayValues={displayValues}
            onChange={handleChangeWithTracking}
            validation={validation}
            key="basic-info-section"
          />

          <LocationSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChangeWithTracking}
            validation={validation}
            key="location-section"
          />

          <FeaturesSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChangeWithTracking}
            key="features-section"
          />

          <ValuesSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChangeWithTracking}
            key="values-section"
          />

          <BrokerSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChangeWithTracking}
            key="broker-section"
          />

          <DescriptionSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChangeWithTracking}
            key="description-section"
          />

          <MediaSection
            formData={formData}
            displayValues={displayValues}
            onChange={handleChangeWithTracking}
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
            onUpdatePhotos={handleUpdatePhotos} // ← Função corrigida
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
            hasChanges={hasChanges}
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
