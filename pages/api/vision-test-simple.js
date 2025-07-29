// pages/api/vision-test-simple.js - VERSÃO MINIMALISTA SEM DEPENDÊNCIAS PESADAS

export default async function handler(req, res) {
  try {
    // Só testar as credenciais SEM importar Vision API
    const hasCredentials = !!process.env.GOOGLE_CLOUD_CREDENTIALS;
    const hasProjectId = !!process.env.GOOGLE_CLOUD_PROJECT_ID;
    
    if (!hasCredentials || !hasProjectId) {
      return res.status(400).json({
        error: 'Credenciais não configuradas',
        hasCredentials,
        hasProjectId
      });
    }
    
    // Tentar parsear credenciais
    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
    } catch (parseError) {
      return res.status(400).json({
        error: 'Erro ao parsear credenciais',
        message: parseError.message
      });
    }
    
    return res.status(200).json({
      status: 'ready',
      message: 'Google Vision configurado - pronto para usar',
      projectId: credentials.project_id,
      clientEmail: credentials.client_email?.substring(0, 20) + '...',
      nextStep: 'Agora pode processar fotos via função serverless separada'
    });
    
  } catch (error) {
    return res.status(500).json({
      error: 'Erro interno',
      message: error.message
    });
  }
}
