import axiosClient from "@/app/lib/axios-client";

export async function getDashboard() {
  try {
    const response = await axiosClient.get("admin/dashboard");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      },
    });

    // Retorna um objeto vazio para não quebrar a renderização
    return {
      data: {
        imoveis: 0,
        imoveisAtivos: 0,
        imoveisInativos: 0,
        condominios: 0,
        imoveisParaReview: 0,
      },
    };
  }
}
