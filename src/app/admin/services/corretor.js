import axiosClient from "@/app/lib/axios-client";

export async function getCorretorById(id) {
  try {
    const response = await axiosClient.get(`/admin/corretor?id=${id}`, {
      timeout: 25000,
    });

    if (response && response.data && response.data.status === 200) {
      return {
        success: true,
        data: response.data?.data,
      };
    }
    return { success: false, error: "Corretor não encontrado" };
  } catch (error) {
    console.error(`Serviço: Erro ao buscar corretor ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.error || "Erro ao buscar corretor",
    };
  }
}

export async function deleteCorretor(id) {
  try {
    const response = await axiosClient.delete(`admin/corretor?id=${id}`);
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

export async function criarCorretor(corretor) {
  try {
    const response = await axiosClient.post("/admin/corretor", corretor);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Erro ao criar corretor:", error);
    return {
      success: false,
      message: "Erro ao criar corretor",
      data: {
        nome: "",
        email: "",
        celular: "",
      },
    };
  }
}
