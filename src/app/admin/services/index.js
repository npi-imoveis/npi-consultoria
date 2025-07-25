import axiosClient from "@/app/lib/axios-client";

function ensureNumber(value, defaultValue) {
  const num = Number(value);
  return Number.isFinite(num) ? num : defaultValue;
}

// 🔥 FUNÇÃO CRIAR IMÓVEL CORRIGIDA (NOVA - com detecção de automação)
export async function criarImovel(codigo, dadosImovel) {
  try {
    console.group('📤 Service: Criando imóvel');
    console.log('🆔 Código:', codigo);
    console.log('🤖 É da automação?', dadosImovel.Automacao);
    console.log('📊 Dados básicos:', {
      empreendimento: dadosImovel.Empreendimento,
      totalFotos: Array.isArray(dadosImovel.Foto) ? dadosImovel.Foto.length : 'Não array',
      totalCampos: Object.keys(dadosImovel).length
    });

    // 🔥 ROTA DINÂMICA BASEADA NA ORIGEM
    let endpoint;
    
    if (dadosImovel.Automacao === true) {
      // Imóvel vindo da automação
      endpoint = `/automacao/${codigo}`;
      console.log('🤖 Usando rota de automação:', endpoint);
    } else {
      // Imóvel criado manualmente no admin
      endpoint = `/admin/imoveis`;
      console.log('👤 Usando rota do admin:', endpoint);
    }

    // Log detalhado das fotos se existirem
    if (Array.isArray(dadosImovel.Foto) && dadosImovel.Foto.length > 0) {
      console.log('📸 Detalhes das fotos para criação:');
      console.log('  - Total:', dadosImovel.Foto.length);
      console.log('  - Primeiras 5 ordens:', dadosImovel.Foto.slice(0, 5).map(f => f.Ordem));
      
      const ordens = dadosImovel.Foto.map(f => f.Ordem);
      const ordensUnicas = [...new Set(ordens)];
      const temDuplicadas = ordens.length !== ordensUnicas.length;
      const temInvalidas = ordens.some(o => typeof o !== 'number' || o < 0);
      
      if (temDuplicadas) {
        console.warn('⚠️ ATENÇÃO: Ordens duplicadas detectadas na criação!');
      }
      if (temInvalidas) {
        console.warn('⚠️ ATENÇÃO: Ordens inválidas detectadas na criação!');
      }
    }

    console.log('🌐 Enviando requisição de criação...');
    console.log('📡 URL:', endpoint);
    
    const response = await axiosClient.post(endpoint, dadosImovel, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📥 Resposta HTTP recebida:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data
    });

    console.groupEnd();

    if (response && response.status >= 200 && response.status < 300) {
      console.log('✅ Service: Imóvel criado com sucesso');
      return {
        success: response.data?.success || true,
        message: response.data?.message || "Imóvel criado com sucesso",
        data: response.data?.data || response.data,
        metadata: response.data?.metadata
      };
    } else {
      console.error("❌ Service: Erro na criação:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      return {
        success: false,
        message: response.data?.message || "Erro ao criar imóvel",
      };
    }
  } catch (error) {
    console.error("❌ Service: Erro ao criar imóvel:", error);
    console.groupEnd();
    
    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conexão com o servidor. Tente novamente mais tarde.",
        error: "Erro de conexão",
      };
    }

    if (error.response?.status >= 400 && error.response?.status < 500) {
      return {
        success: false,
        message: error.response?.data?.message || "Erro nos dados enviados",
        error: error.response?.data?.error || error.message,
      };
    }

    if (error.response?.status >= 500) {
      return {
        success: false,
        message: "Erro interno do servidor. Tente novamente mais tarde.",
        error: error.response?.data?.error || error.message,
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao criar imóvel",
      error: error.response?.data?.error || error.message || "Erro desconhecido",
    };
  }
}

