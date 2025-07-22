// src/app/utils/imageAltAnalyzer.js - ANALISADOR INTELIGENTE DE ALT PARA IMAGENS

/**
 * 🎯 MAPEAMENTO DE AMBIENTES E PALAVRAS-CHAVE
 * Analisa URL/nome da imagem e identifica automaticamente o tipo de ambiente
 */

const AMBIENTE_KEYWORDS = {
  // 🏠 ÁREAS EXTERNAS
  fachada: ['fachada', 'frente', 'front', 'entrada', 'portaria', 'hall-entrada'],
  piscina: ['piscina', 'pool', 'natacao', 'aquatico'],
  piscinaCoberta: ['piscina-coberta', 'piscina-aquecida', 'pool-coberta', 'natacao-coberta'],
  jardim: ['jardim', 'garden', 'paisagismo', 'verde', 'gramado'],
  playground: ['playground', 'infantil', 'brinquedo', 'kids'],
  quadra: ['quadra', 'esporte', 'court', 'tenis', 'futebol', 'basquete'],
  garagem: ['garagem', 'garage', 'estacionamento', 'vaga'],
  
  // 🏠 ÁREAS INTERNAS PRINCIPAIS  
  sala: ['sala', 'living', 'estar', 'jantar'],
  cozinha: ['cozinha', 'kitchen', 'gourmet', 'copa'],
  dormitorio: ['dormitorio', 'quarto', 'bedroom', 'suite'],
  banheiro: ['banheiro', 'bathroom', 'lavabo', 'toilet'],
  
  // 🏠 ÁREAS ESPECÍFICAS
  varanda: ['varanda', 'sacada', 'balcao', 'terraço'],
  escritorio: ['escritorio', 'office', 'home-office', 'trabalho'],
  lavanderia: ['lavanderia', 'laundry', 'area-servico'],
  adega: ['adega', 'wine', 'vinho', 'cave'],
  
  // 🏢 ÁREAS CONDOMINIAIS
  salaoFesta: ['salao', 'festa', 'party', 'social', 'eventos'],
  academia: ['academia', 'gym', 'fitness', 'musculacao'],
  sauna: ['sauna', 'spa', 'relaxamento'],
  coworking: ['coworking', 'trabalho', 'shared-office'],
  bicicletario: ['bicicletario', 'bike', 'bicicleta'],
  
  // 🌟 ÁREAS ESPECIAIS
  rooftop: ['rooftop', 'cobertura', 'topo', 'roof'],
  lobby: ['lobby', 'hall', 'recepcao', 'entrada-social'],
  elevador: ['elevador', 'elevator', 'lift'],

  // 📐 PLANTAS E PROJETOS - ADICIONADOS!
  planta: ['planta', 'plant', 'baixa', 'humanizada', 'floor-plan'],
  implantacao: ['implantacao', 'implantação', 'masterplan', 'master-plan', 'localizacao', 'localização']
};

/**
 * 🎯 FUNÇÃO PRINCIPAL: Analisar URL/nome da imagem e gerar alt inteligente
 */
export function gerarAltInteligente(urlImagem, tituloImovel = '', indice = 0) {
  if (!urlImagem || !tituloImovel) {
    return `Imagem ${indice + 1}`;
  }

  try {
    // 1️⃣ EXTRAIR NOME DO ARQUIVO da URL
    const nomeArquivo = urlImagem
      .split('/').pop()           // Pegar último segmento da URL
      .split('.')[0]              // Remover extensão
      .toLowerCase()              // Normalizar
      .replace(/[_-]/g, ' ')      // Substituir _ e - por espaços
      .replace(/\d+/g, '')        // Remover números
      .trim();

    console.log('🔍 Analisando imagem:', { urlImagem: urlImagem.substring(0, 50) + '...', nomeArquivo });

    // 2️⃣ IDENTIFICAR AMBIENTE baseado em palavras-chave
    const ambienteDetectado = identificarAmbiente(nomeArquivo);
    
    // 3️⃣ GERAR ALT FINAL
    if (ambienteDetectado) {
      const altFinal = `${tituloImovel} - ${ambienteDetectado}`;
      console.log('✅ Alt gerado:', altFinal);
      return altFinal;
    }

    // 4️⃣ FALLBACK: Alt genérico se não detectar ambiente
    const altFallback = `${tituloImovel} - Imagem ${indice + 1}`;
    console.log('⚠️ Ambiente não detectado, usando fallback:', altFallback);
    return altFallback;

  } catch (error) {
    console.error('❌ Erro ao gerar alt inteligente:', error);
    return `${tituloImovel} - Imagem ${indice + 1}`;
  }
}

