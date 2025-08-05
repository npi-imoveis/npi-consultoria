"use client";

import { useState, useMemo } from "react";
import { Home, Bed, Car, Calendar, Building } from "lucide-react";
import dynamic from 'next/dynamic';
import { photoSorter } from "@/app/utils/photoSorter";
import { ImageGallery } from "@/app/components/sections/image-gallery";

// 🚀 LAZY LOADING - só carrega quando necessário
const DetalhesCondominioSobre = dynamic(() => import('./DetalhesCondominioSobre'), {
    loading: () => <div className="w-full h-64 bg-zinc-100 animate-pulse rounded-lg"></div>,
    ssr: false // 🎯 Não renderizar no servidor para melhor performance
});

// ✅ FUNÇÃO CORRIGIDA: Formatador de data robusto
const formatarDataEntrega = (dataEntrega) => {
    if (!dataEntrega) return 'Data não informada';
    
    // Se for uma string, tentar parseá-la
    if (typeof dataEntrega === 'string') {
        // Remover qualquer "undefined" da string
        const dataLimpa = dataEntrega.replace(/undefined\/?/g, '').replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
        
        if (!dataLimpa || dataLimpa.length < 8) {
            return 'Data não informada';
        }
        
        // Tentar diferentes formatos de data
        const formatosBR = [
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
        ];
        
        for (const formato of formatosBR) {
            const match = dataLimpa.match(formato);
            if (match) {
                const [, p1, p2, p3] = match;
                
                // Se for formato americano (YYYY-MM-DD)
                if (formato === formatosBR[1]) {
                    const data = new Date(parseInt(p1), parseInt(p2) - 1, parseInt(p3));
                    if (!isNaN(data.getTime())) {
                        return data.toLocaleDateString('pt-BR');
                    }
                }
                
                // Se for formato brasileiro (DD/MM/YYYY)
                const data = new Date(parseInt(p3), parseInt(p2) - 1, parseInt(p1));
                if (!isNaN(data.getTime())) {
                    return data.toLocaleDateString('pt-BR');
                }
            }
        }
    }
    
    // Se for um objeto Date
    if (dataEntrega instanceof Date && !isNaN(dataEntrega.getTime())) {
        return dataEntrega.toLocaleDateString('pt-BR');
    }
    
    // Último recurso: tentar converter para Date
    try {
        const data = new Date(dataEntrega);
        if (!isNaN(data.getTime())) {
            return data.toLocaleDateString('pt-BR');
        }
    } catch (error) {
        console.warn('❌ Erro ao formatar data:', error);
    }
    
    return 'Data não informada';
};

// ✅ FUNÇÃO OTIMIZADA: Processar HTML com cache
const processarHtmlDescricao = useMemo(() => {
    const cache = new Map();
    
    return (htmlString) => {
        if (!htmlString) return '';
        
        // 🎯 CACHE para evitar reprocessamento
        if (cache.has(htmlString)) {
            return cache.get(htmlString);
        }
        
        const htmlProcessado = htmlString
            // Processar tags de heading com classes Tailwind
            .replace(/<h2>/g, '<h2 class="text-lg font-bold text-gray-900 mt-6 mb-3 leading-tight">')
            .replace(/<h3>/g, '<h3 class="text-base font-semibold text-gray-800 mt-5 mb-2 leading-tight">')
            .replace(/<h4>/g, '<h4 class="text-sm font-medium text-gray-700 mt-4 mb-2">')
            .replace(/<h5>/g, '<h5 class="text-sm font-medium text-gray-600 mt-3 mb-1">')
            // Processar parágrafos
            .replace(/<p>/g, '<p class="text-sm text-gray-700 mb-3 leading-relaxed">')
            // Processar listas
            .replace(/<ul>/g, '<ul class="text-sm text-gray-700 mb-3 ml-4 space-y-1">')
            .replace(/<ol>/g, '<ol class="text-sm text-gray-700 mb-3 ml-4 space-y-1">')
            .replace(/<li>/g, '<li class="leading-relaxed">')
            // Processar texto em negrito e itálico
            .replace(/<strong>/g, '<strong class="font-semibold text-gray-900">')
            .replace(/<b>/g, '<b class="font-semibold text-gray-900">')
            .replace(/<em>/g, '<em class="italic text-gray-800">')
            .replace(/<i>/g, '<i class="italic text-gray-800">');
        
        cache.set(htmlString, htmlProcessado);
        return htmlProcessado;
    };
}, []);

