import { connectToDatabaseAutomacao } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import Imovel from "@/app/models/Imovel";
import Review from "@/app/models/Review";
import { NextResponse } from "next/server";
import NodeCache from "node-cache";

// Inicializa o cache com TTL de 5 minutos (300 segundos)
const dashboardCache = new NodeCache({ stdTTL: 300 });
const CACHE_KEY = "dashboard_data";

export async function GET(request) {
    try {
        // Verifica se os dados já estão em cache
        const cachedData = dashboardCache.get(CACHE_KEY);
        if (cachedData) {
            return NextResponse.json({
                status: 200,
                data: cachedData,
                source: "cache"
            });
        }

        // Se não estiver em cache, busca no banco de dados
        await connectToDatabaseAutomacao();

        const condominio = await Imovel.find();
        const condominios = await Imovel.find({ Condominio: "Sim" });
        const automacao = await Review.find()

        const corretores = await Corretores.find({})

        const totalImoveis = condominio.length;
        const totalCondominios = condominios.length;
        const totalAutomacao = automacao.length;
        const totalCorretores = corretores.length;

        // Prepara os dados
        const dashboardData = {
            totalImoveis,
            totalCondominios,
            totalAutomacao,
            totalCorretores
        };

        // Armazena os dados no cache
        dashboardCache.set(CACHE_KEY, dashboardData);

        return NextResponse.json({
            status: 200,
            data: dashboardData,
            source: "database"
        });
    } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        return NextResponse.json({ error: "Erro ao buscar dados do dashboard" }, { status: 500 });
    }
}