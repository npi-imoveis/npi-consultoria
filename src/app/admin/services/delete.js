import axiosClient from "@/app/lib/axios-client";

export async function deleteImovelAutomacao(codigo) {
  try {
    const response = await axiosClient.delete(`/automacao/${codigo}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar imóvel:", error);
    return {
      success: false,
      message: "Erro ao deletar imóvel",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
