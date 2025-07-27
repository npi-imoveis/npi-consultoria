import axiosClient from "@/app/lib/axios-client";

// Helper para garantir valores numéricos
function ensureNumber(value, defaultValue) {
  const num = Number(value);
  return Number.isFinite(num) ? num : defaultValue;
}

// 🔄 Função para processar fotos antes do envio
function processarFotos(fotos, isVendido = false) {
  if (!fotos) return [];
  
  // Converter para array se for objeto
  let fotosArray = Array.isArray(fotos) 
    ? [...fotos]
    : Object.entries(fotos).map(([key, val]) => ({ ...val, Codigo: key }));

  // Garantir campo 'ordem' e tratar foto destaque
  fotosArray = fotosArray.map((foto, index) => ({
    ...foto,
    ordem: typeof foto.ordem === 'number' ? foto.ordem : index,
    Destaque: foto.Destaque || "Nao"
  }));

  // Ordenar pela ordem
  fotosArray.sort((a, b) => a.ordem - b.ordem);

  // Tratamento especial para imóveis vendidos
  if (isVendido) {
    // Garantir que a primeira foto seja destaque
    if (fotosArray.length > 0 && fotosArray[0].Destaque !== "Sim") {
      fotosArray[0].Destaque = "Sim";
    }
    
    // Remover fotos marcadas para exclusão (se houver)
    fotosArray = fotosArray.filter(foto => !foto._markedForDeletion);
  }

  return fotosArray;
}

// 📤 Atualizar Imóvel (Versão Completa Corrigida)
export async function atualizarImovel(codigo, dadosImovel) {
  try {
    console.group('🔄 Service: Atualizando Imóvel');
    
    // Validação inicial
    if (!codigo) {
      throw new Error("Código do imóvel é obrigatório");
    }

    // Processar fotos antes do envio
    const isVendido = dadosImovel.Status === "Vendido";
    const payload = {
      ...dadosImovel,
      Foto: processarFotos(dadosImovel.Foto, isVendido),
      Video: Array.isArray(dadosImovel.Video) ? dadosImovel.Video : []
    };

    console.log('📤 Dados enviados:', {
      codigo,
      totalFotos: payload.Foto.length,
      primeiraFoto: payload.Foto[0]?.Destaque,
      status: payload.Status
    });

    const response = await axiosClient.put(`/admin/imoveis/${codigo}`, payload, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.data) {
      throw new Error("Resposta vazia do servidor");
    }

    console.log('✅ Sucesso:', response.data.message);
    console.groupEnd();

    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Imóvel atualizado com sucesso"
    };

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.groupEnd();
    
    return {
      success: false,
      message: error.response?.data?.message || 
              error.message || 
              "Erro ao atualizar imóvel",
      error: error.response?.data?.error || error.message
    };
  }
}

// 🤖 Atualizar Imóvel da Automação (Versão Completa Corrigida)
export async function atualizarImovelAutomacao(codigo, dadosImovel) {
  try {
    console.group('🤖 Service: Atualizando Imóvel (Automação)');
    
    // Validação reforçada para automação
    if (!codigo || !dadosImovel?.Codigo) {
      throw new Error("Código do imóvel é obrigatório na automação");
    }

    // Processamento especial para automação
    const payload = {
      ...dadosImovel,
      Foto: processarFotos(dadosImovel.Foto),
      Automacao: true // Marcar como origem automática
    };

    console.log('📤 Dados automação:', {
      codigo,
      totalFotos: payload.Foto.length,
      primeiraFoto: payload.Foto[0]?.Destaque
    });

    const response = await axiosClient.post(
      `/admin/imoveis/${codigo}/automacao`, 
      payload,
      { timeout: 30000 }
    );

    // Garantir código de retorno válido
    const resultado = {
      ...response.data,
      data: {
        ...response.data?.data,
        Codigo: response.data?.data?.Codigo || codigo
      }
    };

    console.log('✅ Automação concluída:', resultado.message);
    console.groupEnd();

    return {
      success: true,
      ...resultado
    };

  } catch (error) {
    console.error('❌ Erro na automação:', error.message);
    console.groupEnd();
    
    return {
      success: false,
      message: "Falha na automação: " + 
              (error.response?.data?.message || error.message),
      error: error.response?.data || error.message
    };
  }
}

// 🆕 Criar Imóvel (Versão Completa Corrigida)
export async function criarImovel(codigo, dadosImovel) {
  try {
    console.group('🆕 Service: Criando Imóvel');
    
    if (!codigo) {
      throw new Error("Código do imóvel é obrigatório");
    }

    // Processar fotos e garantir ordem
    const payload = {
      ...dadosImovel,
      Codigo: codigo,
      Foto: processarFotos(dadosImovel.Foto),
      Video: Array.isArray(dadosImovel.Video) ? dadosImovel.Video : []
    };

    console.log('📤 Dados criação:', {
      codigo,
      totalFotos: payload.Foto.length,
      primeiraFoto: payload.Foto[0]?.Destaque
    });

    const response = await axiosClient.post('/admin/imoveis', payload, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Imóvel criado:', response.data?.data?.Codigo);
    console.groupEnd();

    return {
      success: true,
      data: response.data?.data,
      message: response.data?.message || "Imóvel criado com sucesso"
    };

  } catch (error) {
    console.error('❌ Erro ao criar imóvel:', error.message);
    console.groupEnd();
    
    return {
      success: false,
      message: error.response?.data?.message || 
              error.message || 
              "Erro ao criar imóvel",
      error: error.response?.data || error.message
    };
  }
}

// 🔍 Buscar Imóvel por ID (Versão Completa Corrigida)
export const getImovelById = async (codigo) => {
  try {
    console.log('🔍 Service: Buscando imóvel:', codigo);
    
    const response = await axiosClient.get(`/admin/imoveis/${codigo}`, {
      timeout: 25000
    });
    
    if (!response.data?.data) {
      throw new Error("Imóvel não encontrado");
    }

    // Ordenar fotos pela ordem salva
    const imovel = {
      ...response.data.data,
      Foto: processarFotos(response.data.data.Foto)
    };

    console.log('✅ Imóvel encontrado:', {
      codigo: imovel.Codigo,
      totalFotos: imovel.Foto.length,
      status: imovel.Status
    });

    return {
      success: true,
      data: imovel
    };
    
  } catch (error) {
    console.error("❌ Erro ao buscar imóvel:", error.message);
    return {
      success: false,
      error: error.response?.data?.message || 
             error.message || 
             "Erro ao buscar imóvel"
    };
  }
};

// Função para desativar imóvel (ROTA CORRIGIDA)
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

// === MANTER TODAS AS OUTRAS FUNÇÕES INALTERADAS ===

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
