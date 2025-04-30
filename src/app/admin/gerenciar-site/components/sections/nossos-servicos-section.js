"use client";

import { useState, useEffect } from "react";
import { InputField, TextareaField } from "../ui/form-fields";
import TabButtons from "../ui/tab-buttons";
import Button from "../ui/button";

export default function NossosServicosSection({ form }) {
  const [servicos, setServicos] = useState(Array(9).fill({ title: "", descricao: "" }));
  const [activeTab, setActiveTab] = useState(0);
  const [loadingSection, setLoadingSection] = useState(false);
  const [sectionStatus, setSectionStatus] = useState({
    show: false,
    type: null,
    message: null,
  });

  useEffect(() => {
    if (form?.servicos) {
      // Garantir que temos sempre 9 itens no array
      const servicosData = form.servicos || [];
      const formattedServicos = Array(9)
        .fill(null)
        .map((_, index) => ({
          title: servicosData[index]?.title || "",
          descricao: servicosData[index]?.descricao || "",
        }));

      setServicos(formattedServicos);
    }
  }, [form]);

  const handleChange = (idx, field, value) => {
    setServicos((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  // Função para mostrar e ocultar mensagens de status
  const showStatusMessage = (type, message) => {
    setSectionStatus({ show: true, type, message });

    setTimeout(() => {
      setSectionStatus((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleSubmit = async () => {
    try {
      setLoadingSection(true);

      // Adiciona um tempo mínimo de loading de 2 segundos
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          servicos: servicos.filter((servico) => servico.title || servico.descricao),
        }),
      });

      await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: "/" }),
      });

      if (response.ok) {
        showStatusMessage("success", "Serviços atualizados com sucesso!");
      } else {
        showStatusMessage("error", "Erro ao atualizar serviços");
      }
    } catch (error) {
      console.error("Erro ao atualizar serviços:", error);
      showStatusMessage("error", `Erro ao atualizar serviços: ${error.message}`);
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
        tabs={servicos.map((_, idx) => `Serviço ${idx + 1}`)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <InputField
          label="Título"
          type="text"
          value={servicos[activeTab].title || ""}
          onChange={(e) => handleChange(activeTab, "title", e.target.value)}
        />
        <TextareaField
          label="Descrição"
          value={servicos[activeTab].descricao || ""}
          onChange={(e) => handleChange(activeTab, "descricao", e.target.value)}
        />
      </div>

      <div className="mt-4 flex flex-col space-y-2">
        <Button onClick={handleSubmit} disabled={loadingSection}>
          {loadingSection ? "Atualizando..." : "Atualizar Serviços"}
        </Button>
        <StatusMessage />
      </div>
    </div>
  );
}