// 🔥 SUA FUNÇÃO atualizarImovel MANTIDA IGUAL (já está corrigida)
export async function atualizarImovel(codigo, dadosImovel) {
  try {
    console.group('📤 Service: Atualizando imóvel');
    console.log('🆔 Código:', codigo);
    console.log('📊 Dados básicos:', {
      empreendimento: dadosImovel.Empreendimento,
      totalFotos: Array.isArray(dadosImovel.Foto) ? dadosImovel.Foto.length : 'Não array',
      totalCampos: Object.keys(dadosImovel).length
    });
    
    // 🔍 Log detalhado das fotos sendo enviadas
    if (Array.isArray(dadosImovel.Foto) && dadosImovel.Foto.length > 0) {
      console.log('📸 Detalhes das fotos:');
      console.log('  - Total:', dadosImovel.Foto.length);
      console.log('  - Primeiras 5 ordens:', dadosImovel.Foto.slice(0, 5).map(f => f.Ordem));
      console.log('  - Últimas 5 ordens:', dadosImovel.Foto.slice(-5).map(f => f.Ordem));
      
      // Verificar se há fotos com ordens duplicadas ou inválidas
      const ordens = dadosImovel.Foto.map(f => f.Ordem);
      const ordensUnicas = [...new Set(ordens)];
      const temDuplicadas = ordens.length !== ordensUnicas.length;
      const temInvalidas = ordens.some(o => typeof o !== 'number' || o < 0);
      
      if (temDuplicadas) {
        console.warn('⚠️ ATENÇÃO: Ordens duplicadas detectadas!');
      }
      if (temInvalidas) {
        console.warn('⚠️ ATENÇÃO: Ordens inválidas detectadas!');
      }
    }

    console.log('🌐 Enviando requisição PUT para API...');
    console.log('📡 URL:', `/admin/imoveis/${codigo}`);
    
    // 🔥 ROTA CORRIGIDA: /admin/imoveis/ 
    const response = await axiosClient.put(`/admin/imoveis/${codigo}`, dadosImovel, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📥 Resposta HTTP recebida:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data
    });

    console.log('📋 Conteúdo da resposta:', {
      success: response.data?.success,
      message: response.data?.message,
      dataPresent: !!response.data?.data,
      errorPresent: !!response.data?.error
    });

    console.groupEnd();

    if (response && response.status >= 200 && response.status < 300) {
      console.log('✅ Service: Requisição HTTP bem-sucedida');
      return {
        success: response.data?.success || true,
        message: response.data?.message || "Imóvel atualizado com sucesso",
        data: response.data?.data || response.data, // ← DADOS ATUALIZADOS DA API
        metadata: response.data?.metadata
      };
    } else {
      console.error("❌ Service: Erro na resposta HTTP:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      return {
        success: false,
        message: response.data?.message || "Erro ao atualizar imóvel",
      };
    }
  } catch (error) {
    console.error("❌ Service: Erro ao atualizar imóvel:", error);
    console.groupEnd();
    
    // 🔍 Log detalhado do erro
    console.error('📊 Detalhes do erro:');
    console.error('  - Código:', error.code);
    console.error('  - Mensagem:', error.message);
    console.error('  - Status HTTP:', error.response?.status);
    console.error('  - Dados da resposta:', error.response?.data);
    
    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conexão com o servidor. Tente novamente mais tarde.",
        error: "Erro de conexão",
      };
    }

    if (error.response?.status >= 400 && error.response?.status < 500) {
      return {
        success: false,
        message: error.response?.data?.message || "Erro nos dados enviados",
        error: error.response?.data?.error || error.message,
      };
    }

    if (error.response?.status >= 500) {
      return {
        success: false,
        message: "Erro interno do servidor. Tente novamente mais tarde.",
        error: error.response?.data?.error || error.message,
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao atualizar imóvel",
      error: error.response?.data?.error || error.message || "Erro desconhecido",
    };
  }
}

