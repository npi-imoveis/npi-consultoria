import axiosClient from "@/app/lib/axios-client";

export async function generateUniqueCode() {
  function random6Digit() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  let attempts = 0;
  while (attempts < 50) {
    // Limite de tentativas para evitar loop infinito
    const codigo = random6Digit();
    try {
      const response = await axiosClient.get(`idgenerate?codigo=${codigo}`);
      if (response?.data?.exists === false) {
        return codigo;
      }
      // Se exists === true, apenas continua tentando
    } catch (err) {
      // Se o endpoint falhar (timeout, rede, etc), apenas continua tentando
      // Não retorna nem lança erro aqui
    }
    attempts++;
  }
  throw new Error("Não foi possível gerar um código único de 6 dígitos após várias tentativas.");
}