/**
 * 🔍 IDENTIFICAR AMBIENTE na string do nome do arquivo
 */
function identificarAmbiente(nomeArquivo) {
  // Percorrer todos os ambientes mapeados
  for (const [ambiente, keywords] of Object.entries(AMBIENTE_KEYWORDS)) {
    // Verificar se alguma palavra-chave está presente no nome
    const encontrada = keywords.some(keyword => 
      nomeArquivo.includes(keyword.toLowerCase())
    );
    
    if (encontrada) {
      return formatarNomeAmbiente(ambiente);
    }
  }
  
  return null; // Não encontrou ambiente específico
}

/**
 * 🎨 FORMATAR NOME DO AMBIENTE para exibição
 */
function formatarNomeAmbiente(ambiente) {
  const formatacao = {
    fachada: 'Fachada',
    piscina: 'Piscina',
    piscinaCoberta: 'Piscina Coberta',
    jardim: 'Jardim',
    playground: 'Playground',
    quadra: 'Quadra Esportiva',
    garagem: 'Garagem',
    sala: 'Sala de Estar',
    cozinha: 'Cozinha',
    dormitorio: 'Dormitório',
    banheiro: 'Banheiro',
    varanda: 'Varanda',
    escritorio: 'Escritório',
    lavanderia: 'Lavanderia',
    adega: 'Adega',
    salaoFesta: 'Salão de Festas',
    academia: 'Academia',
    sauna: 'Sauna',
    coworking: 'Coworking',
    bicicletario: 'Bicicletário',
    rooftop: 'Rooftop',
    lobby: 'Lobby',
    elevador: 'Elevador',
    planta: 'Planta',
    implantacao: 'Implantação'
  };
  
  return formatacao[ambiente] || ambiente;
}

/**
 * 🧪 FUNÇÃO DE TESTE: Para testar a detecção
 */
export function testarDeteccaoAmbiente(urls) {
  console.log('🧪 TESTANDO DETECÇÃO DE AMBIENTES:');
  
  urls.forEach((url, index) => {
    const alt = gerarAltInteligente(url, 'Condomínio Teste', index);
    console.log(`${index + 1}. ${url.split('/').pop()} → ${alt}`);
  });
}

/**
 * 📊 RELATÓRIO DE COBERTURA: Verificar quantas imagens foram identificadas
 */
export function gerarRelatorioCobertura(fotos, tituloImovel) {
  if (!Array.isArray(fotos)) return null;
  
  let identificadas = 0;
  let total = fotos.length;
  const ambientesDetectados = [];
  
  fotos.forEach((foto, index) => {
    const nomeArquivo = foto.Foto?.split('/').pop()?.split('.')[0]?.toLowerCase() || '';
    const ambiente = identificarAmbiente(nomeArquivo.replace(/[_-]/g, ' ').replace(/\d+/g, ''));
    
    if (ambiente) {
      identificadas++;
      ambientesDetectados.push(ambiente);
    }
  });
  
  return {
    total,
    identificadas,
    cobertura: total > 0 ? (identificadas / total) * 100 : 0,
    ambientes: [...new Set(ambientesDetectados)], // Remover duplicatas
    naoIdentificadas: total - identificadas
  };
}