// 🔥 FUNÇÃO NOVA: Forçar revalidação do cache do front
export async function forceRevalidateImovel(codigo, slug) {
  try {
    console.log('🔄 Forçando revalidação de cache para:', { codigo, slug });
    
    // Tentar acionar endpoint de revalidação se existir
    const response = await fetch(`/api/revalidate?path=/imovel-${codigo}/${slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      console.log('✅ Cache revalidado com sucesso');
      return { success: true };
    } else {
      console.warn('⚠️ Não foi possível revalidar cache via API');
      return { success: false };
    }
  } catch (error) {
    console.warn('⚠️ Erro ao tentar revalidar cache:', error);
    return { success: false };
  }
}

// 🔥 SUA FUNÇÃO getImovelById MANTIDA IGUAL (já está corrigida)
export const getImovelById = async (codigo) => {
  try {
    console.log('📥 Service: Buscando imóvel:', codigo);
    
    // 🔥 ROTA CORRIGIDA: /admin/imoveis/ 
    const response = await axiosClient.get(`/admin/imoveis/${codigo}`, {
      timeout: 25000
    });
    
    if (response && response.data) {
      console.log('✅ Service: Imóvel encontrado:', {
        codigo: response.data.data?.Codigo,
        totalFotos: Array.isArray(response.data.data?.Foto) ? response.data.data.Foto.length : 'Não array'
      });
      
      return {
        success: true,
        data: response.data?.data || response.data
      };
    }
    
    return {
      success: false,
      error: "Dados não encontrados na resposta"
    };
  } catch (error) {
    console.error("Erro ao buscar imóvel:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Erro ao buscar imóvel"
    };
  }
};

// 🔥 SUA FUNÇÃO desativarImovel MANTIDA IGUAL (já está corrigida)
export async function desativarImovel(codigo) {
  try {
    // 🔥 ROTA CORRIGIDA: /admin/imoveis/
    const response = await axiosClient.patch(`/admin/imoveis/${codigo}/desativar`, {}, {
      timeout: 25000,
    });

    return {
      success: response.data?.success || response.status >= 200 && response.status < 300,
      message: response.data?.message || "Imóvel desativado com sucesso",
    };
  } catch (error) {
    console.error("Service: Erro ao desativar imóvel:", error);

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conexão com o servidor. Tente novamente mais tarde.",
        error: "Erro de conexão",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao desativar imóvel",
      error: error.response?.data?.error || error.message || "Erro desconhecido",
    };
  }
}

// === TODAS AS SUAS FUNÇÕES ORIGINAIS MANTIDAS INALTERADAS ===

export async function getImovelByIdAutomacao(codigo) {
  try {
    const response = await axiosClient.get(`/automacao/${codigo}`, {
      timeout: 25000,
    });

    if (response && response.data) {
      if (response.data.data) {
        return response.data;
      } else {
        return { data: null, status: response.data.status };
      }
    } else {
      return { data: null, status: 404 };
    }
  } catch (error) {
    if (error.code === "ERR_NETWORK") {
      return {
        data: null,
        status: 503,
        error: "Erro de conexão com o servidor. Tente novamente mais tarde.",
      };
    }
    return {
      data: null,
      status: error.response?.status || 500,
      error: error.response?.data?.error || "Erro ao buscar imóvel",
    };
  }
}

export async function getImoveisAutomacao(params = {}, page = 1, limit = 12) {
  try {
    const validPage = ensureNumber(page, 1);
    const validLimit = ensureNumber(limit, 12);
    const url = `/automacao?page=${validPage}&limit=${validLimit}`;

    const response = await axiosClient.get(url, {
      timeout: 25000,
    });

    const data = response.data.data || [];
    const paginacao = response.data.paginacao || {};

    const totalItems = ensureNumber(paginacao.totalItems, data.length);
    const totalPages = ensureNumber(
      paginacao.totalPages,
      Math.max(1, Math.ceil(totalItems / validLimit))
    );
    const currentPage = ensureNumber(paginacao.currentPage, validPage);
    const itemsPerPage = ensureNumber(paginacao.limit, validLimit);

    return {
      imoveis: data,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        itemsPerPage,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar imóveis:", error);

    if (error.code === "ERR_NETWORK") {
      console.warn("Erro de rede na comunicação com a API. Retornando array vazio.");
      return {
        imoveis: [],
        error: "Erro de conexão com o servidor. Tente novamente mais tarde.",
        pagination: {
          totalItems: 0,
          totalPages: 1,
          currentPage: ensureNumber(page, 1),
          itemsPerPage: ensureNumber(limit, 12),
        },
      };
    }

    return {
      imoveis: [],
      error: error.response?.data?.error || "Erro ao buscar imóveis",
      pagination: {
        totalItems: 0,
        totalPages: 1,
        currentPage: ensureNumber(page, 1),
        itemsPerPage: ensureNumber(limit, 12),
      },
    };
  }
}

export async function atualizarImovelAutomacao(codigo, dadosImovel) {
  try {
    const response = await axiosClient.post(`/automacao/${codigo}`, dadosImovel, {
      timeout: 25000,
    });

    return {
      success: response.data?.success || false,
      message: response.data?.message || "Imóvel atualizado com sucesso",
      data: response.data?.data || null,
    };
  } catch (error) {
    console.error(`Serviço: Erro ao atualizar imóvel ${codigo}:`, error);

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conexão com o servidor. Tente novamente mais tarde.",
        error: "Erro de conexão",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao atualizar imóvel",
      error: error.response?.data?.error || "Erro desconhecido",
    };
  }
}

export async function excluirImovelAutomacao(codigo) {
  try {
    const response = await axiosClient.delete(`/automacao/${codigo}`, {
      timeout: 25000,
    });

    return {
      success: response.data?.success || false,
      message: response.data?.message || "Imóvel excluído com sucesso",
    };
  } catch (error) {
    console.error(`Serviço: Erro ao excluir imóvel ${codigo}:`, error);

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conexão com o servidor. Tente novamente mais tarde.",
        error: "Erro de conexão",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao excluir imóvel",
      error: error.response?.data?.error || "Erro desconhecido",
    };
  }
}

export async function getCorretores(params = {}, page = 1, limit = 12) {
  try {
    const validPage = ensureNumber(page, 1);
    const validLimit = ensureNumber(limit, 12);
    const url = `/admin/corretores?page=${validPage}&limit=${validLimit}`;

    const response = await axiosClient.get(url, {
      timeout: 25000,
    });

    const data = response.data.corretores || [];
    const paginacao = response.data.pagination || {};

    const totalItems = ensureNumber(paginacao.totalItems, data.length);
    const totalPages = ensureNumber(
      paginacao.totalPages,
      Math.max(1, Math.ceil(totalItems / validLimit))
    );
    const currentPage = ensureNumber(paginacao.currentPage, validPage);
    const itemsPerPage = ensureNumber(paginacao.limit, validLimit);

    return {
      corretores: data,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        itemsPerPage,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar corretores:", error);

    if (error.code === "ERR_NETWORK") {
      console.warn("Erro de rede na comunicação com a API. Retornando array vazio.");
      return {
        corretores: [],
        error: "Erro de conexão com o servidor. Tente novamente mais tarde.",
        pagination: {
          totalItems: 0,
          totalPages: 1,
          currentPage: ensureNumber(page, 1),
          itemsPerPage: ensureNumber(limit, 12),
        },
      };
    }

    return {
      corretores: [],
      error: error.response?.data?.error || "Erro ao buscar corretores",
      pagination: {
        totalItems: 0,
        totalPages: 1,
        currentPage: ensureNumber(page, 1),
        itemsPerPage: ensureNumber(limit, 12),
      },
    };
  }
}

export async function getCorretorById(id) {
  try {
    const response = await axiosClient.get(`/admin/corretores?id=${id}`, {
      timeout: 25000,
    });

    if (response && response.data && response.data.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    }
    return { success: false, error: "Corretor não encontrado" };
  } catch (error) {
    console.error(`Serviço: Erro ao buscar corretor ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.error || "Erro ao buscar corretor",
    };
  }
}

