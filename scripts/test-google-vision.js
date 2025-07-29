// scripts/test-google-vision.js - VERSÃO CORRIGIDA PARA VERCEL

require('dotenv').config();
const vision = require('@google-cloud/vision');
const { MongoClient } = require('mongodb');

// 🎯 MAPEAMENTO DOS RESULTADOS GOOGLE PARA PORTUGUÊS
const VISION_TO_PORTUGUESE = {
  // Ambientes principais
  'Kitchen': 'Cozinha',
  'Bathroom': 'Banheiro', 
  'Living room': 'Sala de Estar',
  'Bedroom': 'Dormitório',
  'Balcony': 'Varanda',
  'Grill on the balcony': 'Churrasqueira na Varanda',
  'Dining room': 'Sala de Jantar',
  'Office': 'Escritório',

  // Áreas externas  
  'Swimming pool': 'Piscina',
  'Indoor pool': 'Piscina Coberta',
  'Garden': 'Jardim',
  'Garage': 'Garagem',
  'Building': 'Fachada',
  'Facade': 'Fachada',
  'Courtyard': 'Área Externa',
  
  // Áreas condominiais
  'Gym': 'Academia',
  'Playground': 'Playground',
  'Tennis court': 'Quadra de Tênis',
  'Basketball court': 'Quadra Esportiva',
  'Sauna': 'Sauna',
  'Recreation room': 'Salão de Festas',
  'Lobby': 'Lobby',
  'Elevator': 'Elevador',

  // Detalhes
  'Stairs': 'Escada',
  'Window': 'Vista',
  'Door': 'Entrada',
  'Floor plan': 'Planta',
  'Architecture': 'Detalhe Arquitetônico'
};

// 🔧 SETUP DO GOOGLE VISION - VERSÃO VERCEL (ÚNICA!)
async function initializeVisionClient() {
  // 🎯 USAR CREDENTIALS EM VEZ DE KEYFILENAME PARA VERCEL
  const client = new vision.ImageAnnotatorClient({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
  });
  
  console.log('✅ Google Vision Client inicializado');
  return client;
}

// 🎯 ANÁLISE DE UMA IMAGEM
async function analisarImagem(client, urlImagem) {
  try {
    console.log(`🔍 Analisando: ${urlImagem.substring(0, 50)}...`);
    
    // Fazer múltiplas análises para melhor precisão
    const [objectResult] = await client.objectLocalization(urlImagem);
    const [labelResult] = await client.labelDetection(urlImagem);
    
    const objects = objectResult.localizedObjectAnnotations || [];
    const labels = labelResult.labelAnnotations || [];
    
    // Processar resultados
    const ambientesDetectados = [];
    
    // 1. Verificar objetos detectados
    objects.forEach(obj => {
      if (obj.score > 0.5) { // Só confiança > 50%
        const ambiente = VISION_TO_PORTUGUESE[obj.name];
        if (ambiente) {
          ambientesDetectados.push({
            tipo: ambiente,
            confianca: (obj.score * 100).toFixed(1),
            fonte: 'objeto'
          });
        }
      }
    });
    
    // 2. Verificar labels gerais
    labels.forEach(label => {
      if (label.score > 0.7) { // Confiança > 70% para labels
        const ambiente = VISION_TO_PORTUGUESE[label.description];
        if (ambiente) {
          ambientesDetectados.push({
            tipo: ambiente,
            confianca: (label.score * 100).toFixed(1),
            fonte: 'label'
          });
        }
      }
    });
    
    // 3. Retornar o melhor resultado
    if (ambientesDetectados.length > 0) {
      // Ordenar por confiança e retornar o melhor
      const melhor = ambientesDetectados.sort((a, b) => 
        parseFloat(b.confianca) - parseFloat(a.confianca)
      )[0];
      
      return {
        ambiente: melhor.tipo,
        confianca: melhor.confianca,
        fonte: melhor.fonte,
        todosResultados: ambientesDetectados
      };
    }
    
    return null;
    
  } catch (error) {
    console.error(`❌ Erro ao analisar imagem:`, error.message);
    return null;
  }
}

