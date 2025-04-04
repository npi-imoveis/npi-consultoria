export function FormatterPhoto(fotos) {
    if (!fotos || typeof fotos !== "object") return null;

    const primeiraChave = Object.keys(fotos)[0]; // Obtém a primeira chave numérica
    return fotos[primeiraChave]?.Foto || null; // Retorna a URL da primeira foto
  };