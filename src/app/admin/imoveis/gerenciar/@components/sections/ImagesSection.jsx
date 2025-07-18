"use client";

import { memo, useState } from "react";
import FormSection from "../FormSection";
import Image from "next/image";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const ImagesSection = memo(({
  formData,
  addSingleImage,
  showImageModal,
  updateImage,
  removeImage,
  removeAllImages,
  setImageAsHighlight,
  changeImagePosition,
  validation
}) => {
  const [downloadingPhotos, setDownloadingPhotos] = useState(false);

  // Função para extrair código único da foto (sem extensão)
  const extrairCodigoFoto = (url) => {
    if (!url) return '';
    const nomeArquivo = url.split('/').pop();
    return nomeArquivo.replace(/\.(jpg|jpeg|png|gif)$/i, '');
  };

  // Função para obter a ordem original baseada no código da foto
  const obterOrdemOriginal = (foto) => {
    const url = foto.Foto || '';
    const codigo = extrairCodigoFoto(url);
    
    // Se a foto não tem código reconhecível, coloca no final
    if (!codigo) return 9999;
    
    // Usar timestamp/hash do código como ordenação
    // Fotos da mesma migração terão padrões similares
    if (codigo.includes('i268P_48766b21')) {
      // Extrair o hash final para ordenação
      const hashMatch = codigo.match(/i268P_48766b21(.+)/);
      if (hashMatch) {
        // Converter hash em número para ordenação consistente
        return parseInt(hashMatch[1].substring(0, 8), 16) || 0;
      }
    }
    
    if (codigo.includes('iUg3s56gtAT3cfaA5U90_487')) {
      const hashMatch = codigo.match(/iUg3s56gtAT3cfaA5U90_487(.+)/);
      if (hashMatch) {
        // Somar offset para vir depois das i268P
        return 100000 + (parseInt(hashMatch[1].substring(0, 8), 16) || 0);
      }
    }
    
    if (codigo.includes('iUG8o15s_4876')) {
      const hashMatch = codigo.match(/iUG8o15s_4876(.+)/);
      if (hashMatch) {
        // Somar offset para vir por último
        return 200000 + (parseInt(hashMatch[1].substring(0, 8), 16) || 0);
      }
    }
    
    // Outros tipos no final
    return 9999;
  };

  const getSortedPhotos = () => {
    if (!Array.isArray(formData?.Foto)) return [];

    try {
      // 1. Foto destacada (se existir)
      const fotoDestaque = formData.Foto.find(foto => foto.Destaque === "Sim");
      
      // 2. Outras fotos - reagrupar por padrão do código
      const outrasFotos = formData.Foto.filter(foto => foto !== fotoDestaque);
      
      // 3. Extrair código de cada foto para agrupar por tipo
      const fotosComCodigo = outrasFotos.map((foto, index) => {
        const url = foto.Foto || '';
        const nomeArquivo = url.split('/').pop() || '';
        const codigo = nomeArquivo.replace(/\.(jpg|jpeg|png|gif)$/i, '');
        
        // Extrair prefixo genérico do código para agrupar (primeiros caracteres)
        // Isso funcionará para qualquer imóvel
        let prefixo = '';
        
        // Pegar padrão até o primeiro underscore ou até 15 caracteres
        const underscoreIndex = codigo.indexOf('_');
        if (underscoreIndex > 0) {
          prefixo = codigo.substring(0, underscoreIndex + 1);
        } else {
          // Se não tem underscore, pega os primeiros 10 caracteres
          prefixo = codigo.substring(0, Math.min(10, codigo.length));
        }
        
        return {
          foto,
          codigo,
          prefixo,
          ordemOriginal: index
        };
      });
      
      // 4. Agrupar por prefixo e ordenar cada grupo pela ordem original
      const grupos = {};
      fotosComCodigo.forEach(item => {
        if (!grupos[item.prefixo]) {
          grupos[item.prefixo] = [];
        }
        grupos[item.prefixo].push(item);
      });
      
      // 5. Ordenar fotos dentro de cada grupo pela ordem original
      Object.keys(grupos).forEach(prefixo => {
        grupos[prefixo].sort((a, b) => a.ordemOriginal - b.ordemOriginal);
      });
      
      // 6. Definir ordem dos grupos pela primeira aparição na ordem original
      const ordemGrupos = [];
      fotosComCodigo.forEach(item => {
        if (!ordemGrupos.includes(item.prefixo)) {
          ordemGrupos.push(item.prefixo);
        }
      });
      
      // 7. Montar array final: destaque + grupos ordenados
      const fotosReagrupadas = [];
      
      ordemGrupos.forEach(prefixo => {
        if (grupos[prefixo]) {
          grupos[prefixo].forEach(item => {
            fotosReagrupadas.push(item.foto);
          });
        }
      });
      
      const fotosOrdenadas = [
        ...(fotoDestaque ? [fotoDestaque] : []),
        ...fotosReagrupadas
      ];

      console.log('🔧 ADMIN: Fotos reagrupadas por tipo:', {
        total: fotosOrdenadas.length,
        destaque: !!fotoDestaque,
        grupos: Object.keys(grupos).map(prefixo => `${prefixo}: ${grupos[prefixo].length} fotos`),
        regraupamento: 'APLICADO'
      });

      return fotosOrdenadas;
      
    } catch (error) {
      console.error('❌ ADMIN: Erro ao ordenar fotos:', error);
      return [...formData.Foto];
    }
  };

  const sortedPhotos = getSortedPhotos();

  const baixarTodasImagens = async (imagens = []) => {
    if (!Array.isArray(imagens)) return;

    setDownloadingPhotos(true);
    const zip = new JSZip();
    const pasta = zip.folder("imagens");

    for (const [i, img] of imagens.entries()) {
      try {
        const cleanUrl = (() => {
          try {
            const parsed = new URL(img.Foto);
            if (parsed.pathname.startsWith("/_next/image")) {
              const inner = parsed.searchParams.get("url");
              return decodeURIComponent(inner || img.Foto);
            }
            return img.Foto;
          } catch {
            return img.Foto;
          }
        })();

        const response = await fetch(cleanUrl);
        if (!response.ok) continue;

        const blob = await response.blob();
        const nome = `imagem-${i + 1}.jpg`;
        pasta?.file(nome, blob);
      } catch (err) {
        console.error(`Erro ao baixar imagem ${i + 1}:`, err);
      }
    }

    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "imagens.zip");
    } catch (zipError) {
      console.error("Erro ao gerar zip:", zipError);
    }

    setDownloadingPhotos(false);
  };

  const handleAddImageUrl = () => {
    const imageUrl = prompt("Digite a URL da imagem:");
    if (imageUrl?.trim()) {
      addSingleImage(imageUrl.trim());
    }
  };

  const handleImageUpload = (codigo) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          updateImage(codigo, e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  const handlePositionChange = (codigo, newPosition) => {
    const position = parseInt(newPosition);
    if (!isNaN(position)) {
      changeImagePosition(codigo, position);
    }
  };

  return (
    <FormSection title="Imagens do Imóvel" className="mb-8">
      <div className="space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="text-sm">
            <span className="font-medium text-gray-700">
              {validation.photoCount}/{validation.requiredPhotoCount} fotos
            </span>
            {validation.photoCount < validation.requiredPhotoCount && (
              <span className="text-red-500 ml-2">
                (Mínimo {validation.requiredPhotoCount})
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              + Adicionar URL
            </button>
            <button
              type="button"
              onClick={showImageModal}
              className="px-3 py-1.5 text-sm bg-black hover:bg-gray-800 text-white rounded-md transition-colors"
            >
              📤 Upload em Lote
            </button>

            {sortedPhotos.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => baixarTodasImagens(sortedPhotos)}
                  disabled={downloadingPhotos}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    downloadingPhotos
                      ? 'bg-blue-300 text-white cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {downloadingPhotos ? 'Baixando...' : '⬇️ Baixar Todas'}
                </button>
                <button
                  type="button"
                  onClick={removeAllImages}
                  className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  🗑️ Limpar Tudo
                </button>
              </>
            )}
          </div>
        </div>

        {sortedPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPhotos.map((photo, index) => (
              <div key={`${photo.Codigo}-${index}`} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="relative aspect-video w-full">
                  <Image
                    src={photo.Foto}
                    alt={`Imóvel ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {photo.Destaque === "Sim" && (
                    <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                      DESTAQUE
                    </span>
                  )}
                </div>

                <div className="p-3 space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Ordem (Migração)</label>
                      <input
                        type="text"
                        value={`${index + 1}°`}
                        readOnly
                        className="w-full p-1.5 text-sm border rounded-md bg-gray-100 text-gray-600"
                        title="Ordem baseada na migração original - somente leitura"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Ação</label>
                      <button
                        onClick={() => setImageAsHighlight(photo.Codigo)}
                        className={`w-full p-1.5 text-sm rounded-md transition-colors ${
                          photo.Destaque === "Sim"
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {photo.Destaque === "Sim" ? "★ Destaque" : "☆ Tornar Destaque"}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 truncate" title={extrairCodigoFoto(photo.Foto)}>
                    Código: {extrairCodigoFoto(photo.Foto)}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleImageUpload(photo.Codigo)}
                      className="flex-1 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
                    >
                      🔄 Trocar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(photo.Codigo)}
                      className="flex-1 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors"
                    >
                      ✖ Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Nenhuma imagem cadastrada</p>
            <p className="text-sm text-gray-400 mt-1">
              Utilize os botões acima para adicionar imagens
            </p>
          </div>
        )}

        {validation.photoCount < validation.requiredPhotoCount && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
            <p className="text-yellow-700 text-sm">
              ⚠️ Adicione pelo menos {validation.requiredPhotoCount} fotos para publicar
            </p>
          </div>
        )}

        <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
          <p className="text-blue-700 text-sm">
            📸 <strong>Ordem automática aplicada:</strong> Foto destaque primeiro + demais na sequência da migração original
          </p>
        </div>
      </div>
    </FormSection>
  );
});

ImagesSection.displayName = "ImagesSection";
export default ImagesSection;