// 📊 TESTE COM 1000 FOTOS
async function testarComMilFotos() {
  console.log('🚀 INICIANDO TESTE COM 1000 FOTOS GRATUITAS');
  console.log('=' .repeat(50));
  
  let client;
  let mongoClient;
  
  try {
    // 1. Conectar serviços
    client = await initializeVisionClient();
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
    
    const db = mongoClient.db(process.env.DB_NAME);
    const fotosCollection = db.collection('fotos'); // ou o nome da sua collection
    
    // 2. Buscar 1000 fotos que ainda não foram analisadas
    const fotos = await fotosCollection.find({
      $or: [
        { 'vision_ambiente': { $exists: false } },
        { 'vision_ambiente': null }
      ]
    }).limit(1000).toArray();
    
    console.log(`📸 Encontradas ${fotos.length} fotos para analisar`);
    
    if (fotos.length === 0) {
      console.log('⚠️  Nenhuma foto encontrada para análise');
      return {
        processadas: 0,
        detectadas: 0,
        falhas: 0,
        ambientes: {}
      };
    }
    
    // 3. Processar fotos com rate limiting
    const resultados = {
      processadas: 0,
      detectadas: 0,
      falhas: 0,
      ambientes: {}
    };
    
    for (let i = 0; i < fotos.length; i++) {
      const foto = fotos[i];
      
      try {
        // Rate limiting: Google permite ~1000/min
        if (i > 0 && i % 100 === 0) {
          console.log(`⏳ Processadas ${i} fotos... pausando 6s`);
          await sleep(6000);
        }
        
        // Analisar imagem
        const resultado = await analisarImagem(client, foto.Foto);
        
        // Atualizar no banco
        const updateData = {
          vision_ambiente: resultado?.ambiente || null,
          vision_confianca: resultado?.confianca || null,
          vision_analisado_em: new Date(),
          vision_detalhes: resultado?.todosResultados || []
        };
        
        await fotosCollection.updateOne(
          { _id: foto._id },
          { $set: updateData }
        );
        
        resultados.processadas++;
        
        if (resultado) {
          resultados.detectadas++;
          resultados.ambientes[resultado.ambiente] = 
            (resultados.ambientes[resultado.ambiente] || 0) + 1;
          
          console.log(`✅ ${i+1}/${fotos.length} - ${resultado.ambiente} (${resultado.confianca}%)`);
        } else {
          console.log(`⚠️  ${i+1}/${fotos.length} - Não detectado`);
        }
        
        // Sleep básico entre requests
        await sleep(100);
        
      } catch (error) {
        resultados.falhas++;
        console.error(`❌ ${i+1}/${fotos.length} - Erro:`, error.message);
      }
    }
    
    // 4. Relatório final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RELATÓRIO FINAL DO TESTE');
    console.log('='.repeat(50));
    console.log(`📸 Total processadas: ${resultados.processadas}`);
    console.log(`✅ Ambientes detectados: ${resultados.detectadas} (${(resultados.detectadas/resultados.processadas*100).toFixed(1)}%)`);
    console.log(`❌ Falhas: ${resultados.falhas}`);
    console.log(`💰 Custo: GRATUITO (dentro da cota de 1000)`);
    
    console.log('\n🏠 AMBIENTES DETECTADOS:');
    Object.entries(resultados.ambientes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([ambiente, quantidade]) => {
        console.log(`  • ${ambiente}: ${quantidade} fotos`);
      });
    
    console.log('\n🎯 CONCLUSÃO:');
    const precisao = (resultados.detectadas/resultados.processadas*100).toFixed(1);
    if (precisao > 60) {
      console.log(`✅ Precisão de ${precisao}% - VALE A PENA continuar!`);
      console.log(`💰 Custo para 140k fotos: ~$87`);
    } else {
      console.log(`⚠️  Precisão de ${precisao}% - Talvez não compense`);
    }
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    throw error;
  } finally {
    if (mongoClient) await mongoClient.close();
  }
}

// 🎯 FUNÇÃO PARA TESTAR ALT ATUALIZADO
async function testarAltAtualizado() {
  console.log('\n🏷️  TESTANDO ALT COM GOOGLE VISION');
  
  const mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  
  const db = mongoClient.db(process.env.DB_NAME);
  const fotosCollection = db.collection('fotos');
  
  // Buscar fotos com ambiente detectado
  const fotosComAmbiente = await fotosCollection.find({
    vision_ambiente: { $ne: null }
  }).limit(20).toArray();
  
  console.log('ANTES vs DEPOIS:');
  console.log('-'.repeat(80));
  
  fotosComAmbiente.forEach((foto, i) => {
    const altAntigo = `Condomínio Exemplo - Imagem ${i + 1}`;
    const altNovo = `Condomínio Exemplo - ${foto.vision_ambiente}`;
    
    console.log(`${i+1}. ${altAntigo}`);
    console.log(`   → ${altNovo} (${foto.vision_confianca}%)\n`);
  });
  
  await mongoClient.close();
}

// 🛠️ UTILITÁRIOS
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 🚀 EXECUTAR TESTE
async function main() {
  try {
    const resultado = await testarComMilFotos();
    await testarAltAtualizado();
    
    console.log('\n✅ Teste concluído!');
    console.log('📝 Próximos passos:');
    console.log('   1. Analisar resultados');
    console.log('   2. Se aprovado, processar as 139k restantes');
    console.log('   3. Integrar com ImageGallery');
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = {
  analisarImagem,
  testarComMilFotos,
  VISION_TO_PORTUGUESE
};
