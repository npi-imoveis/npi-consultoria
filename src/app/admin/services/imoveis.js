import axiosClient from "@/app/lib/axios-client";

export async function getImoveisDashboard(params, page, limit) {
  try {
    const response = await axiosClient.get("admin/imoveis", {
      params: {
        ...params,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar imóveis:", error);
    throw error;
  }
}
