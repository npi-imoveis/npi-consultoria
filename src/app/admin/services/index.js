import axiosClient from "@/app/lib/axios-client";

function ensureNumber(value, defaultValue) {
  const num = Number(value);
  return Number.isFinite(num) ? num : defaultValue;
}

// 馃敟 FUN脟脙O CORRIGIDA: Atualizar im贸vel (ROTA CORRETA)
export async function atualizarImovel(codigo, dadosImovel) {
  try {
    console.group('馃摛 Service: Atualizando im贸vel');
    console.log('C贸digo:', codigo);
    console.log('Dados:', {
      empreendimento: dadosImovel.Empreendimento,
      totalFotos: Array.isArray(dadosImovel.Foto) ? dadosImovel.Foto.length : 'N茫o array',
      primeirasFotosOrdem: Array.isArray(dadosImovel.Foto) 
        ? dadosImovel.Foto.slice(0, 3).map(f => ({ codigo: f.Codigo, ordem: f.ordem }))
        : 'N/A'
    });

    // 馃敟 ROTA CORRIGIDA: /admin/imoveis/ em vez de /imoveis/
        const response = await axiosClient.put(`/admin/imoveis/${codigo}`, dadosImovel, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('馃摜 Service: Resposta recebida:', {
      status: response.status,
      success: response.data?.success
    });
    console.groupEnd();

    if (response && response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Im贸vel atualizado com sucesso",
      };
    } else {
      console.error("Service: Erro na resposta ao atualizar im贸vel", response);
      return {
        success: false,
        message: response.data?.message || "Erro ao atualizar im贸vel",
      };
    }
  } catch (error) {
    console.error("Service: Erro ao atualizar im贸vel:", error);
    console.groupEnd();
    
    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conex茫o com o servidor. Tente novamente mais tarde.",
        error: "Erro de conex茫o",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao atualizar im贸vel",
      error: error.response?.data?.error || error.message || "Erro desconhecido",
    };
  }
}

// 馃敟 FUN脟脙O CORRIGIDA: Criar im贸vel (ROTA CORRETA)
export async function criarImovel(codigo, dadosImovel) {
  try {
    console.group('馃摛 Service: Criando im贸vel');
    console.log('C贸digo:', codigo);
    console.log('Dados:', {
      empreendimento: dadosImovel.Empreendimento,
      totalFotos: Array.isArray(dadosImovel.Foto) ? dadosImovel.Foto.length : 'N茫o array'
    });

    // 馃敟 ROTA CORRIGIDA: /admin/imoveis em vez de /admin/imoveis
    const response = await axiosClient.post(`/admin/imoveis`, {
      Codigo: codigo,
      ...dadosImovel
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('馃摜 Service: Resposta recebida:', {
      status: response.status,
      success: response.data?.success
    });
    console.groupEnd();

    return {
      success: response.data?.success || response.status >= 200 && response.status < 300,
      message: response.data?.message || "Im贸vel criado com sucesso",
      data: response.data?.data || null,
    };
  } catch (error) {
    console.error("Service: Erro ao criar im贸vel:", error);
    console.groupEnd();

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conex茫o com o servidor. Tente novamente mais tarde.",
        error: "Erro de conex茫o",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao criar im贸vel",
      error: error.response?.data?.error || error.message || "Erro desconhecido",
    };
  }
}

// 馃敟 FUN脟脙O OTIMIZADA: Buscar im贸vel por ID (ROTA CORRETA)
export const getImovelById = async (codigo) => {
  try {
    console.log('馃摜 Service: Buscando im贸vel:', codigo);
    
    // 馃敟 ROTA CORRIGIDA: /admin/imoveis/ 
    const response = await axiosClient.get(`/admin/imoveis/${codigo}`, {
      timeout: 25000
    });
    
    if (response && response.data) {
      console.log('鉁?Service: Im贸vel encontrado:', {
        codigo: response.data.data?.Codigo,
        totalFotos: Array.isArray(response.data.data?.Foto) ? response.data.data.Foto.length : 'N茫o array'
      });
      
      return {
        success: true,
        data: response.data?.data || response.data
      };
    }
    
    return {
      success: false,
      error: "Dados n茫o encontrados na resposta"
    };
  } catch (error) {
    console.error("Erro ao buscar im贸vel:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Erro ao buscar im贸vel"
    };
  }
};

// Fun莽茫o para desativar im贸vel (ROTA CORRIGIDA)
export async function desativarImovel(codigo) {
  try {
    // 馃敟 ROTA CORRIGIDA: /admin/imoveis/
    const response = await axiosClient.patch(`/admin/imoveis/${codigo}/desativar`, {}, {
      timeout: 25000,
    });

    return {
      success: response.data?.success || response.status >= 200 && response.status < 300,
      message: response.data?.message || "Im贸vel desativado com sucesso",
    };
  } catch (error) {
    console.error("Service: Erro ao desativar im贸vel:", error);

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conex茫o com o servidor. Tente novamente mais tarde.",
        error: "Erro de conex茫o",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao desativar im贸vel",
      error: error.response?.data?.error || error.message || "Erro desconhecido",
    };
  }
}

