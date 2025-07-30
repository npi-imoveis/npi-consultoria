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

// 🎯 FUNÇÃO PARA ORDENAR FOTOS (igual à da página principal)
function processarFotosCondominio(fotos, codigoCondominio) {
  if (!Array.isArray(fotos) || fotos.length === 0) {
    return [];
  }

  try {
    console.log('📝 SOBRE-CONDOMÍNIO: Iniciando ordenação com photoSorter...', {
      totalFotos: fotos.length,
      codigo: codigoCondominio
    });
    
    // 🎯 FORÇAR photoSorter a usar SEMPRE Análise Inteligente
    const fotosTemp = fotos.map(foto => {
      // Remover campos ORDEM para forçar análise inteligente
      const { Ordem, ordem, ORDEM, ...fotoSemOrdem } = foto;
      return fotoSemOrdem;
    });
    
    // USAR photoSorter.ordenarFotos() - IGUAL AO RESTO DO SISTEMA
    const fotosOrdenadas = photoSorter.ordenarFotos(fotosTemp, codigoCondominio || 'sobre-condominio');
    
    console.log('✅ SOBRE-CONDOMÍNIO: Ordenação finalizada:', {
      totalFotos: fotosOrdenadas.length,
      primeira: fotosOrdenadas[0]?.Foto?.split('/').pop()?.substring(0, 30) + '...',
      metodo: 'photoSorter.ordenarFotos() - CONSISTENTE COM O SISTEMA'
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
            <h1 className="font-semibold">
                {condominio.Categoria} {condominio.Status}
            </h1>
            <div className="flex items-center gap-2 mt-2">
                <Home size={18} />
                <span className="text-sm">A partir de {condominio.MetragemAnt}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <Bed size={18} />
                <h2 className="text-sm">Imóveis com {condominio.DormitoriosAntigo} quartos</h2>
            </div>

            <h1 className="font-semibold mt-6">Condomínio</h1>
            <div className="flex items-center gap-2 mt-2">
                <Car size={18} />
                <span className="text-sm">
                    Garagens com até {maxVagas > 0 ? maxVagas : condominio.Vagas} vagas
                </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
                <Calendar size={18} />
                <span className="text-sm">Data de entrega: {formatterDate(condominio.DataEntrega)}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <Building size={18} />
                <h2 className="text-sm">Construtora: {condominio.Construtora}</h2>
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
                    
                    {/* 🎯 TEXTO COM LAYOUT MELHORADO quando expanded */}
                    <div className={`mt-4 text-gray-700 ${expanded ? 'block' : 'line-clamp-3'}`}>
                        {expanded ? (
                            <div className="columns-1 md:columns-2 lg:columns-2 gap-8">
                                <h4 className="text-xs leading-relaxed whitespace-pre-line text-justify break-words">
                                    {condominio.DescricaoUnidades}
                                </h4>
                            </div>
                        ) : (
                            <h4 className="text-xs whitespace-pre-line">
                                {condominio.DescricaoUnidades}
                            </h4>
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
