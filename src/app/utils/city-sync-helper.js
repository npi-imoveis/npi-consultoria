// src/app/utils/city-sync-helper.js

// Utilitário para triggerar sincronização de cidades automaticamente

/**
 * Triggera sincronização de cidades quando há mudanças relacionadas
 * @param {string} action - Ação que ocorreu (ex: 'property.created')
 * @param {Object} data - Dados do imóvel ou entidade afetada
 * @param {string} source - Origem da chamada (ex: 'admin-panel', 'import', 'api')
 * @param {number} delay - Delay em ms antes de executar (padrão: 2000ms)
 */
export const triggerCitySync = async (action, data = {}, source = 'api', delay = 2000) => {
  // Verificar se estamos no lado do servidor
  if (typeof window !== 'undefined') {
    console.warn('🔔 [CITY-SYNC] triggerCitySync deve ser chamado apenas no servidor');
    return;
  }
  
  try {
    // Verificar se a ação é relevante para sincronização de cidades
    const cityRelevantActions = [
      'property.created',
      'property.updated',
      'property.imported',
      'property.city.changed',
      'property.batch.imported'
    ];
    
    if (!cityRelevantActions.includes(action)) {
      return; // Não é relevante, ignora
    }
    
    const cityName = data?.Cidade || data?.cidade || data?.city;
    console.log(`🔔 [CITY-SYNC] Triggerando sincronização para ação: ${action}, cidade: ${cityName || 'N/A'}`);
    
    // Fazer chamada para o webhook de forma não-bloqueante
    // Usar fetch sem await para não bloquear a operação principal
    fetch('/api/webhooks/city-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        data: cityName ? { cidade: cityName } : {},
        source,
        delay
      })
    }).catch(error => {
      console.error('❌ [CITY-SYNC] Erro ao triggerar webhook:', error);
    });
    
  } catch (error) {
    console.error('💥 [CITY-SYNC] Erro no helper de sincronização:', error);
  }
};

/**
 * Hook para ser chamado após operações em imóveis
 * @param {Object} imovel - Dados do imóvel
 * @param {string} operation - Operação realizada ('create', 'update', 'delete')
 * @param {string} source - Origem da operação
 */
export const onPropertyChange = (imovel, operation, source = 'api') => {
  const actionMap = {
    'create': 'property.created',
    'update': 'property.updated', 
    'delete': 'property.deleted',
    'import': 'property.imported'
  };
  
  const action = actionMap[operation] || 'property.updated';
  
  // Triggerar sincronização se há cidade envolvida
  if (imovel?.Cidade) {
    triggerCitySync(action, imovel, source);
  }
};

/**
 * Hook para importação em lote
 * @param {Array} imoveis - Array de imóveis importados
 * @param {string} source - Origem da importação
 */
export const onBatchImport = (imoveis, source = 'import') => {
  if (!Array.isArray(imoveis) || imoveis.length === 0) return;
  
  // Coletar cidades únicas dos imóveis importados
  const cidades = [...new Set(
    imoveis
      .map(imovel => imovel?.Cidade)
      .filter(cidade => cidade && cidade.trim().length > 0)
  )];
  
  if (cidades.length > 0) {
    console.log(`🔔 [CITY-SYNC] Importação em lote: ${imoveis.length} imóveis, ${cidades.length} cidades únicas`);
    
    triggerCitySync('property.batch.imported', {
      totalProperties: imoveis.length,
      cities: cidades
    }, source, 5000); // Delay maior para importações em lote
  }
};

/**
 * Verifica status da sincronização
 */
export const checkSyncStatus = async () => {
  try {
    const response = await fetch('/api/cities/auto-sync');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('❌ [CITY-SYNC] Erro ao verificar status:', error);
    return null;
  }
};

/**
 * Força sincronização manual
 */
export const forceCitySync = async () => {
  try {
    const response = await fetch('/api/cities/auto-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ force: true, source: 'manual' })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ [CITY-SYNC] Erro ao forçar sincronização:', error);
    return { error: error.message };
  }
};

export default {
  triggerCitySync,
  onPropertyChange,
  onBatchImport,
  checkSyncStatus,
  forceCitySync
};