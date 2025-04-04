import axiosClient from "@/app/lib/axios-client";



function ensureNumber(value, defaultValue) {
    const num = Number(value);
    return Number.isFinite(num) ? num : defaultValue;
}



export async function getImovelByIdAutomacao(codigo) {
    try {
        console.log(`Serviço: Buscando imóvel com Codigo ${codigo}`);

        // Garantir que estamos buscando pelo Codigo
        const response = await axiosClient.get(`/automacao/${codigo}`, {
            timeout: 25000 // Timeout de 25 segundos
        });

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
        if (error.code === 'ERR_NETWORK') {
            return {
                data: null,
                status: 503,
                error: "Erro de conexão com o servidor. Tente novamente mais tarde."
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

        console.log(`Serviço: Buscando imóveis na URL: ${url}`);

        const response = await axiosClient.get(url, {
            timeout: 25000 // Timeout de 25 segundos
        });

        console.log(`Serviço: Resposta recebida com status: ${response.status}`);

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

        console.log(`Serviço: Encontrados ${totalItems} imóveis, retornando ${data.length}`);

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
        if (error.code === 'ERR_NETWORK') {
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

export async function atualizarImovelAutomacao(codigo, dadosImovel) {
    try {
        console.log(`Serviço: Atualizando imóvel com Codigo ${codigo}`);

        const response = await axiosClient.post(`/automacao/${codigo}`, dadosImovel, {
            timeout: 25000 // Timeout de 25 segundos
        });

        console.log("Serviço: Resposta da API de atualização recebida:", response.status);

        return {
            success: response.data?.success || false,
            message: response.data?.message || "Imóvel atualizado com sucesso",
            data: response.data?.data || null,
        };
    } catch (error) {
        console.error(`Serviço: Erro ao atualizar imóvel ${codigo}:`, error);

        if (error.code === 'ERR_NETWORK') {
            return {
                success: false,
                message: "Erro de conexão com o servidor. Tente novamente mais tarde.",
                error: "Erro de conexão"
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
        console.log(`Serviço: Excluindo imóvel com Codigo ${codigo}`);

        const response = await axiosClient.delete(`/automacao/${codigo}`, {
            timeout: 25000 // Timeout de 25 segundos
        });

        console.log("Serviço: Resposta da API de exclusão recebida:", response.status);

        return {
            success: response.data?.success || false,
            message: response.data?.message || "Imóvel excluído com sucesso",
        };
    } catch (error) {
        console.error(`Serviço: Erro ao excluir imóvel ${codigo}:`, error);

        if (error.code === 'ERR_NETWORK') {
            return {
                success: false,
                message: "Erro de conexão com o servidor. Tente novamente mais tarde.",
                error: "Erro de conexão"
            };
        }

        return {
            success: false,
            message: error.response?.data?.message || "Erro ao excluir imóvel",
            error: error.response?.data?.error || "Erro desconhecido",
        };
    }
}


