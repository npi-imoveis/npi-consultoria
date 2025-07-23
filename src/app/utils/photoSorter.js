// 🎯 PHOTOSORTER CORRIGIDO - Respeita ordem manual
// utils/photoSorter.js

export class PhotoSorter {
  constructor() {
    // Cache para evitar reprocessamento
    this.cacheOrdenacao = new Map();
    
    // Padrões conhecidos (expandido)
    this.padroes = [
      { prefix: 'i268P_48766b21', grupo: 'A', peso: 10000 },
      { prefix: 'iUg3s56gtAT3cfaA5U90_487', grupo: 'B', peso: 20000 },
      { prefix: 'iUG8o15s_4876', grupo: 'C', peso: 30000 },
      { prefix: 'i19Q55g4D1123W87', grupo: 'D', peso: 40000 },
      { prefix: 'ik71mgr366', grupo: 'E', peso: 50000 },
      { prefix: 'ic782Y6X12Tn', grupo: 'F', peso: 60000 },
      // Novos padrões detectados
      { prefix: 'i47Bg', grupo: 'G', peso: 70000 },
      { prefix: 'iXx9', grupo: 'H', peso: 80000 },
    ];

    this.debug = true;
  }

  // 🔍 MÉTODO 1: Extrair informações avançadas do código
  analisarCodigoFoto(url) {
    if (!url) return { codigo: '', timestamp: 0, grupo: 'Z', peso: 999999 };

    const nomeArquivo = url.split('/').pop();
    const codigo = nomeArquivo.replace(/\.(jpg|jpeg|png|gif)$/i, '');
    
    if (!codigo) return { codigo: '', timestamp: 0, grupo: 'Z', peso: 999999 };

    // Detectar padrão conhecido
    const padrao = this.padroes.find(p => codigo.includes(p.prefix));
    
    if (padrao) {
      // Extrair hash/timestamp do código
      const regex = new RegExp(`${padrao.prefix}(.+)`);
      const match = codigo.match(regex);
      
      if (match && match[1]) {
        const sufixo = match[1];
        
        // NOVO: Múltiplas estratégias de timestamp
        const timestamp = this.extrairTimestamp(sufixo);
        
        return {
          codigo,
          timestamp,
          grupo: padrao.grupo,
          peso: padrao.peso + timestamp,
          padrao: padrao.prefix
        };
      }
    }

    // NOVO: Análise de padrões desconhecidos
    return this.analisarPadraoDesconhecido(codigo);
  }

