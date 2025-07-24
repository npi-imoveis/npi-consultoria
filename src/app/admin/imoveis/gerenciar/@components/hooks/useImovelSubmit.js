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

  // 🔥 FUNÇÃO CRÍTICA: PREPARAR FOTOS SEM SOBRESCREVER ORDEM (CORRIGIDA)
  const prepareFotosParaEnvio = useCallback((fotos) => {
    console.group('📸 PREPARANDO FOTOS PARA ENVIO');
    console.log('📥 Fotos recebidas:', fotos?.length || 0);
    
    if (!fotos || !Array.isArray(fotos)) {
      console.log('⚠️ Fotos inválidas para processamento');
      console.groupEnd();
      return [];
    }

    // 🔍 VERIFICAR SE TEM ORDEM MANUAL PRESERVADA
    const temOrdemManual = fotos.every(foto => {
      // Verificar ambos os campos (Ordem e ordem) para compatibilidade
      const temOrdemMaiuscula = typeof foto.Ordem === 'number' && foto.Ordem >= 0;
      const temOrdemMinuscula = typeof foto.ordem === 'number' && foto.ordem >= 0;
      return temOrdemMaiuscula || temOrdemMinuscula;
    });

    console.log('🔍 Verificação de ordem manual:', {
      totalFotos: fotos.length,
      temOrdemManual,
      primeirasFotosOrdens: fotos.slice(0, 3).map(f => ({ 
        codigo: f.Codigo, 
        Ordem: f.Ordem, 
        ordem: f.ordem 
      }))
    });

    if (temOrdemManual) {
      console.log('✅ PRESERVANDO ORDEM MANUAL - NÃO SOBRESCREVER!');
      
      // 🚀 PRESERVAR ORDEM MANUAL EXATA
      const fotosComOrdemPreservada = fotos.map((foto, originalIndex) => {
        // Unificar campos de ordem (Ordem maiúsculo tem prioridade)
        const ordemFinal = foto.Ordem !== undefined && foto.Ordem !== null ? foto.Ordem : 
                          foto.ordem !== undefined && foto.ordem !== null ? foto.ordem : 
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
        
        // 🔥 CRÍTICO: Remover campo ordem minúsculo para evitar conflito
        delete fotoProcessada.ordem;
        
        return fotoProcessada;
      });
      
      // 🚀 IMPORTANTE: NÃO REORDENAR AQUI! Manter ordem exata do array
      console.log('📊 Ordens preservadas:', fotosComOrdemPreservada.map((f, i) => `pos${i}:Ordem${f.Ordem}`).join(','));
      console.groupEnd();
      return fotosComOrdemPreservada;
      
    } else {
      console.log('🤖 Aplicando ordem baseada no índice (sem ordem manual)');
      
      // Aplicar ordem baseada no índice atual do array
      const fotosComIndice = fotos.map((foto, index) => {
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
      
      console.groupEnd();
      return fotosComIndice;
    }
  }, []);

  // 🔥 FUNÇÃO PREPARAR PAYLOAD CRÍTICA - NÃO REORDENAR
  const preparePayload = useCallback((data) => {
    console.group('📦 Preparando payload para envio');
    
    let fotosArray = [];
    
    if (data.Foto) {
      if (Array.isArray(data.Foto)) {
        console.log('📸 Processando fotos como array:', data.Foto.length);
        
        // 🚀 CRITICAL: USAR FUNÇÃO QUE PRESERVA ORDEM EXATA
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

    // 🔥 DEBUG CRÍTICO: VERIFICAR ORDEM FINAL ANTES DO ENVIO
    console.log('📊 PAYLOAD FINAL - Verificação de ordens:');
    console.log('Total de fotos:', fotosArray.length);
    
    if (fotosArray.length > 0) {
      const ordensSequencia = fotosArray.map(f => f.Ordem).join(',');
      console.log('Sequência de ordens enviadas:', ordensSequencia);
      
      // Verificar se há inconsistências
      const ordensValidas = fotosArray.every(f => typeof f.Ordem === 'number');
      const ordensSequenciais = fotosArray.map(f => f.Ordem).every((ordem, index) => ordem === index);
      
      console.log('Ordens válidas?', ordensValidas);
      console.log('Ordens sequenciais?', ordensSequenciais);
      
      // Log das primeiras 5 fotos para debug
      fotosArray.slice(0, 5).forEach((foto, index) => {
        console.log(`  Foto ${index}: Código ${foto.Codigo} → Ordem ${foto.Ordem}`);
      });
    }
    
    console.groupEnd();

    return {
      ...data,
      ValorAntigo: data.ValorAntigo ? formatterNumber(data.ValorAntigo) : undefined,
      TipoEndereco: getTipoEndereco(data.Endereco),
      Endereco: formatAddress(data.Endereco),
      Foto: fotosArray, // ← Array com ordem EXATA preservada
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

        console.group('🚀 SUBMIT - Enviando para API');
        console.log('Modo:', mode);
        console.log('ID/Código:', imovelId || formData.Codigo);
        console.log('Total de fotos no payload:', payload.Foto?.length);
        
        // 🔍 DEBUG DETALHADO: Verificar se ordens estão corretas no envio
        if (payload.Foto && payload.Foto.length > 0) {
          console.log('📊 VERIFICAÇÃO FINAL - Ordens no payload:');
          const ordensEnviadas = payload.Foto.map(f => f.Ordem);
          console.log('Ordens enviadas:', ordensEnviadas.join(','));
          
          // Detectar problemas comuns
          const todasZero = ordensEnviadas.every(o => o === 0);
          const todasSequenciais = ordensEnviadas.every((o, i) => o === i);
          
          console.log('🔍 Diagnóstico:');
          console.log('  - Todas as ordens são 0?', todasZero);
          console.log('  - Ordens sequenciais (0,1,2,3...)?', todasSequenciais);
          
          if (todasZero) {
            console.warn('⚠️ PROBLEMA: Todas as ordens são 0 - possível falha na reordenação');
          }
          
          if (!todasSequenciais) {
            console.log('✅ Ordens não sequenciais detectadas - reordenação manual presente');
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
          
          console.log('🌐 Chamando API de atualização...');
          console.log('📊 Payload final sendo enviado:', {
            codigo: codigoOuId,
            totalFotos: payload.Foto?.length,
            ordensResumidas: payload.Foto?.slice(0, 5).map(f => f.Ordem),
            outrosCampos: Object.keys(payload).filter(k => k !== 'Foto').length
          });
          
          result = await atualizarImovel(codigoOuId, payload);
          
          console.log('📥 Resposta da API recebida:', {
            success: result?.success,
            message: result?.message,
            data: result?.data ? 'Presente' : 'Ausente'
          });

          if (result && result.success) {
            console.log('✅ Atualização bem-sucedida!');
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
            console.error('❌ Erro na atualização:', {
              success: result?.success,
              message: result?.message,
              error: result?.error,
              status: result?.status
            });
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
