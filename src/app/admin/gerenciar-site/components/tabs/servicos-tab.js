"use client";
import { useState, useEffect } from "react";
import Section from "../ui/section";
import { InputField, TextareaField } from "../ui/form-fields";
import Button from "../ui/button";
import ImageSection from "../sections/image-section";

export default function ServicosTab({ form }) {
  const [formData, setFormData] = useState({
    header: { title: "", subtitle: "" },
    missao: { titulo: "", descricao: "", youtube_link: "" },
    servicos: [
      { title: "", descricao: "", image_url: "" }, // Atendimento Personalizado
      { title: "", descricao: "", image_url: "" }, // Avaliação de Imóveis
      { title: "", descricao: "", image_url: "" }, // Assessoria Jurídica
    ],
  });
  const [loadingSection, setLoadingSection] = useState(null);
  const [sectionStatus, setSectionStatus] = useState({
    header: { show: false, type: null, message: null },
    missao: { show: false, type: null, message: null },
    servicos: { show: false, type: null, message: null },
  });

  useEffect(() => {
    console.log("Dados recebidos do form:", form); // Debug
    if (form) {
      setFormData({
        header: form.servicos_page?.header || { title: "", subtitle: "" },
        missao: form.servicos_page?.missao || { titulo: "", descricao: "", youtube_link: "" },
        servicos: form.servicos?.length >= 3
          ? form.servicos.slice(0, 3)
          : [
              { title: "", descricao: "", image_url: "" },
              { title: "", descricao: "", image_url: "" },
              { title: "", descricao: "", image_url: "" },
            ],
      });
    }
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [section, index, field] = name.split(".");

    if (section === "servicos" && index !== undefined) {
      setFormData((prev) => {
        const newServicos = [...prev.servicos];
        newServicos[parseInt(index)] = {
          ...newServicos[parseInt(index)],
          [field]: value,
        };
        return { ...prev, servicos: newServicos };
      });
    } else {
      const keys = name.split(".");
      setFormData((prev) => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        console.log("Estado atualizado:", newData); // Debug
        return newData;
      });
    }
  };

  const handleImageChange = (e) => {
    const { name, value } = e.target;
    const [section, index, field] = name.split(".");

    if (section === "servicos" && index !== undefined) {
      setFormData((prev) => {
        const newServicos = [...prev.servicos];
        newServicos[parseInt(index)] = {
          ...newServicos[parseInt(index)],
          [field]: value,
        };
        console.log("Imagem atualizada:", { ...prev, servicos: newServicos }); // Debug
        return { ...prev, servicos: newServicos };
      });
    }
  };

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

  const updateContent = async (section) => {
    try {
      setLoadingSection(section);
      const payload = {
        servicos_page: {
          header: formData.header,
          missao: formData.missao,
          servicos: {
            atendimento: formData.servicos[0] || {},
            avaliacao: formData.servicos[1] || {},
            assessoria: formData.servicos[2] || {},
          },
        },
        servicos: formData.servicos, // Mantém compatibilidade com o array
      };

      console.log("Enviando para API:", payload); // Debug
      const response = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/servicos" }),
      });

      if (response.ok) {
        showStatusMessage(section, "success", "Atualizado com sucesso!");
      } else {
        const errorData = await response.json();
        console.error("Erro na API:", errorData); // Debug
        showStatusMessage(section, "error", "Erro ao atualizar");
      }
    } catch (error) {
      console.error(`Erro ao atualizar ${section}:`, error);
      showStatusMessage(section, "error", "Erro ao atualizar");
    } finally {
      setLoadingSection(null);
    }
  };

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
            name="header.title"
            value={formData.header?.title || ""}
            onChange={handleChange}
            placeholder="Sobre a NPi Imóveis"
          />
          <InputField
            label="Subtítulo"
            name="header.subtitle"
            value={formData.header?.subtitle || ""}
            onChange={handleChange}
            placeholder="De 2007 a 2025 - Um pouco da nossa história"
          />
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <Button onClick={() => updateContent("header")} disabled={loadingSection === "header"}>
            {loadingSection === "header" ? "Atualizando..." : "Atualizar Header"}
          </Button>
          <StatusMessage section="header" />
        </div>
      </Section>

      <Section title="Nossa missão e serviços">
        <div className="space-y-4">
          <InputField
            label="Título"
            name="missao.titulo"
            value={formData.missao?.titulo || ""}
            onChange={handleChange}
            placeholder="Nossa Missão e Serviços"
          />
          <TextareaField
            label="Descrição"
            name="missao.descricao"
            value={formData.missao?.descricao || ""}
            onChange={handleChange}
            rows={4}
            placeholder="Desde 2007, a NPi se dedica a oferecer um serviço imparcial e de excelência..."
          />
          <InputField
            label="Link do vídeo do YouTube"
            name="missao.youtube_link"
            value={formData.missao?.youtube_link || ""}
            onChange={handleChange}
            type="url"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <Button onClick={() => updateContent("missao")} disabled={loadingSection === "missao"}>
            {loadingSection === "missao" ? "Atualizando..." : "Atualizar Missão"}
          </Button>
          <StatusMessage section="missao" />
        </div>
      </Section>

      <Section title="Serviços">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Atendimento Personalizado", subsection: "atendimentoPersonalizado", index: 0 },
            { name: "Avaliação de Imóveis", subsection: "avaliacaoImoveis", index: 1 },
            { name: "Assessoria Jurídica", subsection: "assessoriaJuridica", index: 2 },
          ].map(({ name, subsection, index }) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h4 className="text-md font-semibold text-blue-600">{name}</h4>
              <InputField
                label="Título"
                name={`servicos.${index}.title`}
                value={formData.servicos[index]?.title || ""}
                onChange={handleChange}
                placeholder={name}
              />
              <TextareaField
                label="Descrição"
                name={`servicos.${index}.descricao`}
                value={formData.servicos[index]?.descricao || ""}
                onChange={handleChange}
                rows={4}
                placeholder={`Descrição para ${name.toLowerCase()}...`}
              />
              <ImageSection
                directory="servicos"
                filename={subsection}
                section="servicos"
                subsection={subsection}
                onChange={handleImageChange}
                currentImageUrl={formData.servicos[index]?.image_url || ""}
                sectionKey={`servicos.${index}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <Button onClick={() => updateContent("servicos")} disabled={loadingSection === "servicos"}>
            {loadingSection === "servicos" ? "Atualizando..." : "Atualizar Serviços"}
          </Button>
          <StatusMessage section="servicos" />
        </div>
      </Section>
    </div>
  );
}
