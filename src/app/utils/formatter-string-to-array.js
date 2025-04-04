export function formatterStringToArray(inputString) {
  if (!inputString) return [];

  // Dividir a string por quebras de linha (\r\n, \r, \n) ou vírgulas
  const itens = inputString.split(/\r\n|\r|\n|,/);

  // Remover itens vazios e duplicados
  const resultado = [...new Set(itens.filter((item) => item.trim() !== ""))];

  return resultado;
}
