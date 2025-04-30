"use client";

import { Heart, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import useFavoritosStore from "../../store/favoritosStore";

export function Share({ url, title = "Confira este imóvel!", imovel, variant = "primary" }) {
  const { isFavorito, adicionarFavorito, removerFavorito } = useFavoritosStore();
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    // Define a URL de compartilhamento no lado do cliente
    setShareUrl(url);
  }, [url]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          url: shareUrl,
        });
      } else {
        // Fallback para navegadores que não suportam a API Share
        navigator.clipboard.writeText(shareUrl);
        alert("Link copiado para a área de transferência!");
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  const toggleFavorite = () => {
    if (imovel && imovel.Codigo) {
      if (isFavorito(imovel.Codigo)) {
        removerFavorito(imovel.Codigo);
      } else {
        adicionarFavorito(imovel);
      }
    }
  };

  // Verificar se o imóvel está nos favoritos
  const favorito = imovel && imovel.Codigo ? isFavorito(imovel.Codigo) : false;

  return (
    <div className="flex gap-4">
      <button
        onClick={toggleFavorite}
        className={`transition-colors duration-300 hover:text-red-500 ${
          variant === "primary" ? "text-white" : "text-zinc-700"
        }`}
        aria-label="Favoritar"
      >
        <Heart
          size={22}
          fill={favorito ? "#ef4444" : "none"}
          color={favorito ? "#ef4444" : "currentColor"}
        />
      </button>
      <button
        onClick={handleShare}
        className={`transition-colors duration-300 hover:text-[#8B6F48] ${
          variant === "primary" ? "text-white" : "text-zinc-700"
        }`}
        aria-label="Compartilhar"
      >
        <Share2 size={22} />
      </button>
    </div>
  );
}
