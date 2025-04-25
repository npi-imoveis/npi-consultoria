/**
 * Remove prefixos de endereço como "Rua", "Avenida", etc. e retorna apenas o nome.
 * @param {string} address - Endereço completo
 * @returns {string} Nome do endereço sem o prefixo
 */
export function formatAddress(address) {
  if (!address) return "";

  // Lista de prefixos comuns em endereços
  const prefixes = [
    "Rua",
    "R.",
    "Avenida",
    "Av.",
    "Alameda",
    "Al.",
    "Travessa",
    "Tv.",
    "Estrada",
    "Est.",
    "Praça",
    "Pç.",
    "Rodovia",
    "Rod.",
    "Viela",
    "Beco",
    "Largo",
  ];

  // Criando um regex que busca qualquer um dos prefixos seguido por espaço
  const regexPrefixes = new RegExp(`^(${prefixes.join("|")})\\s+`, "i");

  // Removendo o prefixo e retornando apenas o nome
  return address.replace(regexPrefixes, "").trim();
}
