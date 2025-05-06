import axiosClient from "@/app/lib/axios-client";

export async function vincularImovelCorretor(id_corretor, id_imovel) {
  try {
    const response = await axiosClient.post(
      `admin/corretor/vincular?id_corretor=${id_corretor}&id_imovel=${id_imovel}`
    );

    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error("Erro ao vincular imóvel ao corretor:", error);
    return { success: false, error: "Erro ao vincular imóvel ao corretor" };
  }
}

export async function desvincularImovelCorretor(id_corretor, id_imovel) {
  try {
    const response = await axiosClient.put(
      `admin/corretor/vincular?id_corretor=${id_corretor}&id_imovel=${id_imovel}`
    );

    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error("Erro ao desvincular imóvel do corretor:", error);
    return { success: false, error: "Erro ao desvincular imóvel do corretor" };
  }
}
