export const formatarParaReal = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "";

  // Remove qualquer caractere não numérico
  const apenasNumeros = String(valor).replace(/\D/g, "");

  // Converte para número e formata
  try {
    const numero = parseInt(apenasNumeros, 10);
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  } catch (e) {
    console.error("Erro ao formatar valor:", e);
    return String(valor);
  }
};
