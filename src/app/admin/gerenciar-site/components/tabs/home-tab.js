// admin/gerenciar-site/components/tabs/home-tab.js
"use client";

import { useState, useEffect } from "react";
import Section from "../ui/section";
import { InputField, TextareaField } from "../ui/form-fields";
import TestemunhosSection from "../sections/testemunhos-section";
import LogosParceirosSection from "../sections/logos-parceiros-section";
import ImageSection from "../sections/image-section";
import Button from "../ui/button";

export default function HomeTab({ form }) {
  const [formData, setFormData] = useState(form || {});
  const [cards, setCards] = useState(
    form?.cards_destacados || [
      { title: "", description: "" },
      { title: "", description: "" },
    ]
  );
  const [stats, setStats] = useState(
    form?.stats || { position: "", views: "", clicks: "", partners: "", properties: "" }
  );
  const [loadingSection, setLoadingSection] = useState(null);
  const [sectionStatus, setSectionStatus] = useState({
    sobre: { show: false, type: null, message: null },
    stats: { show: false, type: null, message: null },
    cards: { show: false, type: null, message: null },
    testemunhos: { show: false, type: null, message: null },
  });

  useEffect(() => {
    if (form) {
      setFormData(form);
      if (form.cards_destacados && form.cards_destacados.length > 0) {
        setCards(form.cards_destacados);
      }
      if (form.stats) {
        setStats(form.stats);
      }
    }
  }, [form]);

  // Array de campos de estatísticas
  const statsFields = [
    { label: "Posições 1 Página", key: "position" },
    { label: "Visualizações no Google", key: "views" },
    { label: "Cliques no site", key: "clicks" },
    { label: "Imobiliárias parceiras", key: "partners" },
    { label: "Imóveis cadastrados", key: "properties" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle card fields
    if (name.startsWith("card_destacado_title") || name.startsWith("card_destacado_description")) {
      let idx = 0;
      if (name.includes("2")) {
        idx = 1;
      } else if (name.includes("3")) {
        idx = 2;
      }

      setCards((prevCards) => {
        const updatedCards = [...prevCards];
        if (name.includes("title")) {
          updatedCards[idx] = { ...updatedCards[idx], title: value };
        } else if (name.includes("description")) {
          updatedCards[idx] = { ...updatedCards[idx], description: value };
        }
        return updatedCards;
      });
    }
    // Handle campos dentro da estrutura "sobre"
    else if (name.startsWith("sobre.")) {
      const field = name.split(".")[1];
      setFormData((prev) => {
        const newSobre = {
          ...prev.sobre,
          [field]: value,
        };

        // If this is an image update, trigger an immediate save
        if (field === "image_url") {
          updateContent("sobre", { sobre: { ...newSobre } });
        }

        return {
          ...prev,
          sobre: newSobre,
        };
      });
    }
    // Handle stats fields
    else if (name.startsWith("stats.")) {
      const fieldName = name.split(".")[1];
      setStats((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    }
    // Update formData for all other fields
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const { name, value, previewUrl } = e.target;
    // Usar previewUrl ou value, o que estiver disponível
    const imageUrl = previewUrl || value;

    if (imageUrl) {
      // Se for um campo de imagem para a seção "sobre", atualizar o formData
      if (name.startsWith("sobre.")) {
        const field = name.split(".")[1];
        setFormData((prev) => ({
          ...prev,
          sobre: {
            ...prev.sobre,
            [field]: imageUrl,
          },
        }));
      }
    }
  };

  // Função para mostrar e ocultar mensagens de status
  const showStatusMessage = (section, type, message) => {
    setSectionStatus((prev) => ({
      ...prev,
      [section]: { show: true, type, message },
    }));

    // Esconde a mensagem após 5 segundos
    setTimeout(() => {
      setSectionStatus((prev) => ({
        ...prev,
        [section]: { ...prev[section], show: false },
      }));
    }, 5000);
  };

  // Função genérica para atualizar o conteúdo
  const updateContent = async (section, data) => {
    try {
      // Ativa o estado de loading para esta seção
      setLoadingSection(section);

      const payload = {};

      switch (section) {
        case "sobre":
          payload.sobre = formData.sobre;
          break;
        case "stats":
          payload.stats = stats;
          break;
        case "cards":
          payload.cards_destacados = cards;
          break;
        default:
          payload[section] = data;
      }

      // Adiciona um tempo mínimo de loading de 2 segundos
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: "/" }),
      });

      if (response.ok) {
        showStatusMessage(
          section,
          "success",
          `${section.charAt(0).toUpperCase() + section.slice(1)} atualizado com sucesso`
        );
      } else {
        showStatusMessage(section, "error", `Erro ao atualizar ${section}`);
      }
    } catch (error) {
      console.error(`Erro ao atualizar ${section}:`, error);
      showStatusMessage(section, "error", `Erro ao atualizar ${section}`);
    } finally {
      // Desativa o estado de loading
      setLoadingSection(null);
    }
  };

  // Componente para renderizar mensagens de status
  const StatusMessage = ({ section }) => {
    const status = sectionStatus[section];
    if (!status.show) return null;

    return (
      <div
        className={`mt-4 p-3 rounded ${
          status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {status.message}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <Section title="Quem somos">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <InputField
              label="Título"
              name="sobre.titulo"
              value={formData.sobre?.titulo || ""}
              onChange={handleChange}
              type="text"
            />
            <InputField
              label="Subtítulo"
              name="sobre.subtitulo"
              value={formData.sobre?.subtitulo || ""}
              onChange={handleChange}
              type="text"
            />
            <TextareaField
              label="Descrição"
              name="sobre.descricao"
              value={formData.sobre?.descricao || ""}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1">
            <ImageSection directory="home" filename="about" onChange={handleImageChange} />
          </div>
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <Button onClick={() => updateContent("sobre")} disabled={loadingSection === "sobre"}>
            {loadingSection === "sobre" ? "Atualizando..." : "Atualizar Quem Somos"}
          </Button>
          <StatusMessage section="sobre" />
        </div>
      </Section>

      <Section title="Nossos Resultados em Números">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsFields.map(({ label, key }) => (
            <InputField
              key={key}
              label={label}
              name={`stats.${key}`}
              value={stats[key] || ""}
              onChange={handleChange}
              type="text"
            />
          ))}
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <Button onClick={() => updateContent("stats")} disabled={loadingSection === "stats"}>
            {loadingSection === "stats" ? "Atualizando..." : "Atualizar Resultados"}
          </Button>
          <StatusMessage section="stats" />
        </div>
      </Section>

      <Section title="Cards Destacados">
        <div className="flex flex-col md:flex-row gap-8">
          {cards.map((card, idx) => (
            <div key={idx} className="flex-1 bg-gray-50 rounded-lg p-6 space-y-4">
              <InputField
                label="Título"
                name={`card_destacado_title${idx > 0 ? idx + 1 : ""}`}
                value={card.title || ""}
                onChange={handleChange}
                type="text"
              />
              <InputField
                label="Descrição"
                name={`card_destacado_description${idx > 0 ? idx + 1 : ""}`}
                value={card.description || ""}
                onChange={handleChange}
                type="text"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <Button onClick={() => updateContent("cards")} disabled={loadingSection === "cards"}>
            {loadingSection === "cards" ? "Atualizando..." : "Atualizar Cards Destacados"}
          </Button>
          <StatusMessage section="cards" />
        </div>
      </Section>

      <Section title="Testemunhos">
        <TestemunhosSection form={formData} onChange={handleChange} />
      </Section>

      <Section title="Logos dos Parceiros">
        <LogosParceirosSection form={formData} onChange={handleChange} />
      </Section>
    </div>
  );
}
