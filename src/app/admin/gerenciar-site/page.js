"use client";
import AuthCheck from "../components/auth-check";
import { useEffect, useState } from "react";
import HomeTab from "./components/tabs/home-tab";
import HubTab from "./components/tabs/hub-tab";
import SobreTab from "./components/tabs/sobre-tab";
import ServicosTab from "./components/tabs/servicos-tab";

export default function GerenciarSite() {
  const [tab, setTab] = useState("home");
  const [form, setForm] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/content");
        if (!res.ok) {
          throw new Error("Falha ao carregar conteúdo");
        }
        const data = await res.json();
        setForm(data.data || {});
      } catch (error) {
        console.error("Erro ao carregar conteúdo:", error);
        // Inicializar com estrutura padrão em caso de erro
        setForm({
          home: {},
          hub: {},
          sobre: {},
          servicos: {
            atendimentoPersonalizado: {
              titulo: "Atendimento Personalizado",
              descricao: "",
              imagem: ""
            },
            avaliacaoImoveis: {
              titulo: "Avaliação de Imóveis", 
              descricao: "",
              imagem: ""
            },
            assessoriaJuridica: {
              titulo: "Assessoria Jurídica",
              descricao: "",
              imagem: ""
            }
          }
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Função para atualizar campos específicos do formulário
  const updateForm = (section, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Função para atualizar campos aninhados (como serviços)
  const updateNestedForm = (section, subsection, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section]?.[subsection],
          [field]: value
        }
      }
    }));
  };

  // Função para salvar todas as alterações
  const saveForm = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: form }),
      });

      if (!res.ok) {
        throw new Error("Falha ao salvar conteúdo");
      }

      alert("Conteúdo salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar conteúdo:", error);
      alert("Erro ao salvar conteúdo. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthCheck>
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Gerenciar Site</h1>
          <button
            onClick={saveForm}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            )}
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {[
            { key: "home", label: "Home" },
            { key: "hub", label: "Conheça o Hub" },
            { key: "sobre", label: "Sobre a NPI" },
            { key: "servicos", label: "Nossos Serviços" },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`px-4 py-2 rounded-t-md font-semibold border-b-2 transition-colors ${
                tab === key
                  ? "border-black text-black bg-gray-50"
                  : "border-transparent text-gray-400 bg-gray-100"
              }`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {tab === "home" && (
                <HomeTab 
                  form={form.home || {}} 
                  updateForm={(field, value) => updateForm("home", field, value)}
                />
              )}
              {tab === "hub" && (
                <HubTab 
                  form={form.hub || {}} 
                  updateForm={(field, value) => updateForm("hub", field, value)}
                />
              )}
              {tab === "sobre" && (
                <SobreTab 
                  form={form.sobre || {}} 
                  updateForm={(field, value) => updateForm("sobre", field, value)}
                />
              )}
              {tab === "servicos" && (
                <ServicosTab 
                  form={form.servicos || {}} 
                  updateForm={(field, value) => updateForm("servicos", field, value)}
                  updateNestedForm={(subsection, field, value) => 
                    updateNestedForm("servicos", subsection, field, value)
                  }
                />
              )}
            </>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}
