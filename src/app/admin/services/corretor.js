import axiosClient from "@/app/lib/axios-client";

export async function getCorretorById(id) {
  try {
    const response = await axiosClient.get(`imoveis/corretor?id=${id}`);
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

export async function deleteCorretor(id) {
  try {
    const response = await axiosClient.delete(`imoveis/corretor?id=${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Erro ao deletar corretor:", error);
    return {
      success: false,
      message: "Erro ao deletar corretor",
      data: {
        nome: "",
        email: "",
        celular: "",
      },
    };
  }
}