// 🎯 FUNÇÃO OTIMIZADA: Processar fotos com memoização
function processarFotosCondominio(fotos, codigoCondominio) {
    return useMemo(() => {
        if (!Array.isArray(fotos) || fotos.length === 0) {
            return [];
        }

        try {
            console.log('📝 SOBRE-CONDOMÍNIO: Iniciando ordenação com photoSorter...', {
                totalFotos: fotos.length,
                codigo: codigoCondominio
            });
            
            // 🔥 SEMPRE LIMPAR CAMPOS ORDEM PARA FORÇAR ANÁLISE INTELIGENTE
            const fotosLimpas = fotos.map(foto => {
                const { Ordem, ordem, ORDEM, ...fotoSemOrdem } = foto;
                return fotoSemOrdem;
            });
            
            console.log('🧹 SOBRE-CONDOMÍNIO: Campos ORDEM removidos para forçar análise inteligente');
            
            // USAR photoSorter.ordenarFotos() - SEMPRE ANÁLISE INTELIGENTE
            const fotosOrdenadas = photoSorter.ordenarFotos(fotosLimpas, codigoCondominio || 'sobre-condominio');
            
            console.log('✅ SOBRE-CONDOMÍNIO: Análise inteligente aplicada:', {
                totalFotos: fotosOrdenadas.length,
                primeira: fotosOrdenadas[0]?.Foto?.split('/').pop()?.substring(0, 30) + '...',
                metodo: 'ANÁLISE INTELIGENTE (campos ORDEM removidos)'
            });

            return fotosOrdenadas;

        } catch (error) {
            console.error('❌ SOBRE-CONDOMÍNIO: Erro ao usar photoSorter:', error);
            return fotos; // Fallback seguro
        }
    }, [fotos, codigoCondominio]);
}

// 🚀 COMPONENTE PRINCIPAL OTIMIZADO
export default function SobreCondominio({ condominio }) {
    // 🎯 MEMOIZAÇÃO das fotos processadas
    const fotosOrdenadas = processarFotosCondominio(condominio.Foto, condominio.Codigo);
    
    // Estado para controlar se o texto está expandido
    const [expanded, setExpanded] = useState(false);
    
    // 🎯 MEMOIZAÇÃO do título
    const titulo = useMemo(() => 
        `Mais sobre ${condominio.Categoria} ${condominio.Empreendimento}`,
        [condominio.Categoria, condominio.Empreendimento]
    );
    
    return (
        <div className="bg-white rounded-lg container mx-auto p-10 mt-4">
            <h2 className="text-xl font-bold text-black">
                {titulo}
            </h2>
            
            {/* 🎯 LAYOUT CONDICIONAL: Grid 2 colunas quando collapsed, layout vertical quando expanded */}
            <div className={`mt-10 ${expanded ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'}`}>
                
                {/* 🎯 GALERIA - sempre no topo quando expanded */}
                <div className={expanded ? 'w-full' : ''}>
                    <ImageGallery 
                        fotos={fotosOrdenadas}
                        title={condominio.Empreendimento}
                        shareUrl={`${process.env.NEXT_PUBLIC_SITE_URL || ''}`}
                        shareTitle={`Confira as fotos: ${condominio.Empreendimento}`}
                    />
                </div>
                
                {/* 🎯 DETALHES - aproveita melhor o espaço quando expanded */}
                <div className={expanded ? 'w-full' : ''}>
                    <DetalhesCondominioMelhorado 
                        condominio={condominio} 
                        expanded={expanded}
                        setExpanded={setExpanded}
                    />
                </div>
            </div>
        </div>
    );
}

