// ImagesSection.jsx - VERSÃO FINAL: Editável + Reagrupamento Inteligente
"use client";

import { memo, useState, useEffect } from "react";
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
  const [autoReagroupEnabled, setAutoReagroupEnabled] = useState(true);

  // Função para reagrupar fotos por padrão do código (genérica)
  const reagruparFotosPorTipo = (fotos) => {
    if (!Array.isArray(fotos) || fotos.length === 0) return fotos;

    try {
      // 1. Mapear cada foto com seu código e padrão
      const fotosComPadrao = fotos.map((foto, index) => {
        const url = foto.Foto || '';
        const nomeArquivo = url.split('/').pop() || '';
        const codigo = nomeArquivo.replace(/\.(jpg|jpeg|png|gif)$/i, '');
        
        // Extrair padrão genérico (mais robusto)
        let padrao = '';
        
        // Método melhorado: detectar todos os padrões específicos
        if (codigo.includes('i268P')) {
          padrao = 'i268P'; // Grupo 1
        } else if (codigo.includes('iUg3s56gtAT3cfaA5U90')) {
          padrao = 'iUg3s56gtAT3cfaA5U90'; // Grupo 2  
        } else if (codigo.includes('iUG8o15s')) {
          padrao = 'iUG8o15s'; // Grupo 3
        } else if (codigo.includes('i19Q55g4D1123W87')) {
          padrao = 'i19Q55g4D1123W87'; // Grupo 4
        } else if (codigo.includes('ik71mgr366')) {
          padrao = 'ik71mgr366'; // Grupo 5
        } else if (codigo.includes('ic782Y6X12Tn')) {
          padrao = 'ic782Y6X12Tn'; // Grupo 6
        } else {
          // Para códigos totalmente diferentes, usar os primeiros caracteres
          const match = codigo.match(/^([a-zA-Z]+)/);
          padrao = match ? match[1] : codigo.substring(0, Math.min(5, codigo.length));
        }
        
        return {
          foto,
          codigo,
          padrao,
          ordemOriginal: index
        };
      });

      // 2. Agrupar por padrão
      const grupos = {};
      fotosComPadrao.forEach(item => {
        if (!grupos[item.padrao]) {
          grupos[item.padrao] = [];
        }
        grupos[item.padrao].push(item);
      });

      // 3. Ordenar dentro de cada grupo pela ordem original
      Object.keys(grupos).forEach(padrao => {
        grupos[padrao].sort((a, b) => a.ordemOriginal - b.ordemOriginal);
      });

      // 4. Definir ordem dos grupos
      const ordemGrupos = [];
      fotosComPadrao.forEach(item => {
        if (!ordemGrupos.includes(item.padrao)) {
          ordemGrupos.push(item.padrao);
        }
      });

      // 5. Montar lista reagrupada
      const fotosReagrupadas = [];
      ordemGrupos.forEach(padrao => {
        if (grupos[padrao]) {
          grupos[padrao].forEach(item => {
            fotosReagrupadas.push(item.foto);
          });
        }
      });

      console.log('🔧 ADMIN: Reagrupamento aplicado:', {
        grupos: Object.keys(grupos).map(p => `${p}: ${grupos[p].length} fotos`),
        totalFotos: fotosReagrupadas.length
      });

      return fotosReagrupadas;

    } catch (error) {
      console.error('❌ Erro no reagrupamento:', error);
      return fotos;
    }
  };

  const getSortedPhotos = () => {
    if (!Array.isArray(formData?.Foto)) return [];

    try {
      // 1. FOTO DESTAQUE SEMPRE PRIMEIRO (prioridade máxima)
      const fotoDestaque = formData.Foto.find(foto => foto.Destaque === "Sim");
      
      // 2. Outras fotos (EXCLUINDO destaque para evitar duplicação)
      const outrasFotos = formData.Foto.filter(foto => foto !== fotoDestaque);
      
      // 3. Aplicar ordenação nas outras fotos (se habilitado)
      let outrasFotosProcessadas;
      
      if (autoReagroupEnabled) {
        // Verificar se existe campo ORDEM nos dados
        const temCampoOrdem = outrasFotos.some(foto => 
          foto.Ordem !== undefined || 
          foto.ordem !== undefined || 
          foto.ORDEM !== undefined
        );

        if (temCampoOrdem) {
          // Usar campo ORDEM original do MySQL para outras fotos
          outrasFotosProcessadas = [...outrasFotos].sort((a, b) => {
            const ordemA = a.Ordem || a.ordem || a.ORDEM || 999999;
            const ordemB = b.Ordem || b.ordem || b.ORDEM || 999999;
            return ordemA - ordemB; // Ordem crescente (1, 2, 3...)
          });

          console.log('🔧 ADMIN: ORDEM DA MIGRAÇÃO APLICADA:', {
            totalFotos: outrasFotosProcessadas.length,
            metodo: 'Campo ORDEM do MySQL',
            fotoDestaque: fotoDestaque ? 'SIM - será primeira sempre' : 'NÃO',
            primeiras3: outrasFotosProcessadas.slice(0, 3).map((f, i) => {
              const ordem = f.Ordem || f.ordem || f.ORDEM || 'N/A';
              return `${i+1}: [Ordem: ${ordem}]`;
            })
          });
        } else {
          // Fallback: manter ordem da API
          outrasFotosProcessadas = outrasFotos;
          console.log('⚠️ ADMIN: Campo ORDEM não encontrado:', {
            totalFotos: outrasFotos.length,
            metodo: 'Ordem original da API',
            fotoDestaque: fotoDestaque ? 'SIM - será primeira sempre' : 'NÃO',
            estruturaPrimeiraFoto: outrasFotos[0] ? Object.keys(outrasFotos[0]) : 'Nenhuma foto'
          });
        }
      } else {
        // Modo manual - manter ordem atual das outras fotos
        outrasFotosProcessadas = outrasFotos;
        console.log('🔧 ADMIN: Modo manual ativo:', {
          fotoDestaque: fotoDestaque ? 'SIM - será primeira sempre' : 'NÃO',
          outrasfotos: outrasFotos.length
        });
      }
      
      // 4. MONTAGEM FINAL: DESTAQUE SEMPRE PRIMEIRO + outras processadas
      const fotosFinais = [
        ...(fotoDestaque ? [fotoDestaque] : []), // DESTAQUE SEMPRE PRIMEIRO
        ...outrasFotosProcessadas                 // Depois as outras
      ];

      console.log('🔧 ADMIN: Processamento final - DESTAQUE PRESERVADO:', {
        total: fotosFinais.length,
        primeiraFoto: fotoDestaque ? 'DESTAQUE garantido em 1º' : 'Primeira da ordenação',
        destaque: !!fotoDestaque,
        metodo: autoReagroupEnabled ? 'DESTAQUE + Campo ORDEM da migração' : 'DESTAQUE + Ordem manual',
        verificacao: fotosFinais[0] === fotoDestaque ? 'DESTAQUE em 1º ✅' : 'Primeira por ordem ✅'
      });

      return fotosFinais;
      
    } catch (error) {
      console.error('❌ ADMIN: Erro ao ordenar fotos:', error);
      return [...formData.Foto];
    }
  };

  const sortedPhotos = getSortedPhotos();

  // Função para extrair código da foto (para debug)
  const extrairCodigoFoto = (url) => {
    if (!url) return '';
    const nomeArquivo = url.split('/').pop();
    return nomeArquivo.replace(/\.(jpg|jpeg|png|gif)$/i, '');
  };

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
    if (!isNaN(position) && position > 0 && position <= sortedPhotos.length) {
      // Desabilitar reagrupamento automático quando usuário reordena manualmente
      setAutoReagroupEnabled(false);
      changeImagePosition(codigo, position);
    }
  };

  const handleReagroupPhotos = () => {
    setAutoReagroupEnabled(true);
    // Força reprocessamento
    // As fotos serão reagrupadas na próxima renderização
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
                  onClick={handleReagroupPhotos}
                  className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                  title="Aplicar ordem da migração (campo ORDEM do MySQL) - DESTAQUE sempre em 1º"
                >
                  🔄 Ordem Migração
                </button>
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

        {/* Status do reagrupamento */}
        <div className={`p-3 rounded-md text-sm ${
          autoReagroupEnabled 
            ? 'bg-green-50 border-l-4 border-green-400 text-green-700'
            : 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700'
        }`}>
          <p>
            <strong>
              {autoReagroupEnabled 
                ? '🎯 Ordem da migração ATIVA' 
                : '✋ Ordem manual ATIVA'
              }
            </strong>
          </p>
          <p className="text-xs mt-1">
            {autoReagroupEnabled 
              ? '📸 DESTAQUE sempre em 1º + outras por campo ORDEM original do MySQL. Use os campos "Ordem" abaixo para personalizar.'
              : '📸 DESTAQUE sempre em 1º + ordem manual para as demais. Você está controlando a sequência.'
            }
          </p>
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
                      <label className="block text-xs text-gray-500 mb-1">Ordem</label>
                      <select
                        value={index + 1}
                        onChange={(e) => handlePositionChange(photo.Codigo, e.target.value)}
                        className="w-full p-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        title="Alterar posição da foto na galeria"
                      >
                        {[...Array(sortedPhotos.length)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}°
                          </option>
                        ))}
                      </select>
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
      </div>
    </FormSection>
  );
});

ImagesSection.displayName = "ImagesSection";
export default ImagesSection;
