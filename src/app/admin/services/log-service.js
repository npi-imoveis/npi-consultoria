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

export async function buscarLogs() {
  try {
    const response = await axiosClient.get("/admin/logs");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
    throw error;
  }
}
