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
    const photoCount = Array.isArray(data.Foto) ? data.Foto.length : 0;
    if (photoCount < 5) {
      return {
        isValid: false,
        error: `É necessário adicionar pelo menos 5 fotos (atualmente: ${photoCount})`,
      };
    }

    return { isValid: true };
  }, []);

  // ✅ FUNÇÃO CORRIGIDA: Mantém a ordem das fotos
  const preparePayload = useCallback((data) => {
    console.log('🔍 [PREPARE-PAYLOAD] Dados originais das fotos:', data.Foto);
    
    // ✅ PROCESSAR FOTOS CORRETAMENTE
    let fotosArray = [];
    
    if (Array.isArray(data.Foto)) {
      // ✅ Se já é array, ordenar por Ordem e manter todas as propriedades
      fotosArray = [...data.Foto]
        .sort((a, b) => (a.Ordem || 0) - (b.Ordem || 0))
        .map(foto => ({
          Codigo: foto.Codigo,
          Foto: foto.Foto,
          FotoPequena: foto.FotoPequena || foto.Foto, // Fallback se não existir
          Destaque: foto.Destaque || "Nao",
          Ordem: foto.Ordem || 1, // ✅ MANTER O CAMPO ORDEM
          Tipo: foto.Tipo || "",
          Descricao: foto.Descricao || ""
        }));
    } else if (data.Foto && typeof data.Foto === 'object') {
      // Se for objeto (caso legado), converter para array ordenado por chaves numéricas
      fotosArray = Object.keys(data.Foto)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((key, index) => ({
          Codigo: key,
          Foto: data.Foto[key].Foto || data.Foto[key],
          FotoPequena: data.Foto[key].FotoPequena || data.Foto[key].Foto || data.Foto[key],
          Destaque: data.Foto[key].Destaque || "Nao",
          Ordem: data.Foto[key].Ordem || (index + 1), // ✅ CALCULAR ORDEM
          Tipo: data.Foto[key].Tipo || "",
          Descricao: data.Foto[key].Descricao || ""
        }));
    }

    console.log('✅ [PREPARE-PAYLOAD] Fotos processadas:', fotosArray.map(f => ({
      codigo: f.Codigo,
      ordem: f.Ordem,
      destaque: f.Destaque,
      url: f.Foto?.substring(0, 50) + '...'
    })));

    // Converter o objeto de vídeos para um array (se existir)
    let videosArray = [];
    if (data.Video) {
      if (typeof data.Video === "object" && !Array.isArray(data.Video)) {
        videosArray = Object.values(data.Video);
      } else if (Array.isArray(data.Video)) {
        videosArray = data.Video;
      }
    }

    const payload = {
      ...data,
      ValorAntigo: data.ValorAntigo ? formatterNumber(data.ValorAntigo) : undefined,
      TipoEndereco: getTipoEndereco(data.Endereco),
      Endereco: formatAddress(data.Endereco),
      Foto: fotosArray, // ✅ FOTOS COM ORDEM CORRETA
      Video: videosArray.length > 0 ? videosArray : undefined,
    };

    console.log('🚀 [PREPARE-PAYLOAD] Payload final:', {
      totalFotos: payload.Foto?.length,
      primeiraFoto: payload.Foto?.[0] ? {
        codigo: payload.Foto[0].Codigo,
        ordem: payload.Foto[0].Ordem,
        destaque: payload.Foto[0].Destaque
      } : null
    });

    return payload;
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

        let result;

        if (formData.Automacao) {
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
        }

        if (mode === "edit") {
          //Em modo de edição, chamar o serviço de atualização
          result = await atualizarImovel(imovelId, payload);

          try {
            const { user, timestamp } = await getCurrentUserAndDate();
            await salvarLog({
              user: user.displayName ? user.displayName : "Não Identificado",
              email: user.email,
              data: timestamp.toISOString(),
              action: `Usuário ${user.email} atualizou o imóvel ${formData.Codigo}`,
            });
          } catch (logError) {
            await salvarLog({
              user: user.displayName ? user.displayName : "Não Identificado",
              email: user.email,
              data: timestamp.toISOString(),
              action: `Imóveis: Erro ao editar imóvel: ${user.email} -  imóvel ${formData.Codigo} código de erro: ${logError}`,
            });
          }

          if (result && result.success) {
            setSuccess("Imóvel atualizado com sucesso!");
            setIsModalOpen(true);
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
                user: user.displayName,
                email: user.email,
                data: timestamp.toISOString(),
                action: `Usuário ${user.email} criou o imóvel ${formData.Codigo}`,
              });
            } catch (logError) {
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
