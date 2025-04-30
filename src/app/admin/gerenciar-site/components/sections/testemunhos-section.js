"use client";

import { useState, useEffect } from "react";
import { InputField, TextareaField } from "../ui/form-fields";
import TabButtons from "../ui/tab-buttons";
import Button from "../ui/button";

export default function TestemunhosSection({ form, onChange }) {
  const [testemunhos, setTestemunhos] = useState([{ descricao: "", nome: "", cargo: "" }]);
  const [activeTab, setActiveTab] = useState(0);
  const [loadingSection, setLoadingSection] = useState(false);
  const [sectionStatus, setSectionStatus] = useState({
    show: false,
    type: null,
    message: null,
  });

  useEffect(() => {
    if (form && form.testemunhos) {
      try {
        const testemunhosData = form.testemunhos;

        if (Array.isArray(testemunhosData) && testemunhosData.length > 0) {
          const formattedTestemunhos = testemunhosData.map((item) => ({
            descricao: item.content || "",
            nome: item.name || "",
            cargo: item.role || "",
          }));

          setTestemunhos(formattedTestemunhos);
        }
      } catch (error) {
        console.error("Error processing testemunhos data:", error);
      }
    }
  }, [form]);

  const handleChange = (idx, field, value) => {
    setTestemunhos((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const addTestemunho = () => {
    setTestemunhos((prev) => [...prev, { descricao: "", nome: "", cargo: "" }]);
    setActiveTab(testemunhos.length);
  };

  // Função para mostrar e ocultar mensagens de status
  const showStatusMessage = (type, message) => {
    setSectionStatus({ show: true, type, message });

    // Esconde a mensagem após 5 segundos
    setTimeout(() => {
      setSectionStatus((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleSubmitTestemunhos = async (e) => {
    e.preventDefault();
    setLoadingSection(true);

    try {
      // Formatação dos testemunhos para o formato do modelo Content
      const formattedTestemunhos = testemunhos.map((item, index) => ({
        id: index + 1,
        content: item.descricao || "",
        name: item.nome || "",
        role: item.cargo || "",
      }));

      // Adiciona um tempo mínimo de loading de 2 segundos
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ testemunhos: formattedTestemunhos }),
      });

      await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: "/" }),
      });

      if (response.ok) {
        showStatusMessage("success", "Testemunhos atualizados com sucesso!");
      } else {
        showStatusMessage("error", "Erro ao atualizar testemunhos");
      }
    } catch (error) {
      console.error("Erro ao atualizar testemunhos:", error);
      showStatusMessage("error", `Erro ao atualizar testemunhos: ${error.message}`);
    } finally {
      setLoadingSection(false);
    }
  };

  // Componente para renderizar mensagens de status
  const StatusMessage = () => {
    if (!sectionStatus.show) return null;

    return (
      <div
        className={`mt-4 p-3 rounded ${
          sectionStatus.type === "success"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {sectionStatus.message}
      </div>
    );
  };

  return (
    <div>
      <TabButtons
        tabs={testemunhos.map((_, idx) => `Testemunho ${idx + 1}`)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        allowAdd={true}
        onAdd={addTestemunho}
      />

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <TextareaField
          label="Descrição"
          placeholder="Digite o testemunho"
          value={testemunhos[activeTab]?.descricao || ""}
          onChange={(e) => handleChange(activeTab, "descricao", e.target.value)}
        />
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <InputField
              label="Nome"
              placeholder="Nome do autor"
              type="text"
              value={testemunhos[activeTab]?.nome || ""}
              onChange={(e) => handleChange(activeTab, "nome", e.target.value)}
            />
          </div>
          <div className="flex-1">
            <InputField
              label="Cargo"
              placeholder="Cargo do autor"
              type="text"
              value={testemunhos[activeTab]?.cargo || ""}
              onChange={(e) => handleChange(activeTab, "cargo", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col space-y-2">
        <Button onClick={handleSubmitTestemunhos} disabled={loadingSection}>
          {loadingSection ? "Atualizando..." : "Atualizar Testemunhos"}
        </Button>
        <StatusMessage />
      </div>
    </div>
  );
}
