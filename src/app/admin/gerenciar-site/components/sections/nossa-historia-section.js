"use client";
import { useState, useEffect } from "react";
import { InputField } from "../ui/form-fields";
import TabButtons from "../ui/tab-buttons";
import ImageSection from "./image-section"; // ✅ Usar o existente

export default function NossaHistoriaSection({ form, onChange }) {
  const [historias, setHistorias] = useState([
    { ano: "", title: "", description: "" },
    { ano: "", title: "", description: "" },
    { ano: "", title: "", description: "" },
    { ano: "", title: "", description: "" },
  ]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (form?.historia) {
      // Garantir que temos sempre 4 itens no array
      const historiaData = form.historia || [];
      const formattedHistoria = Array(4)
        .fill(null)
        .map((_, index) => ({
          ano: historiaData[index]?.ano || "",
          title: historiaData[index]?.title || "",
          description: historiaData[index]?.description || "",
        }));
      setHistorias(formattedHistoria);
    }
  }, [form]);

  const handleChange = (idx, field, value) => {
    setHistorias((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });

    // Notifica o componente pai sobre a mudança
    if (onChange) {
      const updatedHistorias = historias.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      );
      const event = {
        target: {
          name: "historia",
          value: updatedHistorias,
        },
      };
      onChange(event);
    }
  };

  const handleImageChange = (e) => {
    const { name, value } = e.target;
    if (onChange) {
      onChange({
        target: {
          name,
          value,
        },
      });
    }
  };

  return (
    <div>
      <TabButtons
        tabs={historias.map((_, idx) => `História ${idx + 1}`)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <div className="flex flex-col md:flex-row gap-8 bg-gray-50 rounded-lg p-6">
        <div className="flex-1 space-y-4">
          <InputField
            label="Ano"
            placeholder="Digite o ano"
            type="text"
            value={historias[activeTab].ano || ""}
            onChange={(e) => handleChange(activeTab, "ano", e.target.value)}
          />
          
          <InputField
            label="Título"
            placeholder="Digite o título"
            type="text"
            value={historias[activeTab].title || ""}
            onChange={(e) => handleChange(activeTab, "title", e.target.value)}
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              placeholder="Digite a descrição"
              value={historias[activeTab].description || ""}
              onChange={(e) => handleChange(activeTab, "description", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            />
          </div>
        </div>
        
        <div className="flex-1">
          {/* ✅ USANDO ImageSection com filename único */}
          <ImageSection
            directory="historia"
            filename={`0${activeTab + 1}.jpg`} // ✅ 01.jpg, 02.jpg, 03.jpg, 04.jpg
            onChange={handleImageChange}
          />
        </div>
      </div>
    </div>
  );
}
