"use client";

import { useCallback } from "react";
import { getImageUploadMetadata, uploadToS3 } from "@/app/utils/s3-upload";

export const useImageUpload = (updateImage, setSuccess, setError) => {
  const handleImagesUploaded = useCallback(
    (uploadedImages) => {
      // Esta função não é mais usada, mantida apenas para compatibilidade
      console.log("Esta função está obsoleta, usar handleImagesUploaded de useImovelForm");

      // Exibe mensagem de sucesso
      if (uploadedImages && uploadedImages.length) {
        setSuccess(`${uploadedImages.length} imagem(ns) enviada(s) com sucesso!`);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      }
    },
    [setSuccess]
  );

  const handleFileUpload = useCallback(
    async (codigo, file) => {
      try {
        // Indicar que o upload está em andamento
        updateImage(codigo, "isUploading", true);

        // Obter metadados para upload
        const metadata = await getImageUploadMetadata(file);

        // Fazer upload para S3 via API
        const success = await uploadToS3(metadata);

        if (success) {
          // Atualizar URL da imagem no estado
          updateImage(codigo, "Foto", metadata.fileUrl);
          updateImage(codigo, "isUploading", false);
          setSuccess("Imagem enviada com sucesso para o Amazon S3!");
          setTimeout(() => {
            setSuccess("");
          }, 3000);
        } else {
          throw new Error("Falha ao fazer upload da imagem");
        }
      } catch (error) {
        console.error("Erro no upload:", error);
        setError("Erro ao fazer upload da imagem: " + error.message);
        updateImage(codigo, "isUploading", false);
      }
    },
    [updateImage, setSuccess, setError]
  );

  return {
    handleImagesUploaded,
    handleFileUpload,
  };
};

export default useImageUpload;
