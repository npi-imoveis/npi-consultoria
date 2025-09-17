import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel, { IImovel } from "@/app/models/Imovel";
import { Model } from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Obter parâmetros da URL
    const { searchParams } = request.nextUrl;
    const categoria = searchParams.get("categoria");
    const cidade = searchParams.get("cidade");
    // Capturar múltiplos bairros da URL
    const bairros = searchParams.getAll("bairros");
    const quartos = searchParams.get("quartos");
    const banheiros = searchParams.get("banheiros");
    const vagas = searchParams.get("vagas");

    // Construir o filtro base (sempre verificar latitude e longitude)
    const filtro = {
      Latitude: { $exists: true, $ne: null, $ne: "" },
      Longitude: { $exists: true, $ne: null, $ne: "" },
      Foto: { $exists: true, $ne: null, $ne: "" },
    };

    // Adicionar filtros adicionais se existirem
    if (categoria) filtro.Categoria = categoria;
    if (cidade) filtro.Cidade = cidade;

    // Adicionar filtro de bairros se tiver um ou mais bairros selecionados
    if (bairros && bairros.length > 0) {
      // Função para normalizar nomes de bairros (capitalizar corretamente)
      const normalizarBairro = (bairro) => {
        // Palavras que devem ficar em minúscula (preposições, artigos, etc)
        const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos'];

        return bairro
          .toLowerCase()
          .split(' ')
          .map((palavra, index) => {
            // Primeira palavra sempre maiúscula
            if (index === 0) {
              return palavra.charAt(0).toUpperCase() + palavra.slice(1);
            }
            // Preposições ficam em minúscula, exceto se for a primeira palavra
            if (preposicoes.includes(palavra)) {
              return palavra;
            }
            // Outras palavras ficam com primeira letra maiúscula
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
          })
          .join(' ')
          .trim();
      };

      // Processar bairros que podem vir separados por vírgula
      const bairrosProcessados = [];
      bairros.forEach(bairro => {
        if (bairro.includes(',')) {
          // Se tem vírgula, dividir
          bairro.split(',').forEach(b => bairrosProcessados.push(b.trim()));
        } else {
          bairrosProcessados.push(bairro.trim());
        }
      });

      // Criar array com variações para máxima compatibilidade
      const bairrosParaBusca = [];
      bairrosProcessados.forEach(bairro => {
        const original = bairro.trim();
        const normalizado = normalizarBairro(original);

        bairrosParaBusca.push(original);
        if (original !== normalizado) {
          bairrosParaBusca.push(normalizado);
        }

        // Adicionar também versão lowercase e uppercase para compatibilidade
        bairrosParaBusca.push(original.toLowerCase());
        bairrosParaBusca.push(original.toUpperCase());
      });

      // Remover duplicatas
      const bairrosUnicos = [...new Set(bairrosParaBusca)];

      // Usar $or para buscar em ambos os campos de bairro (como na API de filtro)
      filtro.$or = [
        { BairroComercial: { $in: bairrosUnicos } },
        { Bairro: { $in: bairrosUnicos } }
      ];
    }


    // Tratar filtros numéricos (quartos, banheiros, vagas)
    if (quartos) {
      if (quartos === "4+") {
        filtro.Quartos = { $gte: 4 };
      } else {
        filtro.Quartos = parseInt(quartos);
      }
    }

    if (banheiros) {
      if (banheiros === "4+") {
        filtro.Banheiros = { $gte: 4 };
      } else {
        filtro.Banheiros = parseInt(banheiros);
      }
    }

    if (vagas) {
      if (vagas === "4+") {
        filtro.Vagas = { $gte: 4 };
      } else {
        filtro.Vagas = parseInt(vagas);
      }
    }

    // Buscar imóveis com os filtros aplicados
    const imoveis = await Imovel.find(filtro).limit(200);

    return NextResponse.json({
      status: 200,
      count: imoveis.length,
      data: imoveis,
    });
  } catch (error) {
    console.error("Erro ao buscar imóveis para o mapa:", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
