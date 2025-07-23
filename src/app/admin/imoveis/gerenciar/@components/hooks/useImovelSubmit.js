"use client";

import { useState, useCallback } from "react";
import { atualizarImovel, criarImovel } from "@/app/services";
import { formatterNumber } from "@/app/utils/formatter-number";
import { getTipoEndereco } from "@/app/utils/formater-tipo-address";
import { formatAddress } from "@/app/utils/formatter-address";
import { salvarLog } from "@/app/admin/services/log-service";
import { getCurrentUserAndDate } from "@/app/utils/get-log";

export const useImovelSubmit = (formData, setIsModalOpen, mode = "create", imovelId = null) => { // <--- MODIFIQUE ESTA LINHA

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
    const photoCount = data.Foto ? Object.keys(data.Foto).length : 0;
    if (photoCount < 5) {
      return {
        isValid: false,
        error: `É necessário adicionar pelo menos 5 fotos (atualmente: ${photoCount})`,
      };
    }

    return { isValid: true };
  }, []);

  // MODIFICAR A FUNÇÃO preparePayload NO ARQUIVO useImovelSubmit.js

const preparePayload = useCallback((data) => {
  // Converter o objeto de fotos para um array PRESERVANDO A ORDEM
  let fotosArray = [];
  
  if (data.Foto) {
    if (Array.isArray(data.Foto)) {
      // Se já for array, garantir que cada foto tenha a ordem correta
      fotosArray = data.Foto.map((foto, index) => ({
        ...foto,
        Ordem: index + 1, // Garantir que a ordem seja baseada na posição atual
        Posicao: index + 1 // Adicionar também como Posicao para compatibilidade
      }));
    } else if (typeof data.Foto === "object") {
      // Se for objeto, converter para array mantendo a ordem
      fotosArray = Object.values(data.Foto)
        .sort((a, b) => {
          // Ordenar pelo campo Ordem se existir, senão pela ordem de inserção
          if (a.Ordem && b.Ordem) {
            return parseInt(a.Ordem) - parseInt(b.Ordem);
          }
          return 0;
        })
        .map((foto, index) => ({
          ...foto,
          Ordem: index + 1, // Reindexar para garantir ordem sequencial
          Posicao: index + 1
        }));
    }
  }

  // Converter o objeto de vídeos para um array (se existir)
  let videosArray = [];
  if (data.Video) {
    if (typeof data.Video === "object" && !Array.isArray(data.Video)) {
      videosArray = Object.values(data.Video);
    } else if (Array.isArray(data.Video)) {
      videosArray = data.Video;
    }
  }

  // Log para debug (remover em produção)
  console.log('📸 Fotos sendo enviadas:', fotosArray.map(f => ({
    Codigo: f.Codigo,
    Ordem: f.Ordem,
    Destaque: f.Destaque
  })));

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
          result = await atualizarImovel(imovelId, payload); // <--- MODIFIQUE ESTA LINHA

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
                action: `Usuário ${user.email} atualizou o imóvel ${formData.Codigo}`,
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
    [formData, setIsModalOpen, validateForm, preparePayload, mode]
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
