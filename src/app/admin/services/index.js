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
            timeout: 25000, // Timeout de 25 segundos
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

        console.log(`Serviço: Buscando imóveis na URL: ${url}`);

        const response = await axiosClient.get(url, {
            timeout: 25000, // Timeout de 25 segundos
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

        console.log(`Serviço: Buscando corretores na URL: ${url}`);

        const response = await axiosClient.get(url, {
            timeout: 25000, // Timeout de 25 segundos
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

        console.log(`Serviço: Encontrados ${totalItems} corretores, retornando ${data.length}`);

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

export async function getProprietarios(params = {}, page = 1, limit = 12) {
    try {
        // Garantir que page e limit sejam números válidos
        const validPage = ensureNumber(page, 1);
        const validLimit = ensureNumber(limit, 12);

        // Construir a URL com os parâmetros de paginação
        const url = `/admin/proprietarios?page=${validPage}&limit=${validLimit}`;

        console.log(`Serviço: Buscando proprietarios na URL: ${url}`);

        const response = await axiosClient.get(url, {
            timeout: 25000, // Timeout de 25 segundos
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

        console.log(`Serviço: Encontrados ${totalItems} proprietarios, retornando ${data.length}`);

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
        console.log(`Serviço: Buscando proprietario com ID ${id}`);
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
        console.log(`Serviço: Atualizando proprietário com ID ${id}`);

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

        console.log("Serviço: Resposta da API de atualização recebida:", response.status);

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
        console.log(`Serviço: Atualizando imóvel com Codigo ${codigo}`);

        const response = await axiosClient.post(`/automacao/${codigo}`, dadosImovel, {
            timeout: 25000, // Timeout de 25 segundos
        });

        console.log("Serviço: Resposta da API de atualização recebida:", response.status);

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
        console.log(`Serviço: Excluindo imóvel com Codigo ${codigo}`);

        const response = await axiosClient.delete(`/automacao/${codigo}`, {
            timeout: 25000, // Timeout de 25 segundos
        });

        console.log("Serviço: Resposta da API de exclusão recebida:", response.status);

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
        console.log(`Serviço: Atualizando corretor com ID ${id}`);

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

        console.log("Serviço: Resposta da API de atualização recebida:", response.status);

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
        console.log(`Serviço: Buscando corretor com ID ${id}`);
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
        console.log(`Serviço: Buscando vinculos com ID ${id}`);
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
        console.log(`Serviço: Atualizando proprietário com PLACA ${id}`);

        const response = await axiosClient.put(
            `/admin/proprietario?id=${id}`,
            dadosProprietario,
            {
                timeout: 25000,
            }
        );

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
