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
  
  // 🔥 NOVOS ESTADOS DE CONTROLE CRÍTICOS
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(null);
  
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

  // 🔥 CALLBACK DE SUCESSO PARA O HOOK DE SUBMIT
  const onSubmitSuccess = (responseData) => {
    console.log('🎉 Submit bem-sucedido! Atualizando estado...');
    
    // Marcar como submit bem-sucedido
    setIsSubmitSuccess(true);
    setHasChanges(false);
    
    // SE A API RETORNOU DADOS ATUALIZADOS, USAR ELES
    if (responseData?.data && responseData.data.Foto) {
      console.log('📥 Atualizando formData com dados da API...');
      
      // Garantir que fotos estão ordenadas
      const fotosOrdenadas = [...responseData.data.Foto].sort((a, b) => 
        (a.Ordem || 0) - (b.Ordem || 0)
      );
      
      setFormData(prev => ({
        ...prev,
        ...responseData.data,
        Foto: fotosOrdenadas
      }));
      
      console.log('✅ Estado atualizado com dados mais recentes da API');
    }
    
    setLastUpdateTimestamp(Date.now());
  };

  const { handleSubmit, isSaving, error, success, setError, setSuccess } = useImovelSubmit(
    formData,
    setIsModalOpen,
    mode,
    imovelSelecionado?._id,
    onSubmitSuccess // ← Callback de sucesso personalizado
  );

  const { handleFileUpload } = useImageUpload(updateImage, setSuccess, setError);

  // 🔥 FUNÇÃO CRÍTICA CORRIGIDA: ATUALIZAÇÃO DE FOTOS SEM REORDENAR
  const handleUpdatePhotos = (fotosAtualizadas) => {
    console.group('📸 PARENT: Atualizando fotos no formData');
    console.log('📸 Total de fotos recebidas:', fotosAtualizadas.length);
    
    if (fotosAtualizadas.length > 0) {
      console.log('📸 Primeiras 3 fotos com suas ordens:');
      fotosAtualizadas.slice(0, 3).forEach((foto, index) => {
        console.log(`  ${index + 1}. Código: ${foto.Codigo}, Ordem: ${foto.Ordem}, Tipo: ${foto.tipoOrdenacao}`);
      });
      
      // CRITICAL: Verificar se as ordens estão corretas
      const ordensSequenciais = fotosAtualizadas.map(f => f.Ordem).join(',');
      console.log('📊 Sequência de ordens:', ordensSequenciais);
    }
    
    // 🚀 ATUALIZAR ESTADO SEM MODIFICAR AS FOTOS
    setFormData(prev => ({
      ...prev,
      Foto: fotosAtualizadas // ← Preservar ordem exata recebida
    }));
    
    setHasChanges(true);
    setIsSubmitSuccess(false); // ← Resetar flag de submit
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

  // 🔥 USEEFFECT CRÍTICO CORRIGIDO COM CONTROLES RIGOROSOS
  useEffect(() => {
    // CONDIÇÕES RIGOROSAS PARA CARREGAMENTO
    const shouldLoadFromStore = (
      imovelSelecionado && 
      mode === "edit" && 
      isInitialLoad && 
      !isSubmitSuccess // ← NÃO carregar se acabou de submitar
    );

    if (shouldLoadFromStore) {
      console.group('🏠 Carregando dados do imóvel para edição');
      console.log('🔍 Condições de carregamento:', {
        temImovelSelecionado: !!imovelSelecionado,
        modoEdicao: mode === "edit",
        isInitialLoad,
        isSubmitSuccess,
        shouldLoad: shouldLoadFromStore
      });
      
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
          
          // 🔍 ANÁLISE DETALHADA DAS FOTOS DO BANCO
          console.log('🔍 Analisando estrutura das fotos do banco:');
          
          const primeiraFoto = imovelSelecionado.Foto[0];
          if (primeiraFoto) {
            console.log('📊 Campos da primeira foto:', Object.keys(primeiraFoto));
            console.log('📊 Valores dos campos de ordem:', {
              Ordem: primeiraFoto.Ordem,
              ordem: primeiraFoto.ordem,
              tipoOrdem: typeof primeiraFoto.Ordem,
              tipoOrdemMinuscula: typeof primeiraFoto.ordem
            });
          }
          
          // 🔥 VERIFICAR SE TEM ORDEM MANUAL SALVA NO BANCO
          const temOrdemManualNoBanco = imovelSelecionado.Foto.every(foto => {
            const temOrdemMaiuscula = typeof foto.Ordem === 'number' && foto.Ordem >= 0;
            const temOrdemMinuscula = typeof foto.ordem === 'number' && foto.ordem >= 0;
            return temOrdemMaiuscula || temOrdemMinuscula;
          });
          
          console.log('📸 Tem ordem manual salva no banco?', temOrdemManualNoBanco);
          
          if (temOrdemManualNoBanco) {
            console.log('📸 Preservando ordem manual do banco');
            
            // 🚀 PRESERVAR ORDEM EXATA DO BANCO - NÃO APLICAR PHOTOSORTER!
            fotosProcessadas = imovelSelecionado.Foto.map((foto, index) => {
              // Unificar campos de ordem (priorizar Ordem maiúsculo)
              const ordemFinal = foto.Ordem !== undefined && foto.Ordem !== null ? foto.Ordem :
                                foto.ordem !== undefined && foto.ordem !== null ? foto.ordem :
                                index;
              
              const fotoProcessada = {
                ...foto,
                Codigo: foto.Codigo || `photo-${Date.now()}-${index}`,
                Destaque: foto.Destaque || "Nao",
                Ordem: ordemFinal, // ← PRESERVAR ORDEM DO BANCO
                tipoOrdenacao: 'banco' // ← Marcar como vindo do banco
              };
              
              // Remover campo conflitante
              delete fotoProcessada.ordem;
              
              return fotoProcessada;
            });
            
            // 🔥 CRITICAL: ORDENAR PELAS ORDENS SALVAS NO BANCO
            fotosProcessadas.sort((a, b) => (a.Ordem || 0) - (b.Ordem || 0));
            
            console.log('📸 Fotos ordenadas conforme banco:', {
              total: fotosProcessadas.length,
              ordensSequencia: fotosProcessadas.map(f => f.Ordem).join(','),
              primeiras3: fotosProcessadas.slice(0, 3).map(f => ({ 
                codigo: f.Codigo?.substring(0, 15) + '...', 
                Ordem: f.Ordem 
              }))
            });
            
          } else {
            console.log('📸 Sem ordem manual no banco - aplicando ordem por índice');
            // Se não tem ordem manual, aplicar ordem baseada na posição
            fotosProcessadas = imovelSelecionado.Foto.map((foto, index) => ({
              ...foto,
              Codigo: foto.Codigo || `photo-${Date.now()}-${index}`,
              Destaque: foto.Destaque || "Nao",
              Ordem: index,
              tipoOrdenacao: 'indice'
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
        
        console.log('📸 Fotos processadas para formData:', {
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
        Foto: processPhotos(), // ← Fotos com ordem PRESERVADA do banco
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
      setIsInitialLoad(false);
      setLastUpdateTimestamp(Date.now()); // ← Marcar timestamp
      
      console.groupEnd();
    }
  }, [
    imovelSelecionado, 
    mode, 
    isInitialLoad, 
    isSubmitSuccess, // ← Dependência crítica
    setFormData, 
    setDisplayValues
  ]);

  useEffect(() => {
    return () => {
      // Cleanup se necessário
    };
  }, []);

  const handleChangeWithTracking = (e) => {
    handleChange(e);
    setHasChanges(true);
    setIsSubmitSuccess(false); // ← Resetar flag quando há mudanças
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const codigo = fileInputRef.current.getAttribute("data-codigo");
      handleFileUpload(codigo, files[0]);
      e.target.value = "";
      setHasChanges(true);
      setIsSubmitSuccess(false);
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
    
    // RESETAR FLAGS ANTES DO SUBMIT
    setIsSubmitSuccess(false);
    
    try {
      await handleSubmit(e);
      console.log('✅ Submit concluído com sucesso');
      
    } catch (error) {
      console.error('❌ Erro no submit:', error);
      setIsSubmitSuccess(false);
    }
  };

  // 🔥 FUNÇÃO PARA RECARREGAR DADOS FRESCOS (OPCIONAL - PARA DEBUG)
  const reloadFreshData = async () => {
    if (!imovelSelecionado?._id && !formData?.Codigo) return;
    
    try {
      console.log('🔄 Recarregando dados frescos do servidor...');
      
      const response = await fetch(`/api/admin/imoveis/${imovelSelecionado?._id || formData.Codigo}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('✅ Dados frescos carregados:', {
            totalFotos: result.data.Foto?.length,
            timestamp: result.timestamp
          });
          
          // Processar fotos garantindo ordem
          if (Array.isArray(result.data.Foto)) {
            result.data.Foto.sort((a, b) => (a.Ordem || 0) - (b.Ordem || 0));
          }
          
          setFormData(result.data);
          setIsSubmitSuccess(false);
          setLastUpdateTimestamp(Date.now());
        }
      }
    } catch (error) {
      console.error('❌ Erro ao recarregar dados:', error);
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
        
        {/* 🔥 PAINEL DE DEBUG (APENAS EM DESENVOLVIMENTO) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Estados de Controle:</strong></p>
                <p>• isInitialLoad: {String(isInitialLoad)}</p>
                <p>• isSubmitSuccess: {String(isSubmitSuccess)}</p>
                <p>• hasChanges: {String(hasChanges)}</p>
                <p>• lastUpdate: {lastUpdateTimestamp ? new Date(lastUpdateTimestamp).toLocaleTimeString() : 'null'}</p>
              </div>
              <div>
                <p><strong>Dados do Formulário:</strong></p>
                <p>• Total fotos: {formData?.Foto?.length || 0}</p>
                <p>• Modo: {mode}</p>
                <p>• Código: {formData?.Codigo || 'null'}</p>
                <button 
                  onClick={reloadFreshData} 
                  className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  🔄 Recarregar dados frescos
                </button>
              </div>
            </div>
          </div>
        )}

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
