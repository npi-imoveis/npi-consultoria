"use client";
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
      // Usar tanto o sistema novo quanto o original para máxima compatibilidade
      formData.append("section", "servicos");      // Sistema novo
      formData.append("subsection", serviceKey);   // Sistema novo
      formData.append("directory", "servicos");    // Sistema original
      formData.append("subdirectory", serviceKey); // Sistema original

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Falha no upload");
      }

      const data = await res.json();
      
      // Atualizar apenas a imagem do serviço específico
      // Usar 'url' ou 'path' para compatibilidade com diferentes versões da API
      updateNestedForm(serviceKey, "imagem", data.url || data.path);
      
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploadingImages(prev => ({ ...prev, [serviceKey]: false }));
    }
  };

  // Verificações defensivas para garantir que os dados existam
  const services = [
    {
      key: "atendimentoPersonalizado",
      label: "Atendimento Personalizado",
      data: form?.atendimentoPersonalizado || { 
        titulo: "Atendimento Personalizado", 
        descricao: "", 
        imagem: "", 
        link: "" 
      }
    },
    {
      key: "avaliacaoImoveis", 
      label: "Avaliação de Imóveis",
      data: form?.avaliacaoImoveis || { 
        titulo: "Avaliação de Imóveis", 
        descricao: "", 
        imagem: "", 
        link: "" 
      }
    },
    {
      key: "assessoriaJuridica",
      label: "Assessoria Jurídica", 
      data: form?.assessoriaJuridica || { 
        titulo: "Assessoria Jurídica", 
        descricao: "", 
        imagem: "", 
        link: "" 
      }
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
              Título Principal
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
              Descrição Principal
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
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Cole o link completo do vídeo do YouTube
            </p>
          </div>
        </div>
      </div>

      {/* Serviços individuais */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Serviços Específicos</h2>
        
        {services.map(({ key, label, data }) => (
          <div key={key} className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium mb-4 text-blue-600">{label}</h3>
            
            <div className="grid gap-4">
              {/* Título do Serviço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Serviço
                </label>
                <input
                  type="text"
                  value={data.titulo || ""}
                  onChange={(e) => updateNestedForm(key, "titulo", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={label}
                />
              </div>

              {/* Descrição do Serviço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do Serviço
                </label>
                <textarea
                  value={data.descricao || ""}
                  onChange={(e) => updateNestedForm(key, "descricao", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Descreva como funciona o serviço de ${label.toLowerCase()}...`}
                />
              </div>

              {/* Upload de Imagem */}
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
                      className="h-40 w-auto object-cover rounded-md border shadow-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Imagem atual</p>
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
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  
                  {uploadingImages[key] && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                      Enviando...
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Formato recomendado: JPG, PNG, WebP. Tamanho máximo: 2MB
                </p>
              </div>

              {/* Link adicional do serviço (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Adicional (opcional)
                </label>
                <input
                  type="url"
                  value={data.link || ""}
                  onChange={(e) => updateNestedForm(key, "link", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link para página específica do serviço, formulário de contato, etc.
                </p>
              </div>

              {/* Informações adicionais do serviço */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-700 mb-2">Informações Adicionais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço/Valor (opcional)
                    </label>
                    <input
                      type="text"
                      value={data.preco || ""}
                      onChange={(e) => updateNestedForm(key, "preco", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: A partir de R$ 500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tempo de Entrega (opcional)
                    </label>
                    <input
                      type="text"
                      value={data.prazo || ""}
                      onChange={(e) => updateNestedForm(key, "prazo", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 5 a 7 dias úteis"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Benefícios Principais (opcional)
                  </label>
                  <textarea
                    value={data.beneficios || ""}
                    onChange={(e) => updateNestedForm(key, "beneficios", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Liste os principais benefícios deste serviço..."
                  />
                </div>
              </div>

              {/* Status do serviço */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data.ativo !== false} // Por padrão, serviços são ativos
                    onChange={(e) => updateNestedForm(key, "ativo", e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Serviço Ativo (visível no site)
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data.destaque || false}
                    onChange={(e) => updateNestedForm(key, "destaque", e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Destacar este serviço
                  </span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Informações de ajuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Dicas de Preenchimento</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Título:</strong> Use nomes claros e objetivos para cada serviço</li>
          <li>• <strong>Descrição:</strong> Explique o que o serviço oferece e como funciona</li>
          <li>• <strong>Imagens:</strong> Use fotos de boa qualidade que representem o serviço</li>
          <li>• <strong>Benefícios:</strong> Liste as vantagens que o cliente terá</li>
          <li>• <strong>Link:</strong> Pode apontar para uma página específica ou formulário</li>
        </ul>
      </div>
    </div>
  );
}
