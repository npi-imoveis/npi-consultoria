import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";
import cache from "@/app/lib/cache";

export async function GET(request) {
  try {
    const url = new URL(request.url);

    const limit = parseInt(url.searchParams.get("limit") || "25", 10);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    const filtro = {};
    const allKeys = Array.from(url.searchParams.keys());

    allKeys.forEach((key) => {
      if (!["limit", "page"].includes(key)) {
        const values = url.searchParams.getAll(key);
        const normalizedKey = key.endsWith("[]") ? key.replace("[]", "") : key;

        if (values.length > 1) {
          filtro[normalizedKey] = { $in: values };
        } else if (values.length === 1 && values[0] !== "") {
          filtro[normalizedKey] = values[0];
        }
      }
    });

    if (filtro.bairros) {
      filtro.BairroComercial = filtro.bairros;
      delete filtro.bairros;
    }

    // ===============================
    // Lógica de faixa de valor ajustada
    // ===============================
    const matchStage = { ...filtro };

    const exprConditions = [];

    const cleanedValorAntigo = {
      $toDouble: {
        $replaceAll: {
          input: {
            $reduce: {
              input: { $split: ["$ValorAntigo", "."] },
              initialValue: "",
              in: { $concat: ["$$value", "$$this"] },
            },
          },
          find: ",",
          replacement: "",
        },
      },
    };

    if (matchStage.ValorMin) {
      const min = parseInt(matchStage.ValorMin.toString().replace(/\D/g, ""));
      exprConditions.push({ $gte: [cleanedValorAntigo, min] });
      delete matchStage.ValorMin;
    }

    if (matchStage.ValorMax) {
      const max = parseInt(matchStage.ValorMax.toString().replace(/\D/g, ""));
      exprConditions.push({ $lte: [cleanedValorAntigo, max] });
      delete matchStage.ValorMax;
    }

    if (exprConditions.length > 0) {
      matchStage.$expr = { $and: exprConditions };
    }

    // ===============================
    // Cache
    // ===============================
    const filterParams = Object.entries(filtro)
      .map(([key, value]) => {
        if (typeof value === "object" && value.$in) {
          return `${key}=${value.$in.join(",")}`;
        }
        return `${key}=${value}`;
      })
      .join("_");

    const cacheKey = `imoveis_page${page}_limit${limit}${filterParams ? "_" + filterParams : ""}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    await connectToDatabase();

    const imoveisAgregados = await Imovel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$Codigo",
          doc: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$doc" } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await Imovel.countDocuments(filtro);
    const totalPages = Math.ceil(total / limit);

    const result = {
      data: imoveisAgregados,
      paginacao: {
        totalItems: total,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
      status: 200,
    };

    cache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar imóveis:", error);
    return NextResponse.json({ error: "Erro ao buscar imóveis" }, { status: 500 });
  }
}
