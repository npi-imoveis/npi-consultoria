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

  // 🔥 FUNÇÃO PREPARAR PAYLOAD OTIMIZADA
  const preparePayload = useCallback((data) => {
    console.group('📦 Preparando payload para envio');
    
    let fotosArray = [];
    
    if (data.Foto) {
      if (Array.isArray(data.Foto)) {
        console.log('📸 Processando fotos como array:', data.Foto.length);
        
        // Verificar se tem ordem manual (campo 'ordem' definido)
        const temOrdemManual = data.Foto.some(foto => 
          typeof foto.ordem === 'number' && foto.ordem >= 0
        );
        
        console.log('📸 Tem ordem manual?', temOrdemManual);
        
        if (temOrdemManual) {
          // PRESERVAR ordem manual existente
          fotosArray = data.Foto.map(foto => {
            const fotoProcessada = {
              ...foto,
              ordem: typeof foto.ordem === 'number' ? foto.ordem : 0,
              _id: foto._id || undefined,
              Codigo: foto.Codigo || undefined
            };
            
            // Remover propriedades desnecessárias
            delete fotoProcessada.codigoOriginal;
            
            return fotoProcessada;
          });
          
          // Ordenar pelo campo ordem para garantir consistência
          fotosArray.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
          
          console.log('✅ Ordem manual preservada');
        } else {
          // Adicionar ordem baseada no índice atual
          fotosArray = data.Foto.map((foto, index) => {
            const fotoProcessada = {
              ...foto,
              ordem: index,
              _id: foto._id || undefined,
              Codigo: foto.Codigo || undefined
            };
            
            // Remover propriedades desnecessárias
            delete fotoProcessada.codigoOriginal;
            
            return fotoProcessada;
          });
          
          console.log('✅ Ordem baseada no índice aplicada');
        }
      } else {
        // Converter objeto para array (formato legacy)
        console.log('📸 Convertendo objeto para array');
        fotosArray = Object.entries(data.Foto)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([key, foto], index) => ({
            ...foto,
            ordem: typeof foto.ordem === 'number' ? foto.ordem : index,
            _id: foto._id || undefined,
            Codigo: foto.Codigo || key
          }));
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

    // Debug final
    console.log('📸 Resultado final:', {
      totalFotos: fotosArray.length,
      primeirasFotosOrdem: fotosArray.slice(0, 3).map(f => ({ 
        codigo: f.Codigo, 
        ordem: f.ordem,
        url: f.Foto?.substring(f.Foto.lastIndexOf('/') + 1, f.Foto.lastIndexOf('/') + 10) + '...'
      }))
    });
    
    console.groupEnd();

    return {
      ...data,
      ValorAntigo: data.ValorAntigo ? formatterNumber(data.ValorAntigo) : undefined,
      TipoEndereco: getTipoEndereco(data.Endereco),
      Endereco: formatAddress(data.Endereco),
      Foto: fotosArray,
      Video: videosArray.length > 0 ? videosArray : undefined,
    };
  }, []);

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
        console.log('Ordens das fotos:', payload.Foto?.map((f, i) => `${i}:${f.ordem}`).join(', '));
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
