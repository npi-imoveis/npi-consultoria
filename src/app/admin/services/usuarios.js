import axiosClient from "@/app/lib/axios-client";

export async function getUsuarios() {
  try {
    const response = await axiosClient.get("admin/usuarios");
    return { success: true, data: response.data };
  } catch (error) {
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
