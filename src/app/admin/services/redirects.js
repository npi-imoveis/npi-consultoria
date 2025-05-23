import axiosClient from "@/app/lib/axios-client";

export async function postRedirect(params) {
  try {
    const response = await axiosClient.post(`admin/redirect`, params);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar redirect:", error);
    throw error;
  }
}

export async function deleteRedirect(source) {
  try {
    const response = await axiosClient.delete(`admin/redirect`, { data: { source } });
    return response.data;
  } catch (error) {
    console.error("Erro ao remover redirect:", error);
    throw error;
  }
}

export async function editRedirect(oldSource, source, destination) {
  try {
    const response = await axiosClient.put(`admin/redirect`, { oldSource, source, destination });
    return response.data;
  } catch (error) {
    console.error("Erro ao editar redirect:", error);
    throw error;
  }
}
