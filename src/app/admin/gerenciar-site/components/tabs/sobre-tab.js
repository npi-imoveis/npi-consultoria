// admin/gerenciar-site/components/tabs/sobre-tab.js
"use client";

import { useState, useEffect } from "react";
import Section from "../ui/section";
import { InputField, TextareaField, ImageUpload } from "../ui/form-fields";
import NossaHistoriaSection from "../sections/nossa-historia-section";
import Button from "../ui/button";
import ImageSection from "../sections/image-section";

export default function SobreTab({ form }) {
  const [formData, setFormData] = useState(form?.sobre_npi || {});
  const [loadingSection, setLoadingSection] = useState(null);
  const [sectionStatus, setSectionStatus] = useState({
    header: { show: false, type: null, message: null },
    sobre: { show: false, type: null, message: null },
    historia: { show: false, type: null, message: null },
    missao: { show: false, type: null, message: null },
  });

  useEffect(() => {
    if (form?.sobre_npi) {
      // Garantir que missao.itens seja sempre um array com 3 itens
      const itens = form.sobre_npi.missao?.itens || [];
      const formattedItens = Array(3)
        .fill(null)
        .map((_, index) => ({
          title: itens[index]?.title || "",
          description: itens[index]?.description || "",
        }));

      setFormData({
        ...form.sobre_npi,
        missao: {
          ...(form.sobre_npi.missao || {}),
          itens: formattedItens,
        },
      });
    }
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Tratamento especial para campos da missão
    if (name.startsWith("missao_item")) {
      const [_, field, indexStr] = name.match(/missao_item(\d+)_(title|description)/);
      const index = parseInt(indexStr) - 1;

      setFormData((prev) => ({
        ...prev,
        missao: {
          ...prev.missao,
          itens: prev.missao.itens.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
          ),
        },
      }));
    }
    // Tratamento para campos dentro de missao
    else if (name.startsWith("missao_")) {
      const field = name.replace("missao_", "");
      setFormData((prev) => ({
        ...prev,
        missao: {
          ...prev.missao,
          [field]: value,
        },
      }));
    }
    // Tratamento para campos dentro de header
    else if (name.startsWith("header_")) {
      const field = name.replace("header_", "");
      setFormData((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          [field]: value,
        },
      }));
    }
    // Campos diretos
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
      setFormData((prev) => ({
        ...prev,
        [name]: imageUrl,
      }));
    }
  };

  // Função para mostrar e ocultar mensagens de status
  const showStatusMessage = (section, type, message) => {
    setSectionStatus((prev) => ({
      ...prev,
      [section]: { show: true, type, message },
    }));

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
      setLoadingSection(section);

      const payload = {
        sobre_npi: {
          ...formData,
          ...data,
        },
      };

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
      <Section title="Header">
        <div className="space-y-4">
          <InputField
            label="Título"
            name="header_title"
            value={formData.header?.title || ""}
            onChange={handleChange}
            type="text"
          />
          <TextareaField
            label="Subtítulo"
            name="header_subtitle"
            value={formData.header?.subtitle || ""}
            onChange={handleChange}
          />
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <Button
            onClick={() =>
              updateContent("header", {
                header: {
                  title: formData.header?.title,
                  subtitle: formData.header?.subtitle,
                },
              })
            }
            disabled={loadingSection === "header"}
          >
            {loadingSection === "header" ? "Atualizando..." : "Atualizar Header"}
          </Button>
          <StatusMessage section="header" />
        </div>
      </Section>

      <Section title="Quem Somos">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <InputField
              label="Título"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              type="text"
            />
            <TextareaField
              label="Descrição"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1">
            <ImageSection directory="sobre_npi" filename="sobre" onChange={handleImageChange} />
          </div>
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <Button
            onClick={() =>
              updateContent("sobre", {
                title: formData.title,
                description: formData.description,
                image: formData.image,
              })
            }
            disabled={loadingSection === "sobre"}
          >
            {loadingSection === "sobre" ? "Atualizando..." : "Atualizar Quem Somos"}
          </Button>
          <StatusMessage section="sobre" />
        </div>
      </Section>

      <Section title="Nossa história">
        <NossaHistoriaSection form={formData} onChange={handleChange} />
        <div className="mt-4 flex flex-col space-y-2">
          <Button
            onClick={() =>
              updateContent("historia", {
                historia: formData.historia,
              })
            }
            disabled={loadingSection === "historia"}
          >
            {loadingSection === "historia" ? "Atualizando..." : "Atualizar História"}
          </Button>
          <StatusMessage section="historia" />
        </div>
      </Section>

      <Section title="Nossa missão e serviços">
        <div className="space-y-4">
          <InputField
            label="Título"
            name="missao_title"
            value={formData.missao?.title || ""}
            onChange={handleChange}
            type="text"
          />
          <TextareaField
            label="Descrição"
            name="missao_description"
            value={formData.missao?.description || ""}
            onChange={handleChange}
          />
          <InputField
            label="Link do vídeo do YouTube"
            name="missao_youtube"
            value={formData.missao?.youtube || ""}
            onChange={handleChange}
            type="text"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-6 space-y-4">
              <InputField
                label="Título"
                name={`missao_item${idx}_title`}
                value={formData.missao?.itens?.[idx - 1]?.title || ""}
                onChange={handleChange}
                type="text"
              />
              <TextareaField
                label="Descrição"
                name={`missao_item${idx}_description`}
                value={formData.missao?.itens?.[idx - 1]?.description || ""}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col space-y-2">
          <Button
            onClick={() =>
              updateContent("missao", {
                missao: {
                  title: formData.missao?.title,
                  description: formData.missao?.description,
                  youtube: formData.missao?.youtube,
                  itens: formData.missao?.itens,
                },
              })
            }
            disabled={loadingSection === "missao"}
          >
            {loadingSection === "missao" ? "Atualizando..." : "Atualizar Missão e Serviços"}
          </Button>
          <StatusMessage section="missao" />
        </div>
      </Section>
    </div>
  );
}
