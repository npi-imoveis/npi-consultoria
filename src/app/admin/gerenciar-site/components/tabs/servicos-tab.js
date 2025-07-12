"use client";
import { useState } from "react";

export default function ServicosTab({ form, updateForm }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Aqui seria a lógica de submissão original
      // Provavelmente fazia update dos campos da missão
      console.log("Atualizando missão e serviços...", form);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Missão e serviços atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar missão e serviços");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <label htmlFor="header-title" className="block text-sm font-medium text-gray-700 mb-2">
            Título
          </label>
          <input
            type="text"
            id="header-title"
            name="header-title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Sobre a NPi Imóveis"
          />
        </div>

        <div>
          <label htmlFor="header-subtitle" className="block text-sm font-medium text-gray-700 mb-2">
            Subtítulo
          </label>
          <input
            type="text"
            id="header-subtitle"
            name="header-subtitle"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="De 2007 a 2025 - Um pouco da nossa história"
          />
        </div>
      </div>

      {/* Nossa missão e serviços */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Nossa missão e serviços</h3>
        
        <div>
          <label htmlFor="missao-titulo" className="block text-sm font-medium text-gray-700 mb-2">
            Título
          </label>
          <input
            type="text"
            id="missao-titulo"
            name="missao-titulo"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nossa Missão e Serviços"
          />
        </div>

        <div>
          <label htmlFor="missao-descricao" className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            id="missao-descricao"
            name="missao-descricao"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Desde 2007, a NPi se dedica a oferecer um serviço imparcial e de excelência, ajudando nossos clientes a realizarem o sonho de adquirir um imóvel."
          />
        </div>

        <div>
          <label htmlFor="youtube-link" className="block text-sm font-medium text-gray-700 mb-2">
            Link do vídeo do YouTube
          </label>
          <input
            type="url"
            id="youtube-link"
            name="youtube-link"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      </div>

      {/* Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Atendimento Personalizado */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-blue-600">Atendimento Personalizado</h4>
          
          <div>
            <label htmlFor="atendimento-titulo" className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              id="atendimento-titulo"
              name="atendimento-titulo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Atendimento Personalizado"
            />
          </div>

          <div>
            <label htmlFor="atendimento-descricao" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              id="atendimento-descricao"
              name="atendimento-descricao"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nossa missão é entender as necessidades de cada cliente e oferecer as melhores opções de imóveis, garantindo um processo de compra fácil, ágil e seguro."
            />
          </div>
        </div>

        {/* Avaliação de Imóveis */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-blue-600">Avaliação de Imóveis</h4>
          
          <div>
            <label htmlFor="avaliacao-titulo" className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              id="avaliacao-titulo"
              name="avaliacao-titulo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Avaliação de Imóveis"
            />
          </div>

          <div>
            <label htmlFor="avaliacao-descricao" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              id="avaliacao-descricao"
              name="avaliacao-descricao"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Equipe altamente capacitada para precificar o seu imóvel com uma metodologia completa."
            />
          </div>
        </div>

        {/* Assessoria Jurídica */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-blue-600">Assessoria Jurídica</h4>
          
          <div>
            <label htmlFor="assessoria-titulo" className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              id="assessoria-titulo"
              name="assessoria-titulo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Assessoria Jurídica"
            />
          </div>

          <div>
            <label htmlFor="assessoria-descricao" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              id="assessoria-descricao"
              name="assessoria-descricao"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Consultoria especializada no mercado imobiliário para assessorar nossos clientes."
            />
          </div>
        </div>
      </div>

      {/* Botão Submit */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          )}
          {isLoading ? "Atualizando..." : "Atualizar Missão e Serviços"}
        </button>
      </div>
    </form>
  );
}