export async function atualizarCorretor(id, dadosCorretor) {
  try {
    const response = await axiosClient.put(
      `/admin/corretores`,
      {
        id,
        ...dadosCorretor,
      },
      {
        timeout: 25000,
      }
    );

    return {
      success: response.data?.success || false,
      message: response.data?.message || "Corretor atualizado com sucesso",
      data: response.data?.data || null,
    };
  } catch (error) {
    console.error(`Serviço: Erro ao atualizar corretor ${id}:`, error);

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conexão com o servidor. Tente novamente mais tarde.",
        error: "Erro de conexão",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao atualizar corretor",
      error: error.response?.data?.error || "Erro desconhecido",
    };
  }
}

export async function getProprietarios(page = 1, limit = 12) {
  try {
    const validPage = ensureNumber(page, 1);
    const validLimit = ensureNumber(limit, 12);
    const url = `/admin/proprietarios?page=${validPage}&limit=${validLimit}`;

    const response = await axiosClient.get(url, {
      timeout: 25000,
    });

    const data = response.data.data || [];
    const paginacao = response.data.paginacao || {};

    const totalItems = ensureNumber(paginacao.totalItems, data.length);
    const totalPages = ensureNumber(
      paginacao.totalPages,
      Math.max(1, Math.ceil(totalItems / validLimit))
    );
    const currentPage = ensureNumber(paginacao.currentPage, validPage);
    const itemsPerPage = ensureNumber(paginacao.limit, validLimit);

    return {
      proprietarios: data,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        itemsPerPage,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar proprietarios:", error);

    if (error.code === "ERR_NETWORK") {
      console.warn("Erro de rede na comunicação com a API. Retornando array vazio.");
      return {
        proprietarios: [],
        error: "Erro de conexão com o servidor. Tente novamente mais tarde.",
        pagination: {
          totalItems: 0,
          totalPages: 1,
          currentPage: ensureNumber(page, 1),
          itemsPerPage: ensureNumber(limit, 12),
        },
      };
    }

    return {
      proprietarios: [],
      error: error.response?.data?.error || "Erro ao buscar proprietarios",
      pagination: {
        totalItems: 0,
        totalPages: 1,
        currentPage: ensureNumber(page, 1),
        itemsPerPage: ensureNumber(limit, 12),
      },
    };
  }
}

export async function getProprietarioById(id) {
  try {
    const response = await axiosClient.get(`/admin/proprietarios?id=${id}`, {
      timeout: 25000,
    });

    if (response && response.data && response.data.status === 200) {
      return {
        success: true,
        data: response.data.data,
      };
    }
    return { success: false, error: "Proprietário não encontrado" };
  } catch (error) {
    console.error(`Serviço: Erro ao buscar proprietário ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.error || "Erro ao buscar proprietário",
    };
  }
}

export async function getProprietario(id) {
  try {
    const response = await axiosClient.get(`/admin/proprietario?id=${id}`, {
      timeout: 25000,
    });

    if (response && response.data && response.data.status === 200) {
      return {
        success: true,
        data: response.data.data,
      };
    }
  } catch (error) {
    console.error("Erro ao buscar proprietário:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Erro ao buscar proprietário",
    };
  }
}

export async function atualizarProprietario(id, dadosProprietario) {
  try {
    const response = await axiosClient.put(
      `/admin/proprietarios`,
      {
        id,
        ...dadosProprietario,
      },
      {
        timeout: 25000,
      }
    );

    return {
      success: response.data?.success || false,
      message: response.data?.message || "Proprietário atualizado com sucesso",
      data: response.data?.data || null,
    };
  } catch (error) {
    console.error(`Serviço: Erro ao atualizar proprietário ${id}:`, error);

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conexão com o servidor. Tente novamente mais tarde.",
        error: "Erro de conexão",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao atualizar proprietário",
      error: error.response?.data?.error || "Erro desconhecido",
    };
  }
}

export async function updateProprietario(id, dadosProprietario) {
  try {
    const response = await axiosClient.put(`/admin/proprietario?id=${id}`, dadosProprietario, {
      timeout: 25000,
    });

    return {
      success: response.data?.status === 200,
      message: response.data?.message || "Proprietário atualizado com sucesso",
      data: response.data?.data || null,
    };
  } catch (error) {
    console.error(`Serviço: Erro ao atualizar proprietário ${id}:`, error);

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conexão com o servidor. Tente novamente mais tarde.",
        error: "Erro de conexão",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao atualizar proprietário",
      error: error.response?.data?.error || "Erro desconhecido",
    };
  }
}

export async function adicionarProprietario(id, dadosProprietario) {
  try {
    const response = await axiosClient.post(`/admin/proprietario?id=${id}`, dadosProprietario, {
      timeout: 25000,
    });

    return {
      success: response.data?.status === 201,
      message: response.data?.message || "Proprietário criado com sucesso",
      data: response.data?.data || null,
    };
  } catch (error) {
    console.error(`Serviço: Erro ao criar proprietário ${id}:`, error);

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conexão com o servidor. Tente novamente mais tarde.",
        error: "Erro de conexão",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao criar proprietário",
      error: error.response?.data?.error || "Erro desconhecido",
    };
  }  
}

export async function getVinculos(id) {
  try {
    const response = await axiosClient.get(`/admin/vinculo?id=${id}`, {
      timeout: 25000,
    });

    if (response && response.data && response.data.status === 200) {
      return {
        success: true,
        data: response.data.data.corretores,
      };
    }
  } catch (error) {
    console.error(`Serviço: Erro ao buscar vinculos ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.error || "Erro ao buscar vinculos",
    };
  }
}

export async function getDashboard() {
  try {
    const response = await axiosClient.get("/admin/dashboard", {
      timeout: 25000,
    });

    if (response && response.data && response.data.status === 200) {
      return {
        success: true,
        data: response.data.data,
      };
    }
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Erro ao buscar dados do dashboard",
    };
  }
}
