import axiosClient from "@/app/lib/axios-client";

export async function getImoveisDashboard(params = {}, page = 1, limit = 12) {
  try {
    const query = new URLSearchParams();

    // Adiciona os filtros normais
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => query.append(key, val)); // array → múltiplos params
      } else if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });

    // Paginação
    query.append("page", page);
    query.append("limit", limit);

    const response = await axiosClient.get(`admin/imoveis?${query.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar imóveis:", error);
    throw error;
  }
}
