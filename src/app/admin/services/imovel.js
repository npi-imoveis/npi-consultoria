import axiosClient from "@/app/lib/axios-client";

export async function deleteImovel(id) {
  try {
    const response = await axiosClient.delete(`imoveis?id=${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Erro ao deletar imóvel:", error);
    return {
      success: false,
      message: "Erro ao deletar imóvel",
      data: {
        nome: "",
        email: "",
        celular: "",
      },
    };
  }
}
