// Remove a palavra "Condomínio" (com ou sem acento, maiúscula ou minúscula) de uma frase
export default function removePalavraCondominio(frase) {
  // Regex: pega "condominio" ou "condomínio" com qualquer capitalização
  const regex = /condom[ií]nio/gi;
  // Remove a palavra e espaços extras
  return frase
    .replace(regex, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
