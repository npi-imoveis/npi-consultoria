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

  const preparePayload = useCallback((data) => {
    // 🔥 MODIFICAÇÃO: Converter o objeto de fotos preservando a ordem manual se existir
    let fotosArray = [];
    
    if (data.Foto) {
      // Se já for um array (caso do drag & drop), preservar ordem
      if (Array.isArray(data.Foto)) {
        // 🔥 CRÍTICO: Verificar se já tem campo ordem manual
        const temOrdemManual = data.Foto.every(foto => 
          foto.ordem !== undefined && foto.ordem !== null
        );
        
        if (temOrdemManual) {
          // Se tem ordem manual, manter exatamente como está
          console.log('📸 PRESERVANDO ordem manual existente');
          fotosArray = data.Foto.map(foto => ({
            ...foto,
            ordem: foto.ordem, // Manter ordem existente
            _id: foto._id || undefined,
            Codigo: foto.Codigo || undefined
          }));
        } else {
          // Se não tem ordem manual, adicionar baseado no índice
          console.log('📸 ADICIONANDO ordem baseada no índice');
          fotosArray = data.Foto.map((foto, index) => ({
            ...foto,
            ordem: index,
            _id: foto._id || undefined,
            Codigo: foto.Codigo || undefined
          }));
        }
      } else {
        // Se for objeto (formato antigo), converter mantendo ordem
        fotosArray = Object.entries(data.Foto)
          .sort(([a], [b]) => parseInt(a) - parseInt(b)) // Ordena pelas chaves
          .map(([key, foto], index) => ({
            ...foto,
            ordem: foto.ordem !== undefined ? foto.ordem : index, // 🔥 Preservar ordem se existir
            _id: foto._id || undefined,
            Codigo: foto.Codigo || key
          }));
      }
    }

    // Debug para verificar a ordem
    console.group('📸 Debug - Ordem das Fotos');
    console.log('Total de fotos:', fotosArray.length);
    console.log('Fotos com ordem:', fotosArray.map((f, i) => ({
      index: i,
      ordem: f.ordem,
      codigo: f.Codigo,
      url: f.Foto?.split('/').pop() || f.url?.split('/').pop() || 'sem-url'
    })));
    console.groupEnd();

    // Converter o objeto de vídeos para um array (se existir)
    let videosArray = [];
    if (data.Video) {
      if (typeof data.Video === "object" && !Array.isArray(data.Video)) {
        videosArray = Object.values(data.Video);
      } else if (Array.isArray(data.Video)) {
        videosArray = data.Video;
      }
    }

    return {
      ...data,
      ValorAntigo: data.ValorAntigo ? formatterNumber(data.ValorAntigo) : undefined,
      TipoEndereco: getTipoEndereco(data.Endereco),
      Endereco: formatAddress(data.Endereco),
      Foto: fotosArray, // Array com ordem preservada
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

        // Debug do payload
        console.group('🚀 Debug Salvamento de Imóvel');
        console.log('Modo:', mode);
        console.log('ID:', imovelId);
        console.log('Código:', formData.Codigo);
        console.log('Total de fotos:', payload.Foto?.length);
        console.log('Ordem das fotos:', payload.Foto?.map((f, i) => `${i}: ordem=${f.ordem}`));
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
                action: `Automação:  ${user.email} - criou o imóvel ${formData.Codigo} a partir da automação`,
              });
            } catch (logError) {
              console.error("Erro ao salvar log:", logError);
              const { user, timestamp } = await getCurrentUserAndDate();
              await salvarLog({
                user: user.displayName ? user.displayName : "Não Identificado",
                email: user.email,
                data: timestamp.toISOString(),
                action: `Automação: Erro ao criar automação: ${user.email} - imóvel ${formData.Codigo} código de erro: ${logError}`,
              });
            }
          } else {
            setError(result?.message || "Erro ao criar imóvel");
          }
        } else if (mode === "edit") {
          // Em modo de edição, chamar o serviço de atualização
          console.log('📝 Modo edição - Atualizando imóvel:', imovelId || formData.Codigo);
          
          // 🔥 USAR serviço correto baseado no contexto
          const codigoOuId = formData.Codigo || imovelId;
          result = await atualizarImovel(codigoOuId, payload);

          if (result && result.success) {
            setSuccess("Imóvel atualizado com sucesso!");
            
            // 🔥 NÃO abrir modal em modo de edição
            // setIsModalOpen(true);
            
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
              const { user, timestamp } = await getCurrentUserAndDate();
              await salvarLog({
                user: user.displayName ? user.displayName : "Não Identificado",
                email: user.email,
                data: timestamp.toISOString(),
                action: `Imóveis: Erro ao editar imóvel: ${user.email} -  imóvel ${formData.Codigo} código de erro: ${logError}`,
              });
            }
          } else {
            setError(result?.message || "Erro ao atualizar imóvel");
          }
        } else {
          // Em modo de criação, chamar o serviço de cadastro
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
              const { user, timestamp } = await getCurrentUserAndDate();
              await salvarLog({
                user: user.displayName ? user.displayName : "Não Identificado",
                email: user.email,
                data: timestamp.toISOString(),
                action: `Imóveis: Erro ao criar imóvel: ${user.email} -  imóvel ${formData.Codigo} código de erro: ${logError}`,
              });
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
