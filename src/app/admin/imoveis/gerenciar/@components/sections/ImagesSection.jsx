"use client";

import { memo, useState, useMemo, useEffect, useCallback } from "react";
import FormSection from "../FormSection";
import Image from "next/image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { photoSorter } from "@/app/utils/photoSorter";

const ImagesSection = memo(({
  formData,
  addSingleImage,
  showImageModal,
  updateImage,
  removeImage,
  removeAllImages,
  setImageAsHighlight,
  changeImagePosition,
  validation,
  onUpdatePhotos
}) => {
  const [downloadingPhotos, setDownloadingPhotos] = useState(false);
  const [localPhotoOrder, setLocalPhotoOrder] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  // 🔥 ESTADO CRÍTICO PARA PROTEGER IMÓVEIS VENDIDOS
  const [protectedPhotosState, setProtectedPhotosState] = useState(null);
  const [lastFormDataHash, setLastFormDataHash] = useState(null);
  
  // 🔥 VERIFICAR SE É IMÓVEL VENDIDO
  const isImovelVendido = formData?.Status === "VENDIDO";
  
  // 🔥 FUNÇÃO PARA GERAR HASH DOS DADOS IMPORTANTES (SEM FOTOS)
  const generateFormDataHash = useCallback((data) => {
    if (!data) return null;
    
    // Apenas campos que NÃO são fotos para detectar mudanças reais
    const relevantFields = {
      Codigo: data.Codigo,
      Empreendimento: data.Empreendimento,
      ValorAluguelSite: data.ValorAluguelSite,
      ValorAntigo: data.ValorAntigo,
      Status: data.Status,
      Ativo: data.Ativo,
      // Não incluir Foto aqui
    };
    
    return JSON.stringify(relevantFields);
  }, []);
  
  // 🔥 DETECTAR MUDANÇAS NOS CAMPOS (SEM INCLUIR FOTOS)
  useEffect(() => {
    const currentHash = generateFormDataHash(formData);
    
    if (currentHash !== lastFormDataHash && currentHash !== null) {
      console.log('🔄 FormData alterado (campos não-foto):', {
        isImovelVendido,
        hashAnterior: lastFormDataHash?.slice(0, 50),
        hashAtual: currentHash?.slice(0, 50)
      });
      
      // 🔥 PARA IMÓVEIS VENDIDOS: PROTEGER ESTADO DAS FOTOS
      if (isImovelVendido && formData?.Foto && lastFormDataHash) {
        console.log('🛡️ PROTEGENDO estado das fotos do imóvel VENDIDO');
        
        // Verificar se as fotos estão sendo corrompidas
        const fotosComProblemas = formData.Foto.filter(foto => 
          foto.Destaque !== "Sim" && foto.Destaque !== "Nao"
        );
        
        if (fotosComProblemas.length > 0) {
          console.warn('⚠️ FOTOS CORROMPIDAS detectadas em imóvel VENDIDO:', fotosComProblemas);
        }
        
        // Manter estado protegido se necessário
        if (protectedPhotosState && protectedPhotosState.length === formData.Foto.length) {
          console.log('🔒 Usando estado protegido de fotos');
          setLocalPhotoOrder(protectedPhotosState);
        }
      }
      
      setLastFormDataHash(currentHash);
    }
  }, [formData, lastFormDataHash, generateFormDataHash, isImovelVendido, protectedPhotosState]);

  console.log('🏷️ Status do imóvel:', formData?.Status, '| É vendido?', isImovelVendido);
  
  // 🔥 DETECÇÃO CRÍTICA CORRIGIDA: Verificar se há ordem manual REAL
  const hasManualOrder = useMemo(() => {
    if (!formData?.Foto || formData.Foto.length === 0) return false;
    
    // 🚀 CORREÇÃO: Verificar múltiplos indicadores de ordem manual
    const todasTemOrdem = formData.Foto.every(foto => {
      const temOrdemMaiuscula = typeof foto.Ordem === 'number' && foto.Ordem >= 0;
      const temOrdemMinuscula = typeof foto.ordem === 'number' && foto.ordem >= 0;
      const temTipoBanco = foto.tipoOrdenacao === 'banco';
      const temTipoManual = foto.tipoOrdenacao === 'manual';
      
      return temOrdemMaiuscula || temOrdemMinuscula || temTipoBanco || temTipoManual;
    });
    
    if (!todasTemOrdem) return false;
    
    // 🔥 NOVA LÓGICA: Se tem tipo banco/manual, é válido automaticamente
    const temTipoValido = formData.Foto.some(foto => 
      foto.tipoOrdenacao === 'banco' || 
      foto.tipoOrdenacao === 'manual'
    );
    
    if (temTipoValido) {
      console.log('📸 Ordem manual detectada por tipo (banco/manual)');
      return true;
    }
    
    // Verificação tradicional para compatibilidade
    const ordens = formData.Foto.map(foto => {
      const ordem = foto.Ordem !== undefined ? foto.Ordem : foto.ordem;
      return typeof ordem === 'number' ? ordem : 0;
    }).sort((a, b) => a - b);

    const hasValidOrders = ordens.length > 0 && ordens.every(ordem => ordem >= 0);
    const todasIguais = ordens.every(ordem => ordem === ordens[0]);
    
    const resultado = hasValidOrders && !todasIguais;
    
    console.log('🔍 VERIFICAÇÃO DE ORDEM MANUAL COMPLETA:', {
      totalFotos: formData.Foto.length,
      todasTemOrdem,
      temTipoValido,
      ordensValidas: hasValidOrders,
      todasIguais,
      ordens: ordens.slice(0, 5),
      tipos: formData.Foto.slice(0, 3).map(f => f.tipoOrdenacao),
      hasManualOrder: resultado || temTipoValido,
      isImovelVendido
    });
    
    return resultado || temTipoValido;
  }, [formData?.Foto, isImovelVendido]);

  // 🎯 ORDENAÇÃO COM PROTEÇÃO TOTAL PARA IMÓVEIS VENDIDOS
  const sortedPhotos = useMemo(() => {
    if (!Array.isArray(formData?.Foto) || formData.Foto.length === 0) {
      return [];
    }

    console.group('📋 ORDENAÇÃO - Decisão do Sistema');
    console.log('Estado:', {
      totalFotos: formData.Foto.length,
      temOrdemLocal: !!localPhotoOrder,
      temOrdemManual: hasManualOrder,
      isReordering,
      isRemoving,
      isImovelVendido,
      temEstadoProtegido: !!protectedPhotosState,
      primeiras3Ordens: formData.Foto.slice(0, 3).map(f => f.ordem || f.Ordem)
    });

    // 🔥 PROTEÇÃO ESPECIAL PARA IMÓVEIS VENDIDOS
    if (isImovelVendido) {
      console.log('🛡️ IMÓVEL VENDIDO - Aplicando proteções especiais');
      
      // Verificar se todas as fotos têm destaque (problema comum)
      const fotosComDestaque = formData.Foto.filter(f => f.Destaque === "Sim");
      const todasComDestaque = fotosComDestaque.length === formData.Foto.length;
      
      if (todasComDestaque && formData.Foto.length > 1) {
        console.error('🚨 PROBLEMA DETECTADO: Todas as fotos estão com destaque!');
        
        // Usar estado protegido se disponível
        if (protectedPhotosState) {
          console.log('🔒 Recuperando do estado protegido');
          console.groupEnd();
          return protectedPhotosState;
        }
        
        // Senão, corrigir mantendo apenas a primeira como destaque
        const fotosCorrigidas = formData.Foto.map((foto, index) => ({
          ...foto,
          Destaque: index === 0 ? "Sim" : "Nao"
        }));
        
        console.log('🔧 Corrigindo destaque automático - apenas primeira foto');
        setProtectedPhotosState(fotosCorrigidas);
        console.groupEnd();
        return fotosCorrigidas;
      }
    }

    // 1️⃣ PRIORIDADE MÁXIMA: Ordem local (usuário acabou de alterar)
    if (localPhotoOrder && !isReordering && !isRemoving) {
      console.log('✅ Usando ORDEM LOCAL (alteração em tempo real)');
      
      // 🔥 PARA IMÓVEIS VENDIDOS: Salvar como estado protegido
      if (isImovelVendido) {
        setProtectedPhotosState([...localPhotoOrder]);
      }
      
      console.groupEnd();
      return localPhotoOrder;
    }

    // 2️⃣ PRIORIDADE ALTA: Ordem manual salva
    if (hasManualOrder) {
      console.log('✅ Usando ORDEM MANUAL SALVA (protegida do PhotoSorter)');
      
      const fotosParaOrdenar = [...formData.Foto];
      
      // 🔥 VERIFICAÇÃO ESPECÍFICA PARA IMÓVEIS VENDIDOS
      if (isImovelVendido) {
        console.log('🏷️ IMÓVEL VENDIDO detectado - verificando integridade das fotos:');
        fotosParaOrdenar.forEach((foto, index) => {
          console.log(`  Foto ${index}: Código=${foto.Codigo}, Ordem=${foto.Ordem}, Destaque=${foto.Destaque}`);
        });
      }
      
      // Ordenar por campo Ordem ou ordem
      const fotosOrdenadas = fotosParaOrdenar.sort((a, b) => {
        const ordemA = a.Ordem !== undefined ? a.Ordem : (a.ordem !== undefined ? a.ordem : 999);
        const ordemB = b.Ordem !== undefined ? b.Ordem : (b.ordem !== undefined ? b.ordem : 999);
        return ordemA - ordemB;
      });
      
      // 🔥 PARA IMÓVEIS VENDIDOS: Salvar como estado protegido
      if (isImovelVendido) {
        setProtectedPhotosState([...fotosOrdenadas]);
      }
      
      console.groupEnd();
      return fotosOrdenadas;
    }

    // 3️⃣ ÚLTIMO RECURSO: Ordem inteligente (PhotoSorter)
    try {
      console.log('✅ Aplicando ORDEM INTELIGENTE (PhotoSorter)');
      
      photoSorter.limparCache();
      
      const fotosComCodigos = formData.Foto.map((foto, index) => ({
        ...foto,
        codigoOriginal: foto.Codigo || foto.codigo || `temp-${index}`
      }));
      
      const fotosLimpas = fotosComCodigos.map(foto => {
        const { Ordem, ordem, ORDEM, codigoOriginal, ...fotoLimpa } = foto;
        return { ...fotoLimpa, codigoOriginal };
      });
      
      const fotosOrdenadas = photoSorter.ordenarFotos(fotosLimpas, formData.Codigo || 'temp');
      
      const resultado = fotosOrdenadas.map((foto, index) => ({
        ...foto,
        Codigo: foto.codigoOriginal,
        Ordem: index,
        ordem: undefined,
        codigoOriginal: undefined
      }));

      // 🔥 PARA IMÓVEIS VENDIDOS: Salvar como estado protegido
      if (isImovelVendido) {
        setProtectedPhotosState([...resultado]);
      }

      console.log('📊 PhotoSorter aplicado:', resultado.length, 'fotos ordenadas');
      console.groupEnd();
      return resultado;

    } catch (error) {
      console.error('❌ Erro no PhotoSorter:', error);
      console.groupEnd();
      return [...formData.Foto];
    }
  }, [formData?.Foto, formData?.Codigo, localPhotoOrder, hasManualOrder, isReordering, isRemoving, isImovelVendido, protectedPhotosState]);

  // 🔥 USEEFFECT PARA LIMPAR ESTADO LOCAL QUANDO formData MUDA EXTERNAMENTE
  useEffect(() => {
    if (formData?.Foto && localPhotoOrder && !isReordering && !isRemoving) {
      // Verificar se as ordens do formData são diferentes do estado local
      const formDataOrdens = formData.Foto.map(f => f.Ordem).join(',');
      const localOrdens = localPhotoOrder.map(f => f.Ordem).join(',');
      
      if (formDataOrdens !== localOrdens) {
        console.log('📸 FormData mudou externamente - limpando estado local');
        setLocalPhotoOrder(null);
      }
    }
  }, [formData?.Foto, localPhotoOrder, isReordering, isRemoving]);

  // 🔥 REORDENAÇÃO CORRIGIDA
  const handlePositionChange = async (codigo, newPosition) => {
    const position = parseInt(newPosition);
    const currentIndex = sortedPhotos.findIndex(p => p.Codigo === codigo);
    
    if (isNaN(position) || position < 1 || position > sortedPhotos.length || (position - 1) === currentIndex) {
      return;
    }
    
    console.group('🔄 REORDENAÇÃO MANUAL INICIADA');
    console.log('Foto:', codigo);
    console.log('De:', currentIndex + 1, '→ Para:', position);
    console.log('Status do imóvel:', formData?.Status);
    
    setIsReordering(true);
    
    try {
      photoSorter.limparCache();
      
      const fotosParaReordenar = localPhotoOrder || [...sortedPhotos];
      const novaOrdem = [...fotosParaReordenar];
      const fotoMovida = novaOrdem[currentIndex];
      
      novaOrdem.splice(currentIndex, 1);
      novaOrdem.splice(position - 1, 0, fotoMovida);
      
      const novaOrdemComIndices = novaOrdem.map((foto, index) => ({
        ...foto,
        Ordem: index,
        ordem: undefined,
        tipoOrdenacao: 'manual'
      }));
      
      console.log('📊 Nova ordem aplicada:', novaOrdemComIndices.map((f, i) => `${i}: ${f.Ordem}`));
      
      setLocalPhotoOrder(novaOrdemComIndices);
      
      // 🔥 PARA IMÓVEIS VENDIDOS: Atualizar estado protegido
      if (isImovelVendido) {
        setProtectedPhotosState([...novaOrdemComIndices]);
      }
      
      setTimeout(() => {
        if (typeof onUpdatePhotos === 'function') {
          console.log('📤 Propagando para componente pai...');
          onUpdatePhotos(novaOrdemComIndices);
        }
      }, 100);
      
      console.log('✅ Reordenação manual concluída');
      
    } catch (error) {
      console.error('❌ Erro na reordenação:', error);
    } finally {
      setTimeout(() => {
        setIsReordering(false);
      }, 500);
    }
    
    console.groupEnd();
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
      try {
        new URL(imageUrl.trim());
        addSingleImage(imageUrl.trim());
        setLocalPhotoOrder(null);
      } catch {
        alert('URL inválida.');
      }
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
          setLocalPhotoOrder(null);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  // 🔥 FUNÇÃO DE REMOÇÃO CORRIGIDA PARA IMÓVEIS VENDIDOS
  const handleRemoveImage = async (codigo) => {
    console.group('🗑️ REMOVENDO FOTO');
    console.log('Foto a ser removida:', codigo);
    console.log('Total atual de fotos:', sortedPhotos.length);
    console.log('🏷️ Status do imóvel:', formData?.Status);
    
    // 🔥 VALIDAÇÃO CRÍTICA PARA IMÓVEIS VENDIDOS
    if (isImovelVendido) {
      console.log('⚠️ IMÓVEL VENDIDO detectado - aplicando validações rigorosas');
      
      if (sortedPhotos.length <= 1) {
        console.error('❌ BLOQUEADO: Não é possível remover última foto de imóvel VENDIDO');
        alert('Não é possível remover a última foto de um imóvel vendido.');
        console.groupEnd();
        return;
      }
      
      // Log detalhado das fotos antes da remoção
      sortedPhotos.forEach((foto, index) => {
        console.log(`  Foto ${index}: ${foto.Codigo} - Destaque: ${foto.Destaque} - Ordem: ${foto.Ordem}`);
      });
    }
    
    setIsRemoving(true);
    
    try {
      // Obter fotos atuais do estado mais confiável
      const fotosAtuais = protectedPhotosState || localPhotoOrder || [...sortedPhotos];
      console.log('Fotos atuais consideradas:', fotosAtuais.length);
      
      // Verificar se a foto a ser removida realmente existe
      const fotoParaRemover = fotosAtuais.find(f => f.Codigo === codigo);
      if (!fotoParaRemover) {
        console.error('❌ Foto não encontrada no estado atual');
        console.groupEnd();
        return;
      }
      
      // Remover foto e reordenar
      const fotosAposRemocao = fotosAtuais
        .filter(foto => foto.Codigo !== codigo)
        .map((foto, index) => ({
          ...foto,
          Ordem: index,
          tipoOrdenacao: 'manual'
        }));
      
      console.log('Fotos após remoção:', fotosAposRemocao.length);
      console.log('Nova sequência de ordens:', fotosAposRemocao.map(f => f.Ordem).join(','));
      
      // 🔥 VERIFICAÇÃO CRÍTICA PARA IMÓVEIS VENDIDOS
      if (isImovelVendido && fotosAposRemocao.length > 0) {
        console.log('🔒 Verificação pós-remoção para imóvel VENDIDO:');
        
        const fotosComDestaque = fotosAposRemocao.filter(f => f.Destaque === "Sim");
        console.log(`  - Fotos com destaque restantes: ${fotosComDestaque.length}`);
        
        // Garantir que sempre tenha UMA foto destaque
        if (fotosComDestaque.length === 0) {
          console.log('🔧 Definindo primeira foto como destaque automaticamente');
          fotosAposRemocao[0].Destaque = "Sim";
        } else if (fotosComDestaque.length > 1) {
          console.log('🔧 Múltiplas fotos com destaque - mantendo apenas a primeira');
          fotosAposRemocao.forEach((foto, index) => {
            foto.Destaque = index === 0 ? "Sim" : "Nao";
          });
        }
        
        // Atualizar estado protegido
        setProtectedPhotosState([...fotosAposRemocao]);
      }
      
      // Atualizar estados
      setLocalPhotoOrder(fotosAposRemocao);
      
      // Chamar função original
      removeImage(codigo);
      
      // Propagar mudanças
      setTimeout(() => {
        if (typeof onUpdatePhotos === 'function') {
          console.log('📤 Propagando fotos atualizadas após remoção...');
          onUpdatePhotos(fotosAposRemocao);
        }
      }, 100);
      
      console.log('✅ Remoção concluída com sucesso');
      
    } catch (error) {
      console.error('❌ Erro na remoção:', error);
      removeImage(codigo);
      setLocalPhotoOrder(null);
    } finally {
      setTimeout(() => {
        setIsRemoving(false);
      }, 300);
    }
    
    console.groupEnd();
  };

  // 🔥 FUNÇÃO PARA DESTACAR FOTO TOTALMENTE CORRIGIDA PARA VENDIDOS
  const handleSetImageAsHighlight = async (codigo) => {
    console.group('⭐ DEFININDO FOTO DESTAQUE');
    console.log('Código da foto:', codigo);
    console.log('🏷️ Status do imóvel:', formData?.Status);
    
    try {
      // 🔥 OBTER FOTOS DO ESTADO MAIS CONFIÁVEL
      const fotosAtuais = protectedPhotosState || localPhotoOrder || [...sortedPhotos];
      
      console.log('📊 Estado atual das fotos:');
      fotosAtuais.forEach((foto, index) => {
        console.log(`  ${index}: ${foto.Codigo} - Destaque: ${foto.Destaque}`);
      });
      
      // 🔥 VERIFICAÇÃO CRÍTICA PARA IMÓVEIS VENDIDOS
      if (isImovelVendido) {
        console.log('🛡️ IMÓVEL VENDIDO - Aplicando lógica rigorosa para destaque');
        
        // Verificar se todas estão destacadas (problema comum)
        const todasDestacadas = fotosAtuais.every(f => f.Destaque === "Sim");
        if (todasDestacadas && fotosAtuais.length > 1) {
          console.error('🚨 DETECTADO: Todas as fotos estão destacadas - corrigindo!');
        }
      }
      
      // 🔥 APLICAR DESTAQUE DE FORMA ULTRA SEGURA
      const fotosComNovoDestaque = fotosAtuais.map(foto => ({
        ...foto,
        Destaque: foto.Codigo === codigo ? "Sim" : "Nao"
      }));
      
      console.log('📊 Aplicando novo destaque:');
      fotosComNovoDestaque.forEach((foto, index) => {
        console.log(`  ${index}: ${foto.Codigo} - Novo destaque: ${foto.Destaque}`);
      });
      
      // Verificação final
      const fotosComDestaque = fotosComNovoDestaque.filter(f => f.Destaque === "Sim");
      console.log(`✅ Verificação final: ${fotosComDestaque.length} foto(s) com destaque (deve ser 1)`);
      
      if (fotosComDestaque.length !== 1) {
        console.error('❌ ERRO CRÍTICO: Número incorreto de fotos com destaque!');
        throw new Error('Falha na lógica de destaque');
      }
      
      // 🔥 ATUALIZAR TODOS OS ESTADOS
      setLocalPhotoOrder(fotosComNovoDestaque);
      
      // Para imóveis vendidos, sempre atualizar o estado protegido
      if (isImovelVendido) {
        setProtectedPhotosState([...fotosComNovoDestaque]);
        console.log('🔒 Estado protegido atualizado para imóvel VENDIDO');
      }
      
      // Chamar função original
      setImageAsHighlight(codigo);
      
      // Propagar mudanças
      setTimeout(() => {
        if (typeof onUpdatePhotos === 'function') {
          console.log('📤 Propagando nova foto destaque...');
          onUpdatePhotos(fotosComNovoDestaque);
        }
      }, 100);
      
      console.log('✅ Destaque definido com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao definir destaque:', error);
      
      // Fallback seguro: chamar função original
      setImageAsHighlight(codigo);
    }
    
    console.groupEnd();
  };

  const handleResetOrder = () => {
    console.group('🔄 RESET PARA ORDEM INTELIGENTE');
    console.log('Limpando cache do PhotoSorter...');
    console.log('🏷️ Status do imóvel:', formData?.Status);
    
    // Limpar todos os estados
    photoSorter.limparCache();
    setLocalPhotoOrder(null);
    setIsReordering(false);
    setIsRemoving(false);
    
    // 🔥 PARA IMÓVEIS VENDIDOS: Limpar estado protegido também
    if (isImovelVendido) {
      setProtectedPhotosState(null);
      console.log('🔒 Estado protegido de imóvel VENDIDO também foi limpo');
    }
    
    if (typeof onUpdatePhotos === 'function' && formData?.Foto) {
      const fotosSemOrdem = formData.Foto.map(foto => {
        const { ordem, Ordem, ORDEM, tipoOrdenacao, ...fotoLimpa } = foto;
        return fotoLimpa;
      });
      
      console.log('📤 Enviando fotos sem ordem para forçar recálculo...');
      onUpdatePhotos(fotosSemOrdem);
    }
    
    console.log('✅ Reset concluído');
    console.groupEnd();
  };

  // 🎨 STATUS VISUAL COM PROTEÇÃO PARA VENDIDOS
  const getStatusInfo = () => {
    if (isRemoving) {
      return {
        status: 'removing',
        title: '🗑️ REMOVENDO FOTO...',
        description: isImovelVendido 
          ? 'Processando remoção com proteções para imóvel vendido.'
          : 'Processando remoção e reorganizando fotos.',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-400',
        textColor: 'text-orange-700'
      };
    }
    
    if (isReordering) {
      return {
        status: 'reordering',
        title: '🔄 REORDENANDO...',
        description: isImovelVendido 
          ? 'Processando alteração da ordem das fotos (imóvel vendido).'
          : 'Processando alteração da ordem das fotos.',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-400',
        textColor: 'text-yellow-700'
      };
    }
    
    if (localPhotoOrder) {
      return {
        status: 'local',
        title: '✋ ORDEM ALTERADA (não salva)',
        description: 'Você alterou a ordem. As mudanças serão salvas no próximo submit.',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-400',
        textColor: 'text-amber-700'
      };
    }
    
    if (hasManualOrder) {
      return {
        status: 'manual',
        title: isImovelVendido ? '💾 ORDEM MANUAL SALVA (VENDIDO)' : '💾 ORDEM MANUAL SALVA',
        description: 'Ordem definida manualmente e salva no banco. Use "Resetar Ordem" para voltar à ordem inteligente.',
        bgColor: isImovelVendido ? 'bg-red-50' : 'bg-blue-50',
        borderColor: isImovelVendido ? 'border-red-400' : 'border-blue-400',
        textColor: isImovelVendido ? 'text-red-700' : 'text-blue-700'
      };
    }
    
    return {
      status: 'intelligent',
      title: '🤖 ORDEM INTELIGENTE (PhotoSorter)',
      description: 'Fotos organizadas automaticamente pelo sistema inteligente.',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-400',
      textColor: 'text-green-700'
    };
  };

  const statusInfo = getStatusInfo();

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
            {/* 🔥 INDICADOR VISUAL ESPECIAL PARA IMÓVEIS VENDIDOS */}
            {isImovelVendido && (
              <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                💰 VENDIDO (Proteções Ativas)
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAddImageUrl}
              disabled={isReordering || isRemoving}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isReordering || isRemoving
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              + Adicionar URL
            </button>
            
            <button
              type="button"
              onClick={showImageModal}
              disabled={isReordering || isRemoving}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isReordering || isRemoving
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800 text-white'
              }`}
            >
              📤 Upload em Lote
            </button>

            {sortedPhotos.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleResetOrder}
                  disabled={isReordering || isRemoving}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isReordering || isRemoving
                      ? 'bg-purple-300 text-purple-500 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                  title="Voltar para ordem inteligente"
                >
                  🔄 Resetar Ordem
                </button>
                
                <button
                  type="button"
                  onClick={() => baixarTodasImagens(sortedPhotos)}
                  disabled={downloadingPhotos || isReordering || isRemoving}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    downloadingPhotos || isReordering || isRemoving
                      ? 'bg-blue-300 text-white cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {downloadingPhotos ? 'Baixando...' : '⬇️ Baixar Todas'}
                </button>
                
                <button
                  type="button"
                  onClick={removeAllImages}
                  disabled={isReordering || isRemoving || isImovelVendido}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isReordering || isRemoving || isImovelVendido
                      ? 'bg-red-300 text-red-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  title={isImovelVendido ? "Não é possível limpar todas as fotos de um imóvel vendido" : ""}
                >
                  🗑️ Limpar Tudo
                </button>
              </>
            )}
          </div>
        </div>

        {/* 🔥 INDICADOR DE STATUS COM PROTEÇÕES PARA VENDIDOS */}
        <div className={`p-3 rounded-md text-sm border-l-4 ${statusInfo.bgColor} ${statusInfo.borderColor} ${statusInfo.textColor}`}>
          <p><strong>{statusInfo.title}</strong></p>
          <p className="text-xs mt-1">{statusInfo.description}</p>
          {isImovelVendido && (
            <p className="text-xs mt-2 font-medium">🛡️ Proteções especiais ativas para imóveis vendidos</p>
          )}
        </div>

        {sortedPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPhotos.map((photo, index) => (
              <div 
                key={photo.Codigo} 
                className={`border rounded-lg overflow-hidden bg-white shadow-sm ${
                  isImovelVendido ? 'border-red-200 bg-red-50' : ''
                }`}
              >
                <div className="relative aspect-video w-full">
                  <Image
                    src={photo.Foto}
                    alt={`Imóvel ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index < 3}
                  />
                  {photo.Destaque === "Sim" && (
                    <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                      DESTAQUE
                    </span>
                  )}
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}°
                  </div>
                  {/* 🔥 INDICADOR ESPECIAL PARA IMÓVEIS VENDIDOS */}
                  {isImovelVendido && (
                    <div className="absolute bottom-2 left-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded">
                      💰 VENDIDO
                    </div>
                  )}
                  {/* DEBUG */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                      Ordem: {photo.Ordem !== undefined ? photo.Ordem : photo.ordem}
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Posição</label>
                      <select
                        value={index + 1}
                        onChange={(e) => handlePositionChange(photo.Codigo, e.target.value)}
                        disabled={isReordering || isRemoving}
                        className={`w-full p-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isReordering || isRemoving ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      >
                        {[...Array(sortedPhotos.length)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}°
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Destaque</label>
                      <button
                        onClick={() => handleSetImageAsHighlight(photo.Codigo)}
                        disabled={isReordering || isRemoving}
                        className={`w-full p-1.5 text-sm rounded-md transition-colors ${
                          isReordering || isRemoving
                            ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                            : photo.Destaque === "Sim"
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {photo.Destaque === "Sim" ? "★ Destaque" : "☆ Destacar"}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 truncate">
                    ID: {photo.Codigo}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleImageUpload(photo.Codigo)}
                      disabled={isReordering || isRemoving}
                      className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                        isReordering || isRemoving
                          ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                      }`}
                    >
                      🔄 Trocar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(photo.Codigo)}
                      disabled={isReordering || isRemoving || (isImovelVendido && sortedPhotos.length <= 1)}
                      className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                        isReordering || isRemoving || (isImovelVendido && sortedPhotos.length <= 1)
                          ? 'bg-red-100 text-red-400 cursor-not-allowed'
                          : 'bg-red-50 hover:bg-red-100 text-red-700'
                      }`}
                      title={isImovelVendido && sortedPhotos.length <= 1 ? "Não é possível remover a última foto de um imóvel vendido" : ""}
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