// === MANTER TODAS AS OUTRAS FUN脟脮ES INALTERADAS ===

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
        error: "Erro de conex茫o com o servidor. Tente novamente mais tarde.",
      };
    }
    return {
      data: null,
      status: error.response?.status || 500,
      error: error.response?.data?.error || "Erro ao buscar im贸vel",
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
    console.error("Erro ao buscar im贸veis:", error);

    if (error.code === "ERR_NETWORK") {
      console.warn("Erro de rede na comunica莽茫o com a API. Retornando array vazio.");
      return {
        imoveis: [],
        error: "Erro de conex茫o com o servidor. Tente novamente mais tarde.",
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
      error: error.response?.data?.error || "Erro ao buscar im贸veis",
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
      message: response.data?.message || "Im贸vel atualizado com sucesso",
      data: response.data?.data || null,
    };
  } catch (error) {
    console.error(`Servi莽o: Erro ao atualizar im贸vel ${codigo}:`, error);

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conex茫o com o servidor. Tente novamente mais tarde.",
        error: "Erro de conex茫o",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao atualizar im贸vel",
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
      message: response.data?.message || "Im贸vel exclu铆do com sucesso",
    };
  } catch (error) {
    console.error(`Servi莽o: Erro ao excluir im贸vel ${codigo}:`, error);

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conex茫o com o servidor. Tente novamente mais tarde.",
        error: "Erro de conex茫o",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao excluir im贸vel",
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
      console.warn("Erro de rede na comunica莽茫o com a API. Retornando array vazio.");
      return {
        corretores: [],
        error: "Erro de conex茫o com o servidor. Tente novamente mais tarde.",
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
    return { success: false, error: "Corretor n茫o encontrado" };
  } catch (error) {
    console.error(`Servi莽o: Erro ao buscar corretor ${id}:`, error);
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
    console.error(`Servi莽o: Erro ao atualizar corretor ${id}:`, error);

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conex茫o com o servidor. Tente novamente mais tarde.",
        error: "Erro de conex茫o",
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
      console.warn("Erro de rede na comunica莽茫o com a API. Retornando array vazio.");
      return {
        proprietarios: [],
        error: "Erro de conex茫o com o servidor. Tente novamente mais tarde.",
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
    return { success: false, error: "Propriet谩rio n茫o encontrado" };
  } catch (error) {
    console.error(`Servi莽o: Erro ao buscar propriet谩rio ${id}:`, error);
    return {
      success: false,
      error: error.response?.data?.error || "Erro ao buscar propriet谩rio",
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
    console.error("Erro ao buscar propriet谩rio:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Erro ao buscar propriet谩rio",
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
      message: response.data?.message || "Propriet谩rio atualizado com sucesso",
      data: response.data?.data || null,
    };
  } catch (error) {
    console.error(`Servi莽o: Erro ao atualizar propriet谩rio ${id}:`, error);

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conex茫o com o servidor. Tente novamente mais tarde.",
        error: "Erro de conex茫o",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao atualizar propriet谩rio",
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
      message: response.data?.message || "Propriet谩rio atualizado com sucesso",
      data: response.data?.data || null,
    };
  } catch (error) {
    console.error(`Servi莽o: Erro ao atualizar propriet谩rio ${id}:`, error);

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conex茫o com o servidor. Tente novamente mais tarde.",
        error: "Erro de conex茫o",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao atualizar propriet谩rio",
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
      message: response.data?.message || "Propriet谩rio criado com sucesso",
      data: response.data?.data || null,
    };
  } catch (error) {
    console.error(`Servi莽o: Erro ao criar propriet谩rio ${id}:`, error);

    if (error.code === "ERR_NETWORK") {
      return {
        success: false,
        message: "Erro de conex茫o com o servidor. Tente novamente mais tarde.",
        error: "Erro de conex茫o",
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || "Erro ao criar propriet谩rio",
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
    console.error(`Servi莽o: Erro ao buscar vinculos ${id}:`, error);
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
