"use client";

import { useState } from "react";
import { Home, Bed, Car, Calendar, Building } from "lucide-react";
import { formatterDate } from "@/app/utils/formatter-date";
import dynamic from 'next/dynamic';
import { photoSorter } from "@/app/utils/photoSorter"; // 🎯 CLASSE DE ORDENAÇÃO
import { ImageGallery } from "@/app/components/sections/image-gallery"; // 🎯 GALERIA UNIVERSAL

const DetalhesCondominioSobre = dynamic(() => import('./DetalhesCondominioSobre'), {
    loading: () => <div className="w-full h-64 bg-zinc-100 animate-pulse rounded-lg"></div>
});

// ✅ CORREÇÃO CIRÚRGICA: Função para limpar "undefined" da data
const formatarDataSegura = (dataEntrega) => {
    if (!dataEntrega) return 'Data não informada';
    
    // Se for string com "undefined", limpar antes de usar formatterDate
    if (typeof dataEntrega === 'string') {
        const dataLimpa = dataEntrega
            .replace(/undefined\/?/g, '') // Remove "undefined/" e "undefined"
            .replace(/\/+/g, '/') // Remove barras duplicadas como "//"
            .replace(/^\/|\/$/g, ''); // Remove barras no início e fim
        
        // Se ainda tem conteúdo válido, usar o formatterDate original
        if (dataLimpa && dataLimpa.length >= 8) {
            return formatterDate(dataLimpa) || dataLimpa;
        }
    }
    
    // Usar a função original como fallback
    return formatterDate(dataEntrega) || 'Data não informada';
};

// ✅ NOVA FUNÇÃO: Processar HTML e aplicar estilos às tags
const processarHtmlDescricao = (htmlString) => {
    if (!htmlString) return '';
    
    return htmlString
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
};

// 🎯 FUNÇÃO PARA ORDENAR FOTOS (igual à da página principal)
// ✅ FUNÇÃO CORRIGIDA: Igual ao ImageGallery
function processarFotosCondominio(fotos, codigoCondominio) {
  if (!Array.isArray(fotos) || fotos.length === 0) {
    return [];
  }

  try {
    console.log('📝 SOBRE-CONDOMÍNIO: Iniciando ordenação com photoSorter...', {
      totalFotos: fotos.length,
      codigo: codigoCondominio
    });
    
    // 🔥 SEMPRE LIMPAR CAMPOS ORDEM PARA FORÇAR ANÁLISE INTELIGENTE (igual ImageGallery)
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
}

export default function SobreCondominio({ condominio }) {
    // 🎯 PROCESSAR FOTOS COM A MESMA ORDENAÇÃO DO RESTO DO SISTEMA
    const fotosOrdenadas = processarFotosCondominio(condominio.Foto, condominio.Codigo);
    
    // Estado para controlar se o texto está expandido
    const [expanded, setExpanded] = useState(false);
    
    return (
        <div className="bg-white rounded-lg container mx-auto p-10 mt-4">
            <h2 className="text-xl font-bold text-black">
                Mais sobre {condominio.Categoria} {condominio.Empreendimento}
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

// 🎯 COMPONENTE MELHORADO - agora recebe o estado expanded como prop
function DetalhesCondominioMelhorado({ condominio, expanded, setExpanded }) {
    const maxVagas = getMaxVagas(condominio);

    return (
        <div className={`mx-auto p-6 text-black font-sans ${expanded ? 'max-w-full' : 'max-w-lg'}`}>
            
            {/* 🎯 LAYOUT ADAPTATIVO: 2 colunas quando expandido, 1 coluna quando collapsed */}
            <div className={`${expanded ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'space-y-4'}`}>
                
                {/* 🏠 SEÇÃO: APARTAMENTO VENDA */}
                <div>
                    <h2 className="font-semibold text-lg mb-3">
                        {condominio.Categoria} {condominio.BairroComercial} {condominio.Status}
                    </h2>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Home size={18} />
                            <span className="text-sm">A partir de {condominio.MetragemAnt} m²</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Bed size={18} />
                            <span className="text-sm">Imóveis com {condominio.DormitoriosAntigo} quartos</span>
                        </div>
                    </div>
                </div>

                {/* 🏢 SEÇÃO: CONDOMÍNIO */}
                <div>
                    <h2 className="font-semibold text-lg mb-3">Condomínio {condominio.Empreendimento}</h2>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Car size={18} />
                            <span className="text-sm">
                                Garagens com até {maxVagas > 0 ? maxVagas : condominio.Vagas} vagas
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={18} />
                            <span className="text-sm">Data de entrega: {
                                condominio.DataEntrega 
                                    ? String(condominio.DataEntrega).replace(/undefined\/?/g, '').replace(/\/+/g, '/').replace(/^\/|\/$/g, '') || 'Data não informada'
                                    : 'Data não informada'
                            }</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Building size={18} />
                            <span className="text-sm">Construtora: {condominio.Construtora}</span>
                        </div>
                    </div>
                </div>
                
            </div>

            {condominio.DescricaoUnidades ? (
                <div className="mt-6">
                    <button
                        className="flex items-center gap-2 mt-6 bg-black text-white px-4 py-2 rounded-full"
                        onClick={() => setExpanded(!expanded)}
                        type="button"
                    >
                        <span className="text-xs font-bold uppercase">{expanded ? "Ver menos" : "Ver mais"}</span>
                    </button>
                    
                    {/* ✅ CORREÇÃO: Usar dangerouslySetInnerHTML para renderizar HTML */}
                    <div className={`mt-4 text-gray-700 ${expanded ? 'block' : 'line-clamp-3'}`}>
                        {expanded ? (
                            <div className="columns-1 md:columns-2 lg:columns-2 gap-8">
                                <div 
                                    className="text-sm leading-relaxed text-justify break-words prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ 
                                        __html: processarHtmlDescricao(condominio.DescricaoUnidades) 
                                    }}
                                />
                            </div>
                        ) : (
                            <div 
                                className="text-sm line-clamp-3 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ 
                                    __html: processarHtmlDescricao(condominio.DescricaoUnidades) 
                                }}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-gray-700 mt-6">
                    <h4>Não há descrição de unidades disponíveis para este condomínio.</h4>
                </div>
            )}
        </div>
    );
}

// Função que retorna o maior número de vagas do condomínio
function getMaxVagas(condominio) {
    const vagasProps = [
        "Vagas",
        "Vagas1",
        "Vagas2",
        "Vagas3",
        "Vagas4",
        "Vagas5",
        "Vagas6",
        "Vagas7",
        "Vagas8",
    ];

    let maxVagas = 0;

    vagasProps.forEach((prop) => {
        if (condominio[prop]) {
            const vagasValue = parseInt(condominio[prop]);
            if (!isNaN(vagasValue) && vagasValue > maxVagas) {
                maxVagas = vagasValue;
            }
        }
    });

    return maxVagas;
}
