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

export async function addUsuario({ email, password, displayName }) {
  try {
    const response = await axiosClient.post("admin/usuarios", { email, password, displayName });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error?.response?.data?.error || "Erro ao adicionar usuário" };
  }
}

export async function updateDadosUsuario({ uid, displayName, password }) {
  try {
    const response = await axiosClient.put("admin/usuarios", { uid, displayName, password });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error?.response?.data?.error || "Erro ao atualizar dados" };
  }
}

// Função para deletar usuário
export async function deleteUsuario(uid) {
  try {
    const response = await axiosClient.delete("admin/usuarios", { data: { uid } });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error?.response?.data?.error || "Erro ao deletar usuário" };
  }
}
