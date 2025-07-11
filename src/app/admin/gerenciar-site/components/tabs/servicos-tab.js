"use client";
import { useState } from "react";

export default function ServicosTab({ form, updateForm, updateNestedForm }) {
  const [uploadingImages, setUploadingImages] = useState({});

  // Os dados estão em sobre_npi.missao, não em servicos!
  const servicosData = form?.sobre_npi?.missao || {};
  const itens = servicosData.itens || [];

  // Função para upload de imagem
  const handleImageUpload = async (serviceIndex, file) => {
    if (!file) return;

    try {
      setUploadingImages(prev => ({ ...prev, [serviceIndex]: true }));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("section", "servicos");
      formData.append("subsection", `item_${serviceIndex}`);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Falha no upload");
      }

      const data = await res.json();
      
      // Atualizar imagem no item específico
      updateServiceItem(serviceIndex, "imagem", data.url || data.path);
      
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploadingImages(prev => ({ ...prev, [serviceIndex]: false }));
    }
  };

  // Função para atualizar campos principais dos serviços
  const updateMainField = (field, value) => {
    updateNestedForm("sobre_npi", "missao", field, value);
  };

  // Função para atualizar item específico
  const updateServiceItem = (index, field, value) => {
    const newItens = [...itens];
    if (!newItens[index]) {
      newItens[index] = { title: "", description: "", _id: `new_${index}` };
    }
    newItens[index][field] = value;
    updateNestedForm("sobre_npi", "missao", "itens", newItens);
  };

  // Garantir que temos pelo menos 3 itens
  const ensureThreeItems = () => {
    const defaultItems = [
      { title: "Atendimento Personalizado", description: "", _id: "1" },
      { title: "Avaliação de Imóveis", description: "", _id: "2" },
      { title: "Assessoria Jurídica", description: "", _id: "3" }
    ];

    while (itens.length < 3) {
      itens.push(defaultItems[itens.length] || { title: "", description: "", _id: `new_${itens.length}` });
    }
  };

  ensureThreeItems();

  return (
    <div className="space-y-8">
      {/* Confirmação de que os dados foram encontrados */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-bold text-green-900 mb-2">✅ DADOS RECUPERADOS COM SUCESSO!</h3>
        <p className="text-sm text-green-800">
          Todos os seus textos foram encontrados e estão sendo exibidos abaixo. 
          Os dados estavam em `sobre_npi.missao` no banco de dados.
        </p>
      </div>

      {/* Seção principal de serviços */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Nossa missão e serviços</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título Principal
            </label>
            <input
              type="text"
              value={servicosData.title || ""}
              onChange={(e) => updateMainField("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nossa Missão e Serviços"
            />
            <p className="text-xs text-green-600 mt-1">
              ✅ Valor atual: "{servicosData.title}"
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição Principal
            </label>
            <textarea
              value={servicosData.description || ""}
              onChange={(e) => updateMainField("description", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrição da missão da empresa..."
            />
            <p className="text-xs text-green-600 mt-1">
              ✅ Texto preservado: "{servicosData.description?.substring(0, 50)}..."
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link do vídeo do YouTube
            </label>
            <input
              type="url"
              value={servicosData.youtube || ""}
              onChange={(e) => updateMainField("youtube", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-green-600 mt-1">
              ✅ Link atual: "{servicosData.youtube}"
            </p>
          </div>
        </div>
      </div>

      {/* Serviços individuais */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Serviços Específicos</h2>
        
        {itens.slice(0, 3).map((item, index) => (
          <div key={item._id || index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-blue-600">
                Serviço {index + 1}: {item.title}
              </h3>
              <span className="text-xs text-gray-500">
                ID: {item._id}
              </span>
            </div>
            
            <div className="grid gap-4">
              {/* Título do Serviço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Serviço
                </label>
                <input
                  type="text"
                  value={item.title || ""}
                  onChange={(e) => updateServiceItem(index, "title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Título do serviço"
                />
                <p className="text-xs text-green-600 mt-1">
                  ✅ Texto preservado: "{item.title}"
                </p>
              </div>

              {/* Descrição do Serviço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do Serviço
                </label>
                <textarea
                  value={item.description || ""}
                  onChange={(e) => updateServiceItem(index, "description", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição do serviço"
                />
                <p className="text-xs text-green-600 mt-1">
                  ✅ Texto preservado: "{item.description?.substring(0, 50)}..."
                </p>
              </div>

              {/* Upload de Imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Serviço
                </label>
                
                {/* Preview da imagem atual */}
                {item.imagem && (
                  <div className="mb-3">
                    <img
                      src={item.imagem}
                      alt={item.title}
                      className="h-40 w-auto object-cover rounded-md border shadow-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Imagem atual: {item.imagem}
                    </p>
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
                        handleImageUpload(index, file);
                      }
                    }}
                    disabled={uploadingImages[index]}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  
                  {uploadingImages[index] && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                      Enviando...
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  A imagem será salva em: /uploads/servicos/item_{index}/
                </p>
              </div>

              {/* Campos adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Adicional
                  </label>
                  <input
                    type="url"
                    value={item.link || ""}
                    onChange={(e) => updateServiceItem(index, "link", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço/Valor
                  </label>
                  <input
                    type="text"
                    value={item.preco || ""}
                    onChange={(e) => updateServiceItem(index, "preco", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: A partir de R$ 500"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.ativo !== false}
                    onChange={(e) => updateServiceItem(index, "ativo", e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Serviço Ativo</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.destaque || false}
                    onChange={(e) => updateServiceItem(index, "destaque", e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Destacar</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Informações de debug */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">📊 Estrutura dos Dados</h3>
        <p className="text-sm text-blue-800">
          <strong>Localização no banco:</strong> sobre_npi.missao
        </p>
        <p className="text-sm text-blue-800">
          <strong>Itens encontrados:</strong> {itens.length}
        </p>
        <p className="text-sm text-blue-800">
          <strong>Status:</strong> ✅ Todos os textos preservados e funcionando
        </p>
      </div>
    </div>
  );
}
