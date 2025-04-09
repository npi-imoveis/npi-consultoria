import axiosClient from "@/app/lib/axios-client";

// Função para garantir que um valor seja um número válido
const ensureNumber = (value, defaultValue = 0) => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Função principal para buscar imóveis com suporte a paginação e filtros opcionais
export async function getImoveis(params = {}, page = 1, limit = 12) {
  try {
    // Garantir que page e limit sejam números válidos
    const validPage = ensureNumber(page, 1);
    const validLimit = ensureNumber(limit, 12);

    // Filtrar apenas os parâmetros que devem ser enviados
    const filtrosPermitidos = [
      "categoria",
      "cidade",
      "bairros",
      "finalidade",
      "quartos",
      "banheiros",
      "vagas",
      "busca",
      "precoMinimo",
      "precoMaximo",
      "areaMinima",
      "areaMaxima",
      "apenasCondominios",
      "proximoMetro",
    ];
    const queryParams = new URLSearchParams();

    // Adicionar apenas os parâmetros permitidos que não são vazios
    if (params && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        if (
          filtrosPermitidos.includes(key) &&
          value !== null &&
          value !== undefined &&
          value !== ""
        ) {
          queryParams.append(key, value);
        }
      });
    }

    // Tratar o array de bairros especificamente
    if (params.bairrosArray && Array.isArray(params.bairrosArray) && params.bairrosArray.length > 0) {
      // Adicionar cada bairro como um parâmetro separado
      params.bairrosArray.forEach(bairro => {
        if (bairro && typeof bairro === 'string' && bairro.trim() !== '') {
          queryParams.append("bairros", bairro.trim());
        }
      });
      console.log("Array de bairros enviado corretamente:", params.bairrosArray);
    }

    // Corrigir o envio dos bairros para garantir que cada bairro seja enviado como um valor separado
    if (params.bairros && typeof params.bairros === 'string') {
      const bairrosArray = params.bairros.split(',').map(bairro => bairro.trim());
      bairrosArray.forEach(bairro => {
        queryParams.append("bairros", bairro);
      });
    }

    // Adicionar parâmetros de paginação
    queryParams.append("page", validPage);
    queryParams.append("limit", validLimit);

    const queryString = queryParams.toString();

    // Determinar a URL com base na presença de filtros
    let url;
    if (Object.keys(params).length > 0 && queryParams.toString().length > 0) {
      url = `/imoveis/params/filtro?${queryString}`;
    } else {
      url = `/imoveis?${queryString}`;
    }

    console.log("URL da requisição:", url);
    // Imprimir os parâmetros para depuração
    console.log("Parâmetros enviados:", Object.fromEntries(queryParams.entries()));

    const response = await axiosClient.get(url);

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
    // Em caso de erro, retornamos um objeto com estrutura válida
    return {
      imoveis: [],
      pagination: {
        totalItems: 0,
        totalPages: 1,
        currentPage: ensureNumber(page, 1),
        itemsPerPage: ensureNumber(limit, 12),
      },
    };
  }
}

export async function getImoveisByFilters(filtro) {
  try {
    const response = await axiosClient.get(`/imoveis/filters/${filtro}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar filtros de imóveis:", error);
    return { data: [] };
  }
}

// Função específica para buscar bairros por cidade
export async function getBairrosPorCidade(cidade, categoria) {
  try {
    // Construir o caminho base para a API
    const filtro = cidade ? `BairrosPorCidade/${encodeURIComponent(cidade)}` : "Bairros";

    // Preparar os parâmetros de query para incluir a categoria
    const params = new URLSearchParams();
    if (categoria) {
      params.append("categoria", categoria);
    }

    // Construir a URL completa
    const queryString = params.toString();
    const url = `/imoveis/filters/${filtro}${queryString ? `?${queryString}` : ""}`;

    console.log(
      `Buscando bairros para cidade: ${cidade}${categoria ? ` e categoria: ${categoria}` : ""
      }, usando URL: ${url}`
    );

    const response = await axiosClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar bairros para cidade ${cidade}:`, error);
    return { data: [] };
  }
}

