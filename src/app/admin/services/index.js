import axiosClient from "@/app/lib/axios-client";

function ensureNumber(value, defaultValue) {
  const num = Number(value);
  return Number.isFinite(num) ? num : defaultValue;
}

export async function getImovelByIdAutomacao(codigo) {
  try {
    // Garantir que estamos buscando pelo Codigo
    const response = await axiosClient.get(`/automacao/${codigo}`, {
      timeout: 25000, // Timeout de 25 segundos
    });

    // Verificar se a resposta contém dados válidos
    if (response && response.data) {
      // Verificar se os dados estão em data.data
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
    // Garantir que page e limit sejam números válidos
    const validPage = ensureNumber(page, 1);
    const validLimit = ensureNumber(limit, 12);

    // Construir a URL com os parâmetros de paginação
    const url = `/automacao?page=${validPage}&limit=${validLimit}`;

    const response = await axiosClient.get(url, {
      timeout: 25000, // Timeout de 25 segundos
    });

    // Extrair dados e informações de paginação da resposta
    const data = response.data.data || [];
    const paginacao = response.data.paginacao || {};

    // Garantir que todos os valores de paginação sejam números válidos
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

    // Tratamento específico para erros de rede
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

    // Em caso de outros erros, retornamos um objeto com estrutura válida
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

export async function getCorretores(params = {}, page = 1, limit = 12) {
  try {
    // Garantir que page e limit sejam números válidos
    const validPage = ensureNumber(page, 1);
    const validLimit = ensureNumber(limit, 12);

    // Construir a URL com os parâmetros de paginação
    const url = `/admin/corretores?page=${validPage}&limit=${validLimit}`;

    const response = await axiosClient.get(url, {
      timeout: 25000, // Timeout de 25 segundos
    });


    // Extrair dados e informações de paginação da resposta
    const data = response.data.corretores || [];
    const paginacao = response.data.pagination || {};

    // Garantir que todos os valores de paginação sejam números válidos
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

    // Tratamento específico para erros de rede
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

    // Em caso de outros erros, retornamos um objeto com estrutura válida
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

export async function getProprietarios(page = 1, limit = 12) {
  try {
    // Garantir que page e limit sejam números válidos
    const validPage = ensureNumber(page, 1);
    const validLimit = ensureNumber(limit, 12);

    // Construir a URL com os parâmetros de paginação
    const url = `/admin/proprietarios?page=${validPage}&limit=${validLimit}`;

    const response = await axiosClient.get(url, {
      timeout: 25000, // Timeout de 25 segundos
    });

    // Extrair dados e informações de paginação da resposta
    const data = response.data.data || [];
    const paginacao = response.data.paginacao || {};

    // Garantir que todos os valores de paginação sejam números válidos
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

    // Tratamento específico para erros de rede
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

    // Em caso de outros erros, retornamos um objeto com estrutura válida
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

export async function atualizarImovelAutomacao(codigo, dadosImovel) {
  try {
    const response = await axiosClient.post(`/automacao/${codigo}`, dadosImovel, {
      timeout: 25000, // Timeout de 25 segundos
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
      timeout: 25000, // Timeout de 25 segundos
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
    console.error("Erro ao buscar dados do dashboard:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Erro ao buscar dados do dashboard",
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
export const getImovelById = async (codigo) => {
  try {
    const response = await axiosClient.get(`admin/imoveis/${codigo}`);
    return {
      success: true,
      data: response.data?.data || response.data
    };
  } catch (error) {
    console.error("Erro ao buscar imóvel:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Erro ao buscar imóvel"
    };
  }
};
