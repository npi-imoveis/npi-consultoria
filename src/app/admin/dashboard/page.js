"use client";

import { useState, useEffect } from "react";
import AuthCheck from "../components/auth-check";
import Card from "../components/card";
import { getDashboard } from "../services";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalImoveis: 0,
    totalCondominios: 0,
    totalAutomacao: 0,
    totalCorretores: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboard();
        if (response && response.data) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setError("Não foi possível carregar os dados do dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <AuthCheck>
      <div className="">
        <h1 className="text-2xl font-bold mb-4">Painel Administrativo</h1>

        <span className="text-gray-700 mb-4">
          Bem-vindo ao painel administrativo da NPI Imóveis. Utilize o menu lateral para navegar
          entre as diferentes seções.
        </span>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Card
              title="Imóveis"
              value={dashboardData.totalImoveis}
              description="Total de imóveis cadastrados"
              buttonText="Gerenciar"
              buttonHref="/admin/imoveis"
            />
            <Card
              title="Condomínios"
              value={dashboardData.totalCondominios}
              description="Total de condomínios"
              buttonText="Gerenciar"
              buttonHref="/admin/condominios"
            />
            <Card
              title="Automação"
              value={dashboardData.totalAutomacao}
              description="Imóveis em automação"
              buttonText="Revisar"
              buttonHref="/admin/automacao"
            />
            <Card
              title="Corretores"
              value={dashboardData.totalCorretores}
              description="Corretores ativos"
              buttonText="Revisar"
              buttonHref="/admin/corretores"
            />
          </div>
        )}
      </div>
    </AuthCheck>
  );
}
