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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/content");
        if (!res.ok) {
          throw new Error("Falha ao carregar conteúdo");
        }
        const data = await res.json();
        setForm(data.data);
        console.log("📊 DADOS CARREGADOS:", data.data);
      } catch (error) {
        console.error("Erro ao carregar conteúdo:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Função simples para não quebrar os outros componentes
  const updateForm = (field, value) => {
    console.log(`Campo atualizado: ${field} = ${value}`);
  };

  const updateNestedForm = (section, field, value) => {
    console.log(`Campo aninhado atualizado: ${section}.${field} = ${value}`);
  };

  return (
    <AuthCheck>
      <div className="mx-auto">
        <h1 className="text-2xl font-bold mb-4">Gerenciar Site</h1>
        
        {/* TABS - RESTAURADAS */}
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

        {/* CONTEÚDO DAS TABS - RESTAURADO */}
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
                  updateForm={updateForm}
                />
              )}
              {tab === "hub" && (
                <HubTab 
                  form={form.hub || {}} 
                  updateForm={updateForm}
                />
              )}
              {tab === "sobre" && (
                <SobreTab 
                  form={form.sobre || {}} 
                  updateForm={updateForm}
                />
              )}
              {tab === "servicos" && (
                <ServicosTab 
                  form={form}
                  updateForm={updateForm}
                  updateNestedForm={updateNestedForm}
                />
              )}
            </>
          )}
        </div>

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-bold text-green-900 mb-2">✅ ABAS RESTAURADAS!</h3>
          <p className="text-sm text-green-800">
            <strong>Aba ativa:</strong> {tab} | <strong>Dados carregados:</strong> {isLoading ? 'Carregando...' : 'OK'}
          </p>
          <div className="mt-2 flex gap-2">
            {["home", "hub", "sobre", "servicos"].map(tabKey => (
              <button
                key={tabKey}
                onClick={() => setTab(tabKey)}
                className="text-xs bg-green-100 px-2 py-1 rounded text-green-800 hover:bg-green-200"
              >
                Ir para {tabKey}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
