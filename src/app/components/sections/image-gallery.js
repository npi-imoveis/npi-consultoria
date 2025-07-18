// ImageGallery.jsx - VERSÃO FINAL COM ORDEM CORRIGIDA
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { Share } from "../ui/share";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

export function ImageGallery({ imovel }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const isMobile = useIsMobile();

  // Função para identificar fotos do condomínio
  const isCondominioFoto = (url) => {
    if (!url) return false;
    const nomeArquivo = url.split('/').pop();
    return nomeArquivo.includes('i268P_48766b21') || 
           nomeArquivo.includes('iUg3s56gtAT3cfaA5U90_487') ||
           nomeArquivo.includes('iUG8o15s_4876');
  };

  const getProcessedImages = () => {
    if (!Array.isArray(imovel?.Foto)) return [];

    try {
      // 1. Separar fotos do condomínio e outras fotos
      const fotosCondominio = imovel.Foto.filter(foto => isCondominioFoto(foto.Foto));
      const outrasFotos = imovel.Foto.filter(foto => !isCondominioFoto(foto.Foto));

      // 2. Manter a ordem original das fotos do condomínio (como vieram da API)
      // Não aplicamos sort, mantemos a ordem original
      
      // 3. Foto destacada (se existir) vai primeiro
      const fotoDestaque = imovel.Foto.find(foto => foto.Destaque === "Sim");
      
      // 4. Criar array final:
      // - Destaque primeiro (se existir)
      // - Todas fotos do condomínio (na ordem original)
      // - Demais fotos (na ordem original)
      const fotosOrdenadas = [
        ...(fotoDestaque ? [fotoDestaque] : []),
        ...fotosCondominio,
        ...outrasFotos
      ];

      console.log('✅ Ordem das fotos:', {
        total: fotosOrdenadas.length,
        destaque: !!fotoDestaque,
        fotosCondominio: fotosCondominio.length,
        outrasFotos: outrasFotos.length,
        primeiraFoto: fotosOrdenadas[0]?.Foto,
        ultimaFoto: fotosOrdenadas[fotosOrdenadas.length - 1]?.Foto
      });

      return fotosOrdenadas.map((foto, index) => ({
        ...foto,
        Codigo: `${imovel.Codigo}-foto-${index}`,
      }));

    } catch (error) {
      console.error('❌ Erro ao processar imagens:', error);
      return [...imovel.Foto].map((foto, index) => ({
        ...foto,
        Codigo: `${imovel.Codigo}-foto-${index}`,
      }));
    }
  };

  const images = getProcessedImages();

  // ... (restante do código permanece igual)
