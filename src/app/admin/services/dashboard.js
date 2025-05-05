import axiosClient from "@/app/lib/axios-client";

export async function getDashboard() {
  try {
    const response = await axiosClient.get("admin/dashboard");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    throw error;
  }
}