// Função para buscar um imóvel pelo Codigo
export async function getImovelById(codigo) {
  try {
    console.log(`Serviço: Buscando imóvel com Codigo ${codigo}`);

    // Garantir que estamos buscando pelo Codigo
    const response = await axiosClient.get(`/imoveis/${codigo}`);

    // Verificar se a resposta contém dados válidos
    if (response && response.data) {
      console.log("Serviço: Resposta da API recebida:", response.status);

      // Verificar se os dados estão em data.data
      if (response.data.data) {
        console.log("Serviço: Imóvel encontrado em data.data");
        return response.data;
      } else {
        console.log("Serviço: Dados não encontrados no formato esperado");
        return { data: null, status: response.data.status };
      }
    } else {
      console.error(`Serviço: Resposta vazia da API para imóvel ${codigo}`);
      return { data: null, status: 404 };
    }
  } catch (error) {
    console.error(`Serviço: Erro ao buscar imóvel ${codigo}:`, error);
    return {
      data: null,
      status: error.response?.status || 500,
      error: error.response?.data?.error || "Erro ao buscar imóvel",
    };
  }
}

// Função para atualizar um imóvel pelo Codigo
export async function atualizarImovel(codigo, dadosImovel) {
  try {
    console.log(`Serviço: Atualizando imóvel com Codigo ${codigo}`);

    // Garantir que estamos atualizando pelo Codigo
    const response = await axiosClient.put(`/imoveis/${codigo}`, dadosImovel);

    if (response && response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: response.data,
        message: "Imóvel atualizado com sucesso",
      };
    } else {
      console.error("Serviço: Erro na resposta ao atualizar imóvel", response);
      return {
        success: false,
        message: "Erro ao atualizar imóvel",
      };
    }
  } catch (error) {
    console.error("Serviço: Erro ao atualizar imóvel:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Erro ao atualizar imóvel",
      error: error,
    };
  }
}

// Função para excluir um imóvel pelo Codigo
export async function excluirImovel(codigo) {
  try {
    console.log(`Serviço: Excluindo imóvel com Codigo ${codigo}`);

    // Garantir que estamos excluindo pelo Codigo
    const response = await axiosClient.delete(`/imoveis/${codigo}`);

    if (response && response.status >= 200 && response.status < 300) {
      return {
        success: true,
        message: "Imóvel excluído com sucesso",
      };
    } else {
      console.error("Serviço: Erro na resposta ao excluir imóvel", response);
      return {
        success: false,
        message: "Erro ao excluir imóvel",
      };
    }
  } catch (error) {
    console.error("Serviço: Erro ao excluir imóvel:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Erro ao excluir imóvel",
      error: error,
    };
  }
}

// Função para cadastrar um novo imóvel
export async function cadastrarImovel(dadosImovel) {
  try {
    console.log("Serviço: Cadastrando novo imóvel");

    const response = await axiosClient.post(`/imoveis`, dadosImovel);

    if (response && response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: response.data,
        message: "Imóvel cadastrado com sucesso",
      };
    } else {
      console.error("Serviço: Erro na resposta ao cadastrar imóvel", response);
      return {
        success: false,
        message: "Erro ao cadastrar imóvel",
      };
    }
  } catch (error) {
    console.error("Serviço: Erro ao cadastrar imóvel:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Erro ao cadastrar imóvel",
      error: error,
    };
  }
}

export async function getImovelDestacado() {
  try {
    const response = await axiosClient.get("/imoveis/destaques");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar imóvel destacado:", error);
    return null;
  }
}

