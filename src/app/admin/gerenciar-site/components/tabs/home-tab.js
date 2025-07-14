// admin/gerenciar-site/components/tabs/home-tab.js
"use client";

import { useState } from "react";
import LogosParceirosSection from "../sections/logos-parceiros-section";

export default function HomeTab({ form }) {
  const [activeSection, setActiveSection] = useState("logos-parceiros");
  const [formData, setFormData] = useState(form || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, type: null, message: null });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      showSaveStatus("info", "Salvando dados...");

      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        showSaveStatus("success", "Dados salvos com sucesso!");
      } else {
        showSaveStatus("error", data.error || "Erro ao salvar dados");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showSaveStatus("error", "Erro ao salvar dados");
    } finally {
      setIsSaving(false);
    }
  };

  const showSaveStatus = (type, message) => {
    setSaveStatus({ show: true, type, message });
    setTimeout(() => {
      setSaveStatus({ show: false, type: null, message: null });
    }, 5000);
  };

  const sections = [
    {
      key: "logos-parceiros",
      label: "Logos dos Parceiros",
      icon: "🤝",
      description: "Gerencie os logos das empresas parceiras que aparecem na home"
    },
    {
      key: "cards-destacados", 
      label: "Cards em Destaque",
      icon: "⭐",
      description: "Cards principais da seção ActionSection"
    },
    {
      key: "configuracoes-home",
      label: "Configurações Gerais",
      icon: "⚙️", 
      description: "Outras configurações da página inicial"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              🏠 Configurações da Home
            </h2>
            <p className="text-gray-600 mt-1">
              Gerencie o conteúdo e elementos da página inicial
            </p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors ${
              isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
            ) : (
              "Salvar Alterações"
            )}
          </button>
        </div>

        {/* Status message */}
        {saveStatus.show && (
          <div className={`mt-4 p-4 rounded-md ${
            saveStatus.type === "success" ? "bg-green-100 text-green-800" :
            saveStatus.type === "error" ? "bg-red-100 text-red-800" :
            "bg-blue-100 text-blue-800"
          }`}>
            {saveStatus.message}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === section.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Section Description */}
          <div className="mb-6">
            {sections.map((section) => 
              activeSection === section.key && (
                <div key={section.key} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    {section.icon} {section.description}
                  </p>
                </div>
              )
            )}
          </div>

          {/* Section Content */}
          {activeSection === "logos-parceiros" && (
            <LogosParceirosSection 
              form={formData} 
              onChange={handleChange}
            />
          )}

          {activeSection === "cards-destacados" && (
            <CardsDestacadosSection 
              form={formData} 
              onChange={handleChange}
            />
          )}

          {activeSection === "configuracoes-home" && (
            <ConfiguracoesHomeSection 
              form={formData} 
              onChange={handleChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para Cards em Destaque
function CardsDestacadosSection({ form, onChange }) {
  const cardsDestacados = form?.cards_destacados || [];

  const adicionarCard = () => {
    const novosCards = [...cardsDestacados, {
      id: Date.now(),
      titulo: "",
      descricao: "",
      icone: "",
      link: ""
    }];
    onChange("cards_destacados", novosCards);
  };

  const removerCard = (index) => {
    const novosCards = cardsDestacados.filter((_, i) => i !== index);
    onChange("cards_destacados", novosCards);
  };

  const atualizarCard = (index, campo, valor) => {
    const novosCards = [...cardsDestacados];
    novosCards[index] = { ...novosCards[index], [campo]: valor };
    onChange("cards_destacados", novosCards);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Cards em Destaque</h3>
        <button
          onClick={adicionarCard}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + Adicionar Card
        </button>
      </div>

      {cardsDestacados.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">Nenhum card criado ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cardsDestacados.map((card, index) => (
            <div key={card.id || index} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Card {index + 1}</h4>
                <button
                  onClick={() => removerCard(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  🗑️ Remover
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={card.titulo || ""}
                    onChange={(e) => atualizarCard(index, "titulo", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Ex: Apartamentos de Luxo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ícone (emoji ou classe)
                  </label>
                  <input
                    type="text"
                    value={card.icone || ""}
                    onChange={(e) => atualizarCard(index, "icone", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="🏠 ou fa-home"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={card.descricao || ""}
                  onChange={(e) => atualizarCard(index, "descricao", e.target.value)}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Descrição do card..."
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link (opcional)
                </label>
                <input
                  type="url"
                  value={card.link || ""}
                  onChange={(e) => atualizarCard(index, "link", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente para Configurações Gerais da Home
function ConfiguracoesHomeSection({ form, onChange }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configurações Gerais</h3>
      
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Description da Home
          </label>
          <textarea
            value={form?.meta_description || ""}
            onChange={(e) => onChange("meta_description", e.target.value)}
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="Descrição para SEO da página inicial..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Palavras-chave (SEO)
          </label>
          <input
            type="text"
            value={form?.keywords || ""}
            onChange={(e) => onChange("keywords", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="imobiliárias boutique, alto padrão, apartamentos de luxo..."
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">💡 Outras configurações</h4>
          <p className="text-yellow-700 text-sm">
            Configurações adicionais da home podem ser adicionadas aqui conforme necessário.
          </p>
        </div>
      </div>
    </div>
  );
}
