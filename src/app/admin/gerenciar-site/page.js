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
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/content");
        if (!res.ok) {
          throw new Error("Falha ao carregar conteúdo");
        }
        const response = await res.json();
        
        // PRESERVAR dados originais completamente
        const content = response.data || {};
        setOriginalData(content);
        setForm(content);
        
        console.log("🔒 DADOS ORIGINAIS PRESERVADOS:", content);
        console.log("🔍 ESTRUTURA SOBRE_NPI:", content.sobre_npi);
        console.log("🔍 ESTRUTURA MISSAO:", content.sobre_npi?.missao);
      } catch (error) {
        console.error("Erro ao carregar conteúdo:", error);
        alert("Erro ao carregar conteúdo. Recarregue a página.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Função ULTRA DEFENSIVA para atualizar apenas campos específicos
  const updateForm = (section, field, value) => {
    setForm(prev => {
      const newForm = { ...prev };
      
      if (!newForm[section]) {
        newForm[section] = {};
      }
      
      newForm[section][field] = value;
      
      console.log(`🔧 CAMPO ATUALIZADO: ${section}.${field} =`, value);
      return newForm;
    });
  };

  // Função ULTRA DEFENSIVA para campos aninhados
  const updateNestedForm = (section, subsection, field, value) => {
    setForm(prev => {
      const newForm = { ...prev };
      
      if (!newForm[section]) {
        newForm[section] = {};
      }
      
      if (!newForm[section][subsection]) {
        newForm[section][subsection] = {};
      }
      
      newForm[section][subsection][field] = value;
      
      console.log(`🔧 CAMPO ANINHADO ATUALIZADO: ${section}.${subsection}.${field} =`, value);
      return newForm;
    });
  };

  // Função para calcular apenas os campos que mudaram
  const getChangedFields = (original, current) => {
    const changes = {};
    
    const compareDeep = (orig, curr, path = '') => {
      if (typeof curr === 'object' && curr !== null && !Array.isArray(curr)) {
        Object.keys(curr).forEach(key => {
          const newPath = path ? `${path}.${key}` : key;
          const origValue = orig?.[key];
          const currValue = curr[key];
          
          if (typeof currValue === 'object' && currValue !== null && !Array.isArray(currValue)) {
            compareDeep(origValue, currValue, newPath);
          } else {
            if (JSON.stringify(origValue) !== JSON.stringify(currValue)) {
              const pathParts = newPath.split('.');
              let target = changes;
              for (let i = 0; i < pathParts.length - 1; i++) {
                if (!target[pathParts[i]]) target[pathParts[i]] = {};
                target = target[pathParts[i]];
              }
              target[pathParts[pathParts.length - 1]] = currValue;
            }
          }
        });
      }
    };
    
    compareDeep(original, current);
    return changes;
  };

  // Função ULTRA DEFENSIVA para salvar - envia apenas o que mudou
  const saveForm = async () => {
    try {
      setIsSaving(true);
      
      const changedFields = getChangedFields(originalData, form);
      
      if (Object.keys(changedFields).length === 0) {
        alert("Nenhuma alteração foi feita.");
        return;
      }
      
      console.log("🔧 ENVIANDO APENAS CAMPOS ALTERADOS:", changedFields);
      
      // Usar PATCH (método original) para maior compatibilidade
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changedFields),
      });

      if (!res.ok) {
        throw new Error("Falha ao salvar conteúdo");
      }

      const response = await res.json();
      
      if (response.status === 200) {
        alert("Conteúdo salvo com sucesso!");
        console.log("✅ CAMPOS SALVOS:", Object.keys(changedFields));
        
        // Atualizar backup com dados salvos
        setOriginalData(form);
      } else {
        throw new Error(response.message || "Erro ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar conteúdo:", error);
      alert("Erro ao salvar conteúdo. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // Função para restaurar dados originais
  const restoreOriginalData = () => {
    if (confirm("Tem certeza que deseja desfazer todas as alterações?")) {
      setForm(originalData);
      console.log("🔄 DADOS RESTAURADOS PARA ORIGINAL");
    }
  };

  return (
    <AuthCheck>
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Gerenciar Site</h1>
          <div className="flex gap-3">
            <button
              onClick={restoreOriginalData}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Desfazer Alterações
            </button>
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
                  form={form}
                  updateForm={(field, value) => updateForm("servicos", field, value)}
                  updateNestedForm={(section, subsection, field, value) => 
                    updateNestedForm(section, subsection, field, value)
                  }
                />
              )}
            </>
          )}
        </div>

        {/* Debug info detalhado */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-md text-xs">
            <h3 className="font-bold mb-2">🔧 Debug Info:</h3>
            <p><strong>Seções carregadas:</strong> {Object.keys(originalData).length}</p>
            <p><strong>Alterações pendentes:</strong> {Object.keys(getChangedFields(originalData, form)).length}</p>
            <p><strong>Sobre NPI carregado:</strong> {form.sobre_npi ? '✅' : '❌'}</p>
            <p><strong>Missão carregada:</strong> {form.sobre_npi?.missao ? '✅' : '❌'}</p>
            <p><strong>Itens da missão:</strong> {form.sobre_npi?.missao?.itens?.length || 0}</p>
          </div>
        )}
      </div>
    </AuthCheck>
  );
}
