import { useState } from "react";

export default function ServicosTab({ form, updateForm, updateNestedForm }) {
  const [uploadingImages, setUploadingImages] = useState({});

  // Função para upload de imagem específica para cada serviço
  const handleImageUpload = async (serviceKey, file) => {
    if (!file) return;

    try {
      setUploadingImages(prev => ({ ...prev, [serviceKey]: true }));

      const formData = new FormData();
      formData.append("file", file);
      // ADICIONAR identificadores apenas para serviços (retrocompatível)
      formData.append("section", "servicos");
      formData.append("subsection", serviceKey);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Falha no upload");
      }

      const data = await res.json();
      
      // Atualizar apenas a imagem do serviço específico
      updateNestedForm(serviceKey, "imagem", data.url);
      
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploadingImages(prev => ({ ...prev, [serviceKey]: false }));
    }
  };

  // VERIFICAÇÕES DEFENSIVAS: garantir que os dados existam
  const services = [
    {
      key: "atendimentoPersonalizado",
      label: "Atendimento Personalizado",
      data: form?.atendimentoPersonalizado || { titulo: "Atendimento Personalizado", descricao: "", imagem: "", link: "" }
    },
    {
      key: "avaliacaoImoveis", 
      label: "Avaliação de Imóveis",
      data: form?.avaliacaoImoveis || { titulo: "Avaliação de Imóveis", descricao: "", imagem: "", link: "" }
    },
    {
      key: "assessoriaJuridica",
      label: "Assessoria Jurídica", 
      data: form?.assessoriaJuridica || { titulo: "Assessoria Jurídica", descricao: "", imagem: "", link: "" }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Seção geral de serviços */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Nossa missão e serviços</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={form?.titulo || "Nossa Missão e Serviços"}
              onChange={(e) => updateForm("titulo", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nossa Missão e Serviços"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={form?.descricao || "Desde 2007, a NPI se dedica a oferecer um serviço imparcial e de excelência, ajudando nossos clientes a realizarem o sonho de adquirir um imóvel."}
              onChange={(e) => updateForm("descricao", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrição da missão da empresa..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link do vídeo do YouTube
            </label>
            <input
              type="url"
              value={form?.videoYoutube || ""}
              onChange={(e) => updateForm("videoYoutube", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>
      </div>

      {/* Serviços individuais */}
      <div className="grid gap-6">
        <h2 className="text-xl font-semibold">Serviços Específicos</h2>
        
        {services.map(({ key, label, data }) => (
          <div key={key} className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium mb-4">{label}</h3>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={data.titulo || ""}
                  onChange={(e) => updateNestedForm(key, "titulo", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={label}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={data.descricao || ""}
                  onChange={(e) => updateNestedForm(key, "descricao", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Descrição do serviço de ${label.toLowerCase()}...`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Serviço
                </label>
                
                {/* Preview da imagem atual */}
                {data.imagem && (
                  <div className="mb-3">
                    <img
                      src={data.imagem}
                      alt={label}
                      className="h-32 w-auto object-cover rounded-md border"
                    />
                  </div>
                )}

                {/* Input de upload */}
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleImageUpload(key, file);
                      }
                    }}
                    disabled={uploadingImages[key]}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  
                  {uploadingImages[key] && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                      Enviando...
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Formato recomendado: JPG, PNG. Tamanho máximo: 2MB
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link/URL do Serviço (opcional)
                </label>
                <input
                  type="url"
                  value={data.link || ""}
                  onChange={(e) => updateNestedForm(key, "link", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
