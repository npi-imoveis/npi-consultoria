export const uploadImagem = async (file, tipo, id) => {
  try {
    const formData = new FormData();
    formData.append("imagem", file);
    formData.append("tipo", tipo);
    formData.append("id", id);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-imagem`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao fazer upload de imagem:", error);
    return { success: false, message: "Erro ao fazer upload de imagem" };
  }
};

/**
 * Remove uma imagem do servidor
 * @param {string} imagemUrl - URL ou identificador da imagem
 * @param {string} tipo - O tipo de entidade (ex: "corretor", "imovel")
 * @param {string} id - O ID da entidade
 * @returns {Promise<Object>} - Resposta da API
 */
export const removerImagem = async (imagemUrl, tipo, id) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/remover-imagem`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        imagemUrl,
        tipo,
        id,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao remover imagem:", error);
    return { success: false, message: "Erro ao remover imagem" };
  }
};
