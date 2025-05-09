export function getYoutubeEmbedUrl(videoValue) {
  if (!videoValue) return null;
  // Se já for um link embed, retorna ele mesmo
  if (videoValue.includes("youtube.com/embed/")) {
    // Extrai o id do vídeo para a thumbnail
    const match = videoValue.match(/embed\/([a-zA-Z0-9_-]+)/);
    return {
      embed: videoValue,
      codigo: match ? match[1] : null,
    };
  }
  // Se for só o id, monta o embed
  return {
    embed: `https://www.youtube.com/embed/${videoValue}`,
    codigo: videoValue,
  };
}
