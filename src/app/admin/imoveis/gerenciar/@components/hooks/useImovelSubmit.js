"use client";

import { useState, useCallback, useMemo } from "react";
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

  // ✅ MEMOIZAR validateForm para estabilizar dependência
  const validateForm = useMemo(() => {
    return (data) => {
      console.log('🔍 Validando formData:', data);
      
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
      const photoCount = data.Foto ? Object.keys(data.Foto).length : 0;
      if (photoCount < 5) {
        return {
          isValid: false,
          error: `É necessário adicionar pelo menos 5 fotos (atualmente: ${photoCount})`,
        };
      }

      console.log('✅ Validação passou!');
      return { isValid: true };
    };
  }, []);

  // ✅ MEMOIZAR preparePayload para estabilizar dependência
  const preparePayload = useMemo(() => {
    return (data) => {
      console.log('🔧 Preparando payload:', data);
      
      // 🧪 DEBUG DETALHADO DO VIDEO
      console.log('🎥 ANÁLISE DETALHADA DO VIDEO:');
      console.log('🎥 data.Video:', data.Video);
      console.log('🎥 typeof data.Video:', typeof data.Video);
      console.log('🎥 data.Video === undefined:', data.Video === undefined);
      console.log('🎥 data.Video === null:', data.Video === null);
      console.log('🎥 Object.keys(data):', Object.keys(data));
      
      // 🧪 DEBUG ESPECÍFICO DA ESTRUTURA VIDEO
      if (data.Video) {
        console.log('🎥 Video existe! Estrutura:');
        console.log('🎥 Object.keys(data.Video):', Object.keys(data.Video));
        console.log('🎥 data.Video["1"]:', data.Video["1"]);
        if (data.Video["1"]) {
          console.log('🎥 data.Video["1"].Video:', data.Video["1"].Video);
        }
      } else {
        console.log('🎥 Video NÃO existe ou é falsy');
      }
          
      // Converter o objeto de fotos para um array
      const fotosArray = data.Foto ? Object.values(data.Foto) : [];

      // ✅ CORRIGIDO: Manter estrutura Video como objeto
      let videoData = data.Video || {};
      
      // 🧪 DEBUG DO PROCESSAMENTO DO VIDEO
      console.log('🎥 videoData inicial:', videoData);
      console.log('🎥 videoData é array?', Array.isArray(data.Video));
      
      // Se Video for array (estrutura antiga), converter para objeto
      if (Array.isArray(data.Video)) {
        console.log('🎥 Convertendo Video de array para objeto...');
        const videosObj = {};
        data.Video.forEach((video, index) => {
          if (video.Video) {
            videosObj[index + 1] = { Video: video.Video };
          }
        });
        videoData = videosObj;
        console.log('🎥 Video convertido:', videoData);
      }

      // 🧪 DEBUG FINAL DO VIDEO
      console.log('🎥 videoData final:', videoData);
      console.log('🎥 Object.keys(videoData):', Object.keys(videoData));
      console.log('🎥 Object.keys(videoData).length:', Object.keys(videoData).length);
      console.log('🎥 Condição > 0?', Object.keys(videoData).length > 0);
      console.log('🎥 Video será enviado?', Object.keys(videoData).length > 0 ? 'SIM' : 'NÃO (undefined)');

      const payload = {
        ...data,
        ValorAntigo: data.ValorAntigo ? formatterNumber(data.ValorAntigo) : undefined,
        TipoEndereco: getTipoEndereco(data.Endereco),
        Endereco: formatAddress(data.Endereco),
        Foto: fotosArray,
        Video: Object.keys(videoData).length > 0 ? videoData : undefined, // ✅ Manter como objeto
      };
      
      // 🧪 DEBUG DO PAYLOAD FINAL
      console.log('📦 Payload preparado:', payload);
      console.log('📦 payload.Video:', payload.Video);
      console.log('📦 payload.Video === undefined:', payload.Video === undefined);
      
      return payload;
    };
  }, []);

  // ✅ ESTABILIZAR handleSubmit com dependências corretas
  const handleSubmit = useCallback(
    async (e) => {
      console.log('🚀 handleSubmit chamado!', { formData, mode, imovelId });
      
      // 🧪 DEBUG ESPECÍFICO DO FORMDATA RECEBIDO
      console.log('🚀 FormData recebido no handleSubmit:');
      console.log('🚀 formData.Video:', formData.Video);
      console.log('🚀 typeof formData.Video:', typeof formData.Video);
      
      e.preventDefault();
      setIsSaving(true);
      setError("");
      setSuccess("");

      try {
        // Validate form data
        const validation = validateForm(formData);
        if (!validation.isValid) {
          console.log('❌ Validação falhou:', validation.error);
          setError(validation.error);
          setIsSaving(false);
          return;
        }

        const payload = preparePayload(formData);

        let result;

        if (formData.Automacao) {
          console.log('🤖 Modo Automação');
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
              console.error('Erro no log:', logError);
            }
          } else {
            setError(result?.message || "Erro ao criar imóvel");
          }
        } else if (mode === "edit") {
          console.log('✏️ Modo Edição', { imovelId });
          
          // 🧪 DEBUG DA REQUISIÇÃO DE ATUALIZAÇÃO
          console.log('🔄 Enviando para atualizarImovel:');
          console.log('🔄 ID:', imovelId || formData.Codigo);
          console.log('🔄 Payload.Video:', payload.Video);
          
          // ✅ CORRIGIDO: Usar Codigo se imovelId não estiver disponível
          const id = imovelId || formData.Codigo;
          if (!id) {
            throw new Error('ID do imóvel não encontrado para atualização');
          }
          
          result = await atualizarImovel(id, payload);

          // 🧪 DEBUG DO RESULTADO DA API
          console.log('🔄 Resultado da atualizarImovel:', result);

          try {
            const { user, timestamp } = await getCurrentUserAndDate();
            await salvarLog({
              user: user.displayName ? user.displayName : "Não Identificado",
              email: user.email,
              data: timestamp.toISOString(),
              action: `Usuário ${user.email} atualizou o imóvel ${formData.Codigo}`,
            });
          } catch (logError) {
            console.error('Erro no log:', logError);
          }

          if (result && result.success) {
            setSuccess("Imóvel atualizado com sucesso!");
            setIsModalOpen(true);
          } else {
            setError(result?.message || "Erro ao atualizar imóvel");
          }
        } else {
          console.log('➕ Modo Criação');
          // ✅ PRESERVADO: Manter chamada original com Codigo
          result = await criarImovel(formData.Codigo, payload);

          if (result && result.success) {
            setSuccess("Imóvel cadastrado com sucesso!");
            setIsModalOpen(true);
            try {
              const { user, timestamp } = await getCurrentUserAndDate();
              await salvarLog({
                user: user.displayName,
                email: user.email,
                data: timestamp.toISOString(),
                action: `Usuário ${user.email} criou o imóvel ${formData.Codigo}`,
              });
            } catch (logError) {
              console.error('Erro no log:', logError);
            }
          } else {
            setError(result?.message || "Erro ao cadastrar imóvel");
          }
        }
        
        console.log('✅ Submit concluído com sucesso!');
      } catch (error) {
        console.error(`❌ Erro ao ${mode === "edit" ? "atualizar" : "cadastrar"} imóvel:`, error);
        setError(`Ocorreu um erro ao ${mode === "edit" ? "atualizar" : "cadastrar"} o imóvel: ${error.message}`);
      } finally {
        setIsSaving(false);
      }
    },
    [formData, setIsModalOpen, validateForm, preparePayload, mode, imovelId] // ✅ Dependências estáveis
  );

  // ✅ LOG DEBUG PARA VERIFICAR SE HOOK ESTÁ FUNCIONANDO
  console.log('🔄 useImovelSubmit executado:', {
    hasHandleSubmit: typeof handleSubmit === 'function',
    formDataKeys: formData ? Object.keys(formData).length : 0,
    mode,
    imovelId,
    // 🧪 DEBUG DO VIDEO NO HOOK
    videoExists: formData?.Video !== undefined,
    videoValue: formData?.Video
  });

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
