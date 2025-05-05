import axiosClient from "@/app/lib/axios-client";

export async function getCorretores() {
  try {
    const response = await axiosClient.get("admin/corretores");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Erro ao buscar corretor:", error);
    return {
      success: false,
      message: "Erro ao buscar corretor",
      data: {
        nome: "",
        email: "",
        celular: "",
      },
    };
  }
}