export async function getCondominios(limit) {
  try {
    console.log("Serviço: Iniciando busca de condomínios");
    const response = await axiosClient.get(`/condominios?limit=${limit}`);
    console.log("Serviço: Resposta bruta da API:", response);

    // Verificar se a resposta contém dados válidos
    if (response && response.data) {
      console.log("Serviço: Dados encontrados na resposta");

      // Verificar se os dados estão em data.data ou diretamente em data
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`Serviço: Encontrados ${response.data.data.length} condomínios em data.data`);
        return response.data;
      } else if (Array.isArray(response.data)) {
        console.log(`Serviço: Encontrados ${response.data.length} condomínios diretamente em data`);
        return { data: response.data };
      } else {
        console.log("Serviço: Formato de dados não reconhecido, retornando array vazio");
        return { data: [] };
      }
    } else {
      console.error("Serviço: Resposta vazia da API de condomínios");
      return { data: [] };
    }
  } catch (error) {
    console.error("Serviço: Erro ao buscar condomínios:", error);
    return { data: [] };
  }
}

// Função para buscar imóveis para o mapa
export const getImoveisParaMapa = async (filtros = {}) => {
  try {
    // Construir URL base
    let url = `/api/imoveis/mapa`;

    // Adicionar parâmetros de filtro à URL se existirem
    if (Object.keys(filtros).length > 0) {
      const params = new URLSearchParams();

      if (filtros.categoria) params.append("categoria", filtros.categoria);
      if (filtros.cidade) params.append("cidade", filtros.cidade);

      // Tratar a seleção múltipla de bairros
      if (filtros.bairros && Array.isArray(filtros.bairros) && filtros.bairros.length > 0) {
        filtros.bairros.forEach(bairro => {
          params.append("bairros", bairro);
        });
      }

      if (filtros.quartos) params.append("quartos", filtros.quartos);
      if (filtros.banheiros) params.append("banheiros", filtros.banheiros);
      if (filtros.vagas) params.append("vagas", filtros.vagas);

      // Adicionar log para verificar o array de bairros
      console.log("Array de bairros enviado:", filtros.bairros);

      url += `?${params.toString()}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro ao buscar imóveis para o mapa: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar imóveis para o mapa:", error);
    throw error;
  }
};

export async function getImoveisSimilares(id) {
  try {
    const response = await axiosClient.get(`/imoveis/similar?id=${id}`);
    console.log("Imoveis Similares", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar imóveis similares:", error);
  }
}

export async function getCondominiosPorImovel(id) {
  try {
    const response = await axiosClient.get(`/condominios/find?id=${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar condomínios por imóvel:", error);
  }
}

export async function getCondominioPorSlug(slug) {
  try {
    const response = await axiosClient.get(`/condominios/slug?slug=${slug}`);

    // Check different response data structures and handle each case
    if (response?.data) {
      // Case 1: Data directly in data object
      if (response.data.Empreendimento) {
        return {
          data: response.data,
          imoveisRelacionados: response.data.imoveisRelacionados || [],
          statusCode: 200
        };
      }

      // Case 2: Data in data.data object
      if (response.data.data && Object.keys(response.data.data).length > 0) {
        return {
          data: response.data.data,
          imoveisRelacionados: response.data.imoveisRelacionados || [],
          statusCode: 200
        };
      }
    }

    // If we reach here, no valid data was found
    return {
      data: null,
      statusCode: 404,
      message: "Condomínio não encontrado"
    };
  } catch (error) {
    // Para erros 404, não exibimos como erro no console, pois é um caso esperado
    if (error.response?.status === 404) {
      return {
        data: null,
        statusCode: 404,
        message: "Condomínio não encontrado"
      };
    }

    // Para outros erros, mantemos o log
    console.error("Erro ao buscar condomínio por slug:", error);
    return {
      data: null,
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Erro ao buscar condomínio"
    };
  }
}

export async function searchImoveis(query) {
  try {
    if (!query || query.trim() === "") {
      return { data: [] };
    }

    const response = await axiosClient.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao realizar busca:", error);
    return { data: [] };
  }
}