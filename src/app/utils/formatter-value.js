export function formatterValue(valor) {
  // Se o valor for undefined ou null, retorna R$ 0,00
  if (valor === undefined || valor === null) {
    return "R$ 0,00";
  }

  // Se o valor for uma string vazia ou só espaços, retorna R$ 0,00
  if (typeof valor === "string" && valor.trim() === "") {
    return "R$ 0,00";
  }

  let valorNumerico;

  // Verifica se o valor já é um número
  if (typeof valor === "number") {
    valorNumerico = valor;
  } else if (typeof valor === "string") {
    // Verificar se o valor já está formatado como moeda brasileira
    // Pattern para detectar formato R$ x.xxx,xx ou R$x.xxx,xx
    const jEhMoedaFormatada = /^R\$\s*[\d.,]+$/.test(valor.trim());

    if (jEhMoedaFormatada) {
      // Remove "R$" e espaços, mantendo apenas números, pontos e vírgulas
      const valorSemMoeda = valor.replace(/R\$\s*/g, "").trim();

      // Processa o valor sem o símbolo de moeda
      valorNumerico = processarStringNumerica(valorSemMoeda);
    } else {
      // Remove TODOS os caracteres não-numéricos, exceto ponto e vírgula
      const valorLimpo = valor.replace(/[^\d.,]/g, "");

      // Se após a limpeza não sobrou nada, considera como 0
      if (valorLimpo === "") {
        valorNumerico = 0;
      } else {
        valorNumerico = processarStringNumerica(valorLimpo);
      }
    }
  } else {
    // Tenta converter para número ou retorna 0
    valorNumerico = Number(valor) || 0;
  }

  // Verifica se a conversão resultou em um número válido
  if (isNaN(valorNumerico) || !isFinite(valorNumerico)) {
    valorNumerico = 0;
  }

  // Garantir que o valor não seja negativo (opcional, remover se precisar de valores negativos)
  valorNumerico = Math.abs(valorNumerico);

  // Formata o valor para moeda brasileira
  return valorNumerico.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Função auxiliar para processar strings numéricas
function processarStringNumerica(valorLimpo) {
  // Verifica se a string usa vírgula como separador decimal (sem ponto)
  if (valorLimpo.includes(",") && !valorLimpo.includes(".")) {
    // Formato: 1000,50 ou 1,50
    return parseFloat(valorLimpo.replace(",", "."));
  }
  // Verifica se possui ambos vírgula e ponto (formato brasileiro com milhares)
  else if (valorLimpo.includes(",") && valorLimpo.includes(".")) {
    // Formato: 1.000,50
    // Conta quantos pontos e vírgulas existem
    const pontos = (valorLimpo.match(/\./g) || []).length;
    const virgulas = (valorLimpo.match(/,/g) || []).length;

    // Se há apenas uma vírgula e ela está nos últimos 3 caracteres, é separador decimal
    const ultimaVirgula = valorLimpo.lastIndexOf(",");
    if (virgulas === 1 && ultimaVirgula >= valorLimpo.length - 3) {
      // Remove todos os pontos (separadores de milhares) e substitui vírgula por ponto
      return parseFloat(valorLimpo.replace(/\./g, "").replace(",", "."));
    }
    // Caso contrário, assume que pontos são separadores decimais (formato internacional)
    else {
      // Remove vírgulas e mantém pontos
      return parseFloat(valorLimpo.replace(/,/g, ""));
    }
  }
  // Se só tem pontos (formato internacional) ou só números
  else {
    // Formato: 1000.50 ou 1000
    return parseFloat(valorLimpo);
  }
}