// 🎯 COMPONENTE MELHORADO com otimizações de performance
function DetalhesCondominioMelhorado({ condominio, expanded, setExpanded }) {
    // 🚀 MEMOIZAÇÃO de cálculos pesados
    const maxVagas = useMemo(() => getMaxVagas(condominio), [condominio]);
    
    const dataEntregaFormatada = useMemo(() => 
        formatarDataEntrega(condominio.DataEntrega), 
        [condominio.DataEntrega]
    );
    
    const descricaoProcessada = useMemo(() => 
        processarHtmlDescricao(condominio.DescricaoUnidades),
        [condominio.DescricaoUnidades]
    );

    // 🎯 HANDLER otimizado para toggle
    const handleToggleExpanded = useMemo(() => 
        () => setExpanded(prev => !prev),
        [setExpanded]
    );

    return (
        <div className={`mx-auto p-6 text-black font-sans ${expanded ? 'max-w-full' : 'max-w-lg'}`}>
            <h1 className="font-semibold">
                {condominio.Categoria} {condominio.Status}
            </h1>
            
            {/* 🏠 INFORMAÇÕES DO IMÓVEL */}
            <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                    <Home size={18} />
                    <span className="text-sm">A partir de {condominio.MetragemAnt} m²</span>
                </div>
                <div className="flex items-center gap-2">
                    <Bed size={18} />
                    <span className="text-sm">Imóveis com {condominio.DormitoriosAntigo} quartos</span>
                </div>
            </div>

            {/* 🏢 INFORMAÇÕES DO CONDOMÍNIO */}
            <h1 className="font-semibold mt-6">Condomínio</h1>
            <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                    <Car size={18} />
                    <span className="text-sm">
                        Garagens com até {maxVagas > 0 ? maxVagas : condominio.Vagas} vagas
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span className="text-sm">Data de entrega: {dataEntregaFormatada}</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <Building size={18} />
                    <span className="text-sm">Construtora: {condominio.Construtora}</span>
                </div>
            </div>

            {/* 📝 DESCRIÇÃO DAS UNIDADES */}
            {condominio.DescricaoUnidades ? (
                <div className="mt-6">
                    <button
                        className="flex items-center gap-2 mt-6 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
                        onClick={handleToggleExpanded}
                        type="button"
                        aria-label={expanded ? "Ver menos detalhes" : "Ver mais detalhes"}
                    >
                        <span className="text-xs font-bold uppercase">
                            {expanded ? "Ver menos" : "Ver mais"}
                        </span>
                    </button>
                    
                    {/* ✅ RENDERIZAÇÃO OTIMIZADA com HTML processado */}
                    <div className={`mt-4 text-gray-700 transition-all duration-300 ${expanded ? 'block' : 'line-clamp-3'}`}>
                        {expanded ? (
                            <div className="columns-1 md:columns-2 lg:columns-2 gap-8">
                                <div 
                                    className="text-sm leading-relaxed text-justify break-words prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
                                    dangerouslySetInnerHTML={{ 
                                        __html: descricaoProcessada
                                    }}
                                />
                            </div>
                        ) : (
                            <div 
                                className="text-sm line-clamp-3 prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
                                dangerouslySetInnerHTML={{ 
                                    __html: descricaoProcessada
                                }}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-gray-500 mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm">Não há descrição de unidades disponíveis para este condomínio.</h4>
                </div>
            )}
        </div>
    );
}

// 🚀 FUNÇÃO OTIMIZADA: Calcular máximo de vagas
function getMaxVagas(condominio) {
    const vagasProps = [
        "Vagas", "Vagas1", "Vagas2", "Vagas3", "Vagas4",
        "Vagas5", "Vagas6", "Vagas7", "Vagas8"
    ];

    return vagasProps.reduce((maxVagas, prop) => {
        if (condominio[prop]) {
            const vagasValue = parseInt(condominio[prop], 10);
            return (!isNaN(vagasValue) && vagasValue > maxVagas) ? vagasValue : maxVagas;
        }
        return maxVagas;
    }, 0);
}
