"use client";

import { useState, useCallback } from "react";
import { atualizarImovel, criarImovel } from "@/app/services";
import { formatterNumber } from "@/app/utils/formatter-number";
import { getTipoEndereco } from "@/app/utils/formater-tipo-address";
import { formatAddress } from "@/app/utils/formatter-address";
import { salvarLog } from "@/app/admin/services/log-service";
import { getCurrentUserAndDate } from "@/app/utils/get-log";

export const useImovelSubmit = (formData, setIsModalOpen, mode = "create", imovelId = null) => {

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateForm = useCallback((data) => {
    // Required fields list
    const requiredFields = [
      { field: "Empreendimento", label: "Empreendimento" },
      { field: "Slug", label: "Slug" },
      { field: "CEP", label: "CEP" },
      { field: "Endereco", label: "Endereço" },
      { field: "Numero", label: "Número" },
      { field: "Bairro", label: "Bairro" },
      { field: "Cidade", label: "Cidade" },
    ];

    // Check required fields
    const missingFields = requiredFields.filter(
      (item) => !data[item.field] || data[item.field].trim() === ""
    );

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map((f) => f.label).join(", ");
      return {
        isValid: false,
        error: `Campos obrigatórios não preenchidos: ${fieldNames}`,
      };
    }

    // Check photos (at least 5 required)
    const photoCount = data.Foto ? (Array.isArray(data.Foto) ? data.Foto.length : Object.keys(data.Foto).length) : 0;
    if (photoCount < 5) {
      return {
        isValid: false,
        error: `É necessário adicionar pelo menos 5 fotos (atualmente: ${photoCount})`,
      };
    }

    return { isValid: true };
  }, []);

  // 🔥 FUNÇÃO CRÍTICA: PREPARAR FOTOS SEM SOBRESCREVER ORDEM
  const prepareFotosParaEnvio = useCallback((fotos) => {
    console.log('📸 Processando fotos como array:', fotos?.length || 0);
    
    if (!fotos || !Array.isArray(fotos)) {
      console.log('⚠️ Fotos inválidas para processamento');
      return [];
    }

    // 🔍 VERIFICAR SE TEM ORDEM MANUAL (CRÍTICO)
    const temOrdemManual = fotos.every(foto => {
      const temOrdem = foto.Ordem !== undefined && foto.Ordem !== null && typeof foto.Ordem === 'number';
      const temOrdemMinuscula = foto.ordem !== undefined && foto.ordem !== null && typeof foto.ordem === 'number';
      return temOrdem || temOrdemMinuscula;
    });

    console.log('📸 Tem ordem manual?', temOrdemManual);

    if (temOrdemManual) {
      console.log('✅ PRESERVANDO ordem manual existente');
      
      // 🚀 PRESERVAR ORDEM MANUAL - NÃO SOBRESCREVER!
      const fotosComOrdemPreservada = fotos.map((foto, originalIndex) => {
        // Unificar campos de ordem (Ordem tem prioridade sobre ordem)
        const ordemFinal = foto.Ordem !== undefined ? foto.Ordem : 
                          foto.ordem !== undefined ? foto.ordem : 
                          originalIndex;
        
        // Criar objeto limpo preservando ordem
        const fotoProcessada = {
          ...foto,
          Ordem: typeof ordemFinal === 'number' ? ordemFinal : parseInt(ordemFinal) || originalIndex,
          _id: foto._id || undefined,
          Codigo: foto.Codigo || `photo-${Date.now()}-${originalIndex}`,
          Destaque: foto.Destaque || "Nao",
          tipoOrdenacao: foto.tipoOrdenacao || 'manual'
        };
        
        // Remover campo conflitante
        delete fotoProcessada.ordem;
        
        return fotoProcessada;
      });
      
      // 🔥 MANTER ORDEM EXATA - NÃO REORDENAR!
      // A ordem já está correta baseada na posição no array
      
      console.log('📸 Ordens preservadas (primeiras 5):', 
        fotosComOrdemPreservada.slice(0, 5).map(f => ({ 
          codigo: f.Codigo, 
          Ordem: f.Ordem,
          posicaoArray: fotosComOrdemPreservada.indexOf(f)
        }))
      );
      
      return fotosComOrdemPreservada;
      
    } else {
      console.log('🤖 Aplicando ordem baseada no índice (sem ordem manual)');
      
      // Aplicar ordem baseada no índice atual do array
      return fotos.map((foto, index) => {
        const fotoProcessada = {
          ...foto,
          Ordem: index, // Ordem baseada na posição atual
          _id: foto._id || undefined,
          Codigo: foto.Codigo || `photo-${Date.now()}-${index}`,
          Destaque: foto.Destaque || "Nao",
          tipoOrdenacao: 'inteligente'
        };
        
        // Remover propriedades desnecessárias
        delete fotoProcessada.codigoOriginal;
        delete fotoProcessada.ordem;
        
        return fotoProcessada;
      });
    }
  }, []);

  // 🔥 FUNÇÃO PREPARAR PAYLOAD OTIMIZADA - NÃO REORDENAR
  const preparePayload = useCallback((data) => {
    console.group('📦 Preparando payload para envio');
    
    let fotosArray = [];
    
    if (data.Foto) {
      if (Array.isArray(data.Foto)) {
        console.log('📸 Processando fotos como array:', data.Foto.length);
        
        // 🚀 CRITICAL: USAR FUNÇÃO QUE PRESERVA ORDEM
        fotosArray = prepareFotosParaEnvio(data.Foto);
        
      } else {
        // Converter objeto para array (formato legacy)
        console.log('📸 Convertendo objeto para array');
        const fotosFromObject = Object.entries(data.Foto)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([key, foto], index) => ({
            ...foto,
            Ordem: typeof foto.Ordem === 'number' ? foto.Ordem : 
                   typeof foto.ordem === 'number' ? foto.ordem : index,
            _id: foto._id || undefined,
            Codigo: foto.Codigo || key,
            tipoOrdenacao: 'legacy'
          }));
          
        fotosArray = prepareFotosParaEnvio(fotosFromObject);
      }
    }

    // Converter vídeos se existir
    let videosArray = [];
    if (data.Video) {
      if (typeof data.Video === "object" && !Array.isArray(data.Video)) {
        videosArray = Object.values(data.Video);
      } else if (Array.isArray(data.Video)) {
        videosArray = data.Video;
      }
    }

    // Debug final das ordens
    console.log('📸 Resultado final das fotos:', {
      totalFotos: fotosArray.length,
      ordensSequencia: fotosArray.map(f => f.Ordem).join(','),
      primeirasFotosOrdem: fotosArray.slice(0, 5).map(f => ({ 
        codigo: f.Codigo?.substring(0, 15) + '...', 
        Ordem: f.Ordem,
        tipoOrdenacao: f.tipoOrdenacao
      }))
    });
    
    console.groupEnd();

    return {
      ...data,
      ValorAntigo: data.ValorAntigo ? formatterNumber(data.ValorAntigo) : undefined,
      TipoEndereco: getTipoEndereco(data.Endereco),
      Endereco: formatAddress(data.Endereco),
      Foto: fotosArray, // ← Array com ordem preservada
      Video: videosArray.length > 0 ? videosArray : undefined,
    };
  }, [prepareFotosParaEnvio]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSaving(true);
      setError("");
      setSuccess("");

      // Validate form data
      const validation = validateForm(formData);
      if (!validation.isValid) {
        setError(validation.error);
        setIsSaving(false);
        return;
      }

      try {
        const payload = preparePayload(formData);

        console.group('🚀 Submissão de Imóvel');
        console.log('Modo:', mode);
        console.log('ID/Código:', imovelId || formData.Codigo);
        console.log('Total de fotos:', payload.Foto?.length);
        
        // 🔍 DEBUG DETALHADO DAS ORDENS
        if (payload.Foto && payload.Foto.length > 0) {
          console.log('📊 Ordens enviadas:', payload.Foto.map((f, i) => `${i}:${f.Ordem}`).join(', '));
          
          // Verificar se há reordenação (problema comum)
          const ordensOriginais = formData.Foto?.map(f => f.Ordem || f.ordem) || [];
          const ordensFinais = payload.Foto.map(f => f.Ordem);
          const houveAlteracao = JSON.stringify(ordensOriginais) !== JSON.stringify(ordensFinais);
          
          console.log('🔄 Houve alteração nas ordens?', houveAlteracao);
          if (houveAlteracao) {
            console.log('📊 Ordens originais:', ordensOriginais.slice(0, 10));
            console.log('📊 Ordens finais:', ordensFinais.slice(0, 10));
          }
        }
        
        console.groupEnd();

        let result;

        if (formData.Automacao) {
          // Imóvel vindo da automação
          result = await criarImovel(formData.Codigo, payload);
          if (result && result.success) {
            setSuccess("Imóvel cadastrado com sucesso!");
            setIsModalOpen(true);

            try {
              const { user, timestamp } = await getCurrentUserAndDate();
              await salvarLog({
                user: user.displayName ? user.displayName : "Não Identificado",
                email: user.email,
                data: timestamp.toISOString(),
                action: `Automação: ${user.email} - criou o imóvel ${formData.Codigo} a partir da automação`,
              });
            } catch (logError) {
              console.error("Erro ao salvar log:", logError);
            }
          } else {
            setError(result?.message || "Erro ao criar imóvel");
          }
        } else if (mode === "edit") {
          // Em modo de edição
          console.log('📝 Atualizando imóvel:', imovelId || formData.Codigo);
          
          const codigoOuId = imovelId || formData.Codigo;
          result = await atualizarImovel(codigoOuId, payload);

          if (result && result.success) {
            setSuccess("Imóvel atualizado com sucesso!");
            
            try {
              const { user, timestamp } = await getCurrentUserAndDate();
              await salvarLog({
                user: user.displayName ? user.displayName : "Não Identificado",
                email: user.email,
                data: timestamp.toISOString(),
                action: `Usuário ${user.email} atualizou o imóvel ${formData.Codigo}`,
              });
            } catch (logError) {
              console.error("Erro ao salvar log:", logError);
            }
          } else {
            console.error('❌ Erro na atualização:', result);
            setError(result?.message || "Erro ao atualizar imóvel");
          }
        } else {
          // Em modo de criação
          result = await criarImovel(formData.Codigo, payload);

          if (result && result.success) {
            setSuccess("Imóvel cadastrado com sucesso!");
            setIsModalOpen(true);
            
            try {
              const { user, timestamp } = await getCurrentUserAndDate();
              await salvarLog({
                user: user.displayName ? user.displayName : "Não Identificado",
                email: user.email,
                data: timestamp.toISOString(),
                action: `Usuário ${user.email} criou o imóvel ${formData.Codigo}`,
              });
            } catch (logError) {
              console.error("Erro ao salvar log:", logError);
            }
          } else {
            setError(result?.message || "Erro ao cadastrar imóvel");
          }
        }
      } catch (error) {
        console.error(`Erro ao ${mode === "edit" ? "atualizar" : "cadastrar"} imóvel:`, error);
        setError(`Ocorreu um erro ao ${mode === "edit" ? "atualizar" : "cadastrar"} o imóvel`);
      } finally {
        setIsSaving(false);
      }
    },
    [formData, setIsModalOpen, validateForm, preparePayload, mode, imovelId]
  );

  return {
    handleSubmit,
    isSaving,
    error,
    success,
    setError,
    setSuccess,
  };
};

export default useImovelSubmit;
