export function formatterNumber(valor) {
    // Se o valor for undefined ou null, retorna 0
    if (valor === undefined || valor === null) {
        return "0";
    }

    let valorNumerico;

    // Verifica se o valor já é um número
    if (typeof valor === "number") {
        valorNumerico = valor;
    } else if (typeof valor === "string") {
        // Remove todos os caracteres não-numéricos, exceto ponto e vírgula
        const valorLimpo = valor.replace(/[^\d.,]/g, "");

        // Verifica se a string usa vírgula como separador decimal
        if (valorLimpo.includes(",") && !valorLimpo.includes(".")) {
            // Substitui vírgula por ponto para converter para número
            valorNumerico = parseFloat(valorLimpo.replace(",", "."));
        }
        // Verifica se possui ambos vírgula e ponto (formato brasileiro com milhar)
        else if (valorLimpo.includes(",") && valorLimpo.includes(".")) {
            // Remove os pontos e substitui a vírgula por ponto
            valorNumerico = parseFloat(valorLimpo.replace(/\./g, "").replace(",", "."));
        }
        // Caso contrário, apenas converte para float
        else {
            valorNumerico = parseFloat(valorLimpo);
        }
    } else {
        // Tenta converter para número ou retorna 0
        valorNumerico = Number(valor) || 0;
    }

    // Verifica se a conversão resultou em um número válido
    if (isNaN(valorNumerico)) {
        valorNumerico = 0;
    }

    // Remove as casas decimais usando Math.floor e formata sem decimais
    valorNumerico = Math.floor(valorNumerico);

    // Formata o valor para formato brasileiro sem casas decimais
    return valorNumerico.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
} 