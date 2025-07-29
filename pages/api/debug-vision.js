// pages/api/debug-vision.js
// 🎯 Crie este arquivo para debug no Vercel

export default async function handler(req, res) {
  try {
    console.log('🔍 Iniciando debug Google Vision...');
    
    // 1. Verificar variáveis de ambiente
    const hasProjectId = !!process.env.GOOGLE_CLOUD_PROJECT_ID;
    const hasCredentials = !!process.env.GOOGLE_CLOUD_CREDENTIALS;
    
    console.log('📝 Variáveis:', { hasProjectId, hasCredentials });
    
    if (!hasProjectId || !hasCredentials) {
      return res.status(500).json({
        error: 'Variáveis de ambiente não configuradas',
        hasProjectId,
        hasCredentials
      });
    }

    // 2. Testar parsing das credenciais
    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
      console.log('✅ Credenciais parseadas:', {
        projectId: credentials.project_id,
        clientEmail: credentials.client_email?.substring(0, 20) + '...'
      });
    } catch (error) {
      console.error('❌ Erro ao parsear credenciais:', error);
      return res.status(500).json({
        error: 'Erro ao parsear GOOGLE_CLOUD_CREDENTIALS',
        message: error.message
      });
    }

    // 3. Testar inicialização do cliente Vision
    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: credentials
    });

    console.log('✅ Cliente Vision inicializado');

    // 4. Teste simples com imagem online
    const [result] = await client.labelDetection({
      image: {
        source: { imageUri: 'https://picsum.photos/400/300' }
      }
    });

    const labels = result.labelAnnotations?.slice(0, 5).map(label => ({
      description: label.description,
      confidence: Math.round(label.score * 100)
    }));

    console.log('✅ Vision API funcionando!', { labels });

    return res.status(200).json({
      status: 'success',
      message: 'Google Vision API configurado corretamente!',
      labels,
      environment: 'vercel-production'
    });

  } catch (error) {
    console.error('❌ Erro completo:', error);
    
    // Mensagens de erro mais específicas
    let errorType = 'unknown';
    let solution = 'Verifique os logs completos';

    if (error.message?.includes('UNAUTHENTICATED')) {
      errorType = 'authentication';
      solution = 'Verifique se GOOGLE_CLOUD_CREDENTIALS está correto';
    } else if (error.message?.includes('Vision API has not been used')) {
      errorType = 'api_not_enabled';
      solution = 'Ative a Vision API no Google Cloud Console';
    } else if (error.message?.includes('quotaExceeded')) {
      errorType = 'quota_exceeded';
      solution = 'Verifique a cota da Vision API';
    }

    return res.status(500).json({
      error: 'Erro na configuração do Google Vision',
      errorType,
      solution,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