  // 🧠 NOVO: Múltiplas estratégias de timestamp
  extrairTimestamp(sufixo) {
    // Estratégia 1: Hash hexadecimal
    const hexMatch = sufixo.match(/[0-9a-fA-F]{6,}/);
    if (hexMatch) {
      const hex = hexMatch[0].substring(0, 8);
      const timestamp = parseInt(hex, 16);
      if (!isNaN(timestamp)) return timestamp;
    }

    // Estratégia 2: Números decimais
    const numMatch = sufixo.match(/\d{4,}/);
    if (numMatch) {
      return parseInt(numMatch[0]);
    }

    // Estratégia 3: Posição na string
    let hash = 0;
    for (let i = 0; i < sufixo.length; i++) {
      const char = sufixo.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  // 🔍 NOVO: Análise de padrões desconhecidos
  analisarPadraoDesconhecido(codigo) {
    // Procurar por padrões tipo "i[chars]_[numero]"
    const padraoGeral = codigo.match(/^i([a-zA-Z0-9]{2,10})_?(\d+)/);
    
    if (padraoGeral) {
      const [, prefixo, numero] = padraoGeral;
      
      if (this.debug) {
        console.log(`🔍 Novo padrão detectado: i${prefixo}_${numero}`);
      }
      
      return {
        codigo,
        timestamp: parseInt(numero) || 0,
        grupo: 'NOVO',
        peso: 100000 + (parseInt(numero) || 0),
        padrao: `i${prefixo}_`
      };
    }

    // Fallback final
    return {
      codigo,
      timestamp: codigo.length, // Usar tamanho como ordenação
      grupo: 'DESCONHECIDO',
      peso: 999999,
      padrao: null
    };
  }

  // 🔥 VERIFICAÇÃO CRÍTICA: Detectar ordem manual
  temOrdemManual(fotos) {
    if (!Array.isArray(fotos) || fotos.length === 0) {
      return false;
    }

    // Verificar se TODAS as fotos têm campo ordem numérico
    const todasTemOrdem = fotos.every(foto => 
      typeof foto.ordem === 'number' && foto.ordem >= 0
    );

    if (!todasTemOrdem) {
      return false;
    }

    // Verificar se é uma sequência válida (0, 1, 2, 3...)
    const ordens = fotos.map(f => f.ordem).sort((a, b) => a - b);
    const isSequential = ordens.every((ordem, index) => ordem === index);

    const resultado = todasTemOrdem && isSequential;

    if (this.debug) {
      console.log('🔍 PhotoSorter - Verificação de ordem manual:', {
        totalFotos: fotos.length,
        todasTemOrdem,
        isSequential,
        ordens,
        temOrdemManual: resultado
      });
    }

    return resultado;
  }

  // 🎯 MÉTODO PRINCIPAL: Ordenação híbrida inteligente (CORRIGIDO)
  ordenarFotos(fotos, codigoImovel) {
    if (!Array.isArray(fotos) || fotos.length === 0) return [];

    const cacheKey = `${codigoImovel}-${fotos.length}`;
    
    try {
      if (this.debug) {
        console.group(`🎯 PHOTOSORTER - ${codigoImovel}`);
        console.log('📸 Fotos recebidas:', fotos.length);
      }

      // 🔥 VERIFICAÇÃO CRÍTICA: Se há ordem manual, PRESERVÁ-LA!
      if (this.temOrdemManual(fotos)) {
        if (this.debug) {
          console.log('✅ ORDEM MANUAL DETECTADA - PhotoSorter preservando ordem');
          console.log('📊 Ordens encontradas:', fotos.map(f => f.ordem));
        }

        // 1. DESTAQUE SEMPRE PRIMEIRO (se existir)
        const fotoDestaque = fotos.find(foto => foto.Destaque === "Sim");
        const outrasFotos = fotos.filter(foto => foto !== fotoDestaque);

        // 2. PRESERVAR ORDEM MANUAL das outras fotos
        const fotosOrdenadas = [...outrasFotos].sort((a, b) => a.ordem - b.ordem);

        // 3. RESULTADO FINAL com ordem manual preservada
        const resultado = [
          ...(fotoDestaque ? [fotoDestaque] : []),
          ...fotosOrdenadas
        ];

        if (this.debug) {
          console.log('✅ Ordem manual preservada');
          console.log('📊 Resultado:', resultado.map(f => ({ codigo: f.Codigo, ordem: f.ordem })));
          console.groupEnd();
        }

        return resultado;
      }

      // 🔥 SE NÃO HÁ ORDEM MANUAL, APLICAR LÓGICA INTELIGENTE
      if (this.debug) {
        console.log('🤖 APLICANDO ORDEM INTELIGENTE (sem ordem manual)');
      }

      // Verificar cache apenas para ordem inteligente
      if (this.cacheOrdenacao.has(cacheKey)) {
        const cached = this.cacheOrdenacao.get(cacheKey);
        if (this.debug) {
          console.log('🎯 Usando cache para ordenação inteligente');
          console.groupEnd();
        }
        return cached;
      }

      // 1. DESTAQUE SEMPRE PRIMEIRO
      const fotoDestaque = fotos.find(foto => foto.Destaque === "Sim");
      const outrasFotos = fotos.filter(foto => foto !== fotoDestaque);

      // 2. VERIFICAR CAMPO ORDEM (MySQL original)
      const temCampoOrdem = outrasFotos.some(foto => 
        foto.Ordem !== undefined || 
        foto.ORDEM !== undefined
      );

      let fotosOrdenadas;
      let metodo;

      if (temCampoOrdem) {
        // MÉTODO 1: Campo ORDEM do MySQL
        fotosOrdenadas = [...outrasFotos].sort((a, b) => {
          const ordemA = a.Ordem || a.ORDEM || 999999;
          const ordemB = b.Ordem || b.ORDEM || 999999;
          return ordemA - ordemB;
        });
        metodo = 'MySQL ORDEM';
      } else {
        // MÉTODO 2: Análise inteligente de códigos
        fotosOrdenadas = [...outrasFotos].sort((a, b) => {
          const analiseA = this.analisarCodigoFoto(a.Foto);
          const analiseB = this.analisarCodigoFoto(b.Foto);

          // Primeiro por grupo (A, B, C, etc.)
          if (analiseA.grupo !== analiseB.grupo) {
            return analiseA.grupo.localeCompare(analiseB.grupo);
          }

          // Depois por peso (timestamp dentro do grupo)
          return analiseA.peso - analiseB.peso;
        });
        metodo = 'Análise Inteligente';
      }

      // 3. RESULTADO FINAL
      const resultado = [
        ...(fotoDestaque ? [fotoDestaque] : []),
        ...fotosOrdenadas
      ];

      // 4. LOGGING DETALHADO
      if (this.debug) {
        console.log(`📊 Método: ${metodo}`);
        console.log(`📸 Total: ${resultado.length} fotos`);
        console.log(`⭐ Destaque: ${fotoDestaque ? 'SIM' : 'NÃO'}`);
        
        if (metodo === 'Análise Inteligente') {
          const grupos = {};
          fotosOrdenadas.forEach((foto, i) => {
            const analise = this.analisarCodigoFoto(foto.Foto);
            if (!grupos[analise.grupo]) grupos[analise.grupo] = 0;
            grupos[analise.grupo]++;
            
            if (i < 3) {
              console.log(`${i+1}º: [${analise.grupo}:${analise.timestamp}] ${analise.codigo.substring(0, 20)}...`);
            }
          });
          console.log('📊 Grupos detectados:', grupos);
        }
        
        console.groupEnd();
      }

      // 5. SALVAR CACHE (apenas para ordem inteligente)
      this.cacheOrdenacao.set(cacheKey, resultado);
      
      return resultado;

    } catch (error) {
      if (this.debug) {
        console.error('❌ Erro na ordenação:', error);
        console.groupEnd();
      }
      return fotos; // Fallback seguro
    }
  }

  // 🔧 UTILITÁRIOS
  limparCache() {
    this.cacheOrdenacao.clear();
    if (this.debug) {
      console.log('🧹 Cache do PhotoSorter limpo');
    }
  }

  adicionarPadrao(prefix, grupo, peso) {
    this.padroes.push({ prefix, grupo, peso });
    this.limparCache(); // Limpar cache para reprocessar
  }

  gerarRelatorio(fotos, codigoImovel) {
    const analises = fotos.map(foto => this.analisarCodigoFoto(foto.Foto));
    
    return {
      total: fotos.length,
      grupos: analises.reduce((acc, a) => {
        acc[a.grupo] = (acc[a.grupo] || 0) + 1;
        return acc;
      }, {}),
      padroes: analises.map(a => a.padrao).filter(Boolean),
      cobertura: analises.filter(a => a.grupo !== 'DESCONHECIDO').length / fotos.length
    };
  }
}

// 🚀 SINGLETON para uso global
export const photoSorter = new PhotoSorter();

// 🎯 HOOK para Next.js
export function usePhotoSorter() {
  return photoSorter;
}
