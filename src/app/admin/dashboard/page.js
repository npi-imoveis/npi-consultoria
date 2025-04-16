"use client";

import { useEffect } from "react";
import AuthCheck from "../components/auth-check";
import Card from "../components/card";
export default function AdminDashboard() {
  const downloadSitemap = async () => {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const sitemapUrl = `${siteUrl}/sitemap.xml`;

      // Esperar o sitemap carregar
      const response = await fetch(sitemapUrl);

      if (!response.ok) {
        throw new Error('Falha ao carregar o sitemap');
      }

      const sitemapText = await response.text();

      // Criar um blob e fazer o download
      const blob = new Blob([sitemapText], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();

      // Limpar
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar o sitemap:', error);
      alert('Erro ao baixar o sitemap. Tente novamente mais tarde.');
    }
  };

  return (
    <AuthCheck>
      <div className="">
        <h1 className="text-2xl font-bold mb-4">Painel Administrativo</h1>

        <span className="text-gray-700 mb-4">
          Bem-vindo ao painel administrativo da NPI Imóveis. Utilize o menu lateral para navegar
          entre as diferentes seções.
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card
            title="Imóveis"
            value="3.475"
            description="Suitable to grow steadily."
            buttonText="Gerenciar"
            buttonHref="#"
          />
          <Card
            title="Condomínios"
            value="3.475"
            description="Suitable to grow steadily."
            buttonText="Gerenciar"
            buttonHref="#"
          />
          <Card
            title="Automação"
            value="3.475"
            description="Suitable to grow steadily."
            buttonText="Revisar"
            buttonHref="#"
          />
          <Card
            title="Automação"
            value="3.475"
            description="Suitable to grow steadily."
            buttonText="Revisar"
            buttonHref="#"
          />
        </div>

        <div className="mt-8">
          <button
            onClick={downloadSitemap}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Baixar Sitemap
          </button>
        </div>
      </div>
    </AuthCheck>
  );
}
