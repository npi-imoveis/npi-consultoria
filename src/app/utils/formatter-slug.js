export function formatterSlug(texto) {
  return texto
    .toLowerCase() // Converte tudo para minúsculas
    .normalize('NFD') // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove os diacríticos (acentos)
    .trim() // Remove espaços extras no início e no final
    .replace(/\s*-\s*/g, "-") // Remove espaços antes e depois de um hífen existente
    .replace(/\s+/g, "-") // Substitui múltiplos espaços por um único hífen
    .replace(/-+/g, "-") // Remove múltiplos hífens consecutivos
    .replace(/[^\w-]/g, ""); // Remove caracteres especiais, mantendo apenas letras, números e hífens
}