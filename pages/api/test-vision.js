// pages/api/test-vision.js - API PARA TESTAR GOOGLE VISION

const { testarComMilFotos } = require('../../scripts/test-google-vision');

export default async function handler(req, res) {
  // Só aceitar POST para segurança
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Use POST para executar o teste' 
    });
  }

  // Verificar se tem as variáveis de ambiente
  const requiredEnvs = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_CREDENTIALS', 
    'MONGODB_URI',
    'DB_NAME'
  ];

  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
  
  if (missingEnvs.length > 0) {
    return res.status(500).json({
      error: 'Environment variables missing',
      missing: missingEnvs,
      message: 'Configure as variáveis no Vercel primeiro'
    });
  }

  try {
    console.log('🚀 Iniciando teste Google Vision...');
    
    // Executar o teste
    const resultado = await testarComMilFotos();
    
    // Retornar resultado
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      resultado
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    
    res.status(500).json({
      error: 'Erro ao executar teste',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
