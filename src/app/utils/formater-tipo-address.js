/**
 * Extrai o tipo de endereço (Rua, Avenida, etc.) de uma string
 * @param {string} address - String contendo o endereço completo
 * @returns {string} - O tipo do endereço (ex: Rua, Avenida)
 */
export function getTipoEndereco(address) {
  if (!address || typeof address !== "string") {
    return "";
  }

  // Lista de tipos de endereços comuns
  const tiposEndereco = [
    "Rua",
    "Avenida",
    "Alameda",
    "Travessa",
    "Estrada",
    "Praça",
    "Rodovia",
    "Vila",
    "Largo",
    "Viela",
  ];

  // Verifica se o endereço começa com algum dos tipos conhecidos
  for (const tipo of tiposEndereco) {
    if (address.trim().startsWith(tipo)) {
      return tipo;
    }
  }

  // Se nenhum tipo conhecido for encontrado
  const primeiraPalavra = address.trim().split(" ")[0];
  return primeiraPalavra;
}
