import axiosClient from "@/app/lib/axios-client";

function ensureNumber(value, defaultValue) {
  const num = Number(value);
  return Number.isFinite(num) ? num : defaultValue;
}

// 🔥 FUNÇÃO OTIMIZADA: Buscar imóvel por ID
export const getImovelById = async (codigo) => {
  try {
    console.log('📥 Service: Buscando imóvel:', codigo);
    
    const response = await axiosClient.get(`admin/imoveis/${codigo}`, {
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

// 🔥 FUNÇÃO OTIMIZADA: Atualizar imóvel
export async function atualizarImovel(codigo, dadosImovel) {
  try {
    console.group('📤 Service: Atualizando imóvel');
    console.log('Código:', codigo);
    console.log('Dados:', {
      empreendimento: dadosImovel.Empreendimento,
      totalFotos: Array.isArray(dadosImovel.Foto) ? dadosImovel.Foto.length : 'Não array',
      primeirasFotosOrdem: Array.isArray(dadosImovel.Foto) 
        ? dadosImovel.Foto.slice(0, 3).map(f => ({ codigo: f.Codigo, ordem: f.ordem }))
        : 'N/A'
    });

    const response = await axiosClient.put(`/admin/imoveis/${codigo}`, dadosImovel, {
      timeout: 30000, // Aumentar timeout para operações de salvamento
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📥 Service: Resposta recebida:', {
      status: response.status,
      success: response.data?.success
    });
    console.groupEnd();

    if (response && response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Imóvel atualizado com sucesso",
      };
    } else {
      console.error("Service: Erro na resposta ao atualizar imóvel", response);
      return {
        success: false,
        message: response.data?.message || "Erro ao atualizar imóvel",
      };
    }
  } catch (error) {
    console.error("Service: Erro ao atualizar imóvel:", error);
    console.groupEnd();
    
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
      error: error.response?.data?.error || error.message || "Erro desconhecido",
    };
  }
}

// 🔥 FUNÇÃO OTIMIZADA: Criar imóvel
export async function criarImovel(codigo, dadosImovel) {
  try {
    console.group('📤 Service: Criando imóvel');
    console.log('Código:', codigo);
    console.log('Dados:', {
      empreendimento: dadosImovel.Empreendimento,
      totalFotos: Array.isArray(dadosImovel.Foto) ? dadosImovel.Foto.length : 'Não array'
    });

    const response = await axiosClient.post(`/admin/imoveis`, {
      Codigo: codigo,
      ...dadosImovel
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📥 Service: Resposta recebida:', {
      status: response.status,
      success: response.data?.success
    });
    console.groupEnd();

    return {
      success: response.data?.success || response.status >= 200 && response.status < 300,
      message: response.data?.message || "Imóvel criado com sucesso",
      data: response.data?.data || null,
    };
  } catch (error) {
    console.error("Service: Erro ao criar imóvel:", error);
    console.groupEnd();

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conexão com o servidor. Tente novamente mais tarde.",
        error: "Erro de conexão",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao criar imóvel",
      error: error.response?.data?.error || error.message || "Erro desconhecido",
    };
  }
}

// Função para desativar imóvel
export async function desativarImovel(codigo) {
  try {
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

// Manter outras funções existentes...
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

// Demais funções permanecem inalteradas...
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

// Outras funções existentes permanecem inalteradas...
