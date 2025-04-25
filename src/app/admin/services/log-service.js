import axiosClient from "@/app/lib/axios-client";

export async function salvarLog(params) {
  try {
    const response = await axiosClient.post("/admin/logs", params);
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar log:", error);
    throw error;
  }
}
