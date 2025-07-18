// ImageGallery.jsx - VERSÃO COM FOTOS DO CONDOMÍNIO NO FINAL
export function ImageGallery({ imovel }) {
  // ... (código anterior mantido igual)

  const getProcessedImages = () => {
    if (!Array.isArray(imovel?.Foto)) return [];

    try {
      // 1. Separar fotos NÃO do condomínio (para vir primeiro)
      const fotosNormais = imovel.Foto.filter(foto => !isCondominioFoto(foto.Foto));
      
      // 2. Separar fotos DO condomínio (para vir por último)
      const fotosCondominio = imovel.Foto.filter(foto => isCondominioFoto(foto.Foto));

      // 3. Foto destacada (se existir) vai primeiro, independente do tipo
      const fotoDestaque = imovel.Foto.find(foto => foto.Destaque === "Sim");
      
      // 4. Criar array final:
      // - Destaque primeiro (se existir)
      // - Fotos normais (na ordem original)
      // - Fotos do condomínio (na ordem original)
      const fotosOrdenadas = [
        ...(fotoDestaque ? [fotoDestaque] : []),
        ...fotosNormais,
        ...fotosCondominio
      ];

      console.log('✅ Ordem ajustada - Condomínio no final:', {
        total: fotosOrdenadas.length,
        destaque: !!fotoDestaque,
        fotosNormais: fotosNormais.length,
        fotosCondominio: fotosCondominio.length,
        primeirasFotos: fotosOrdenadas.slice(0, 3).map(f => f.Foto.split('/').pop()),
        ultimasFotos: fotosOrdenadas.slice(-3).map(f => f.Foto.split('/').pop())
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
