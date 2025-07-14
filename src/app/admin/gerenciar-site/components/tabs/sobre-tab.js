// admin/gerenciar-site/components/tabs/sobre-tab.js
"use client";

import { useState, useEffect } from "react";

export default function SobreTab({ form }) {
  const [formData, setFormData] = useState(form?.sobre || {});
  const [imagemSobre, setImagemSobre] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ show: false, type: null, message: null });

  useEffect(() => {
    // Carrega dados do formulário
    if (form?.sobre) {
      setFormData(form.sobre);
    }
    
    // Carrega imagem existente
    carregarImagemSobre();
  }, [form]);

  const carregarImagemSobre = async () => {
    try {
      setIsLoadingImage(true);
      console.log('🔍 SobreTab: Carregando imagem...');
      
      const response = await fetch('/api/admin/upload?directory=sobre');
      const data = await response.json();
      
      console.log('📡 SobreTab: Resposta da API:', data);
      
      if (data.success && data.images && data.images.length > 0) {
        setImagemSobre(data.images[0]); // Primeira imagem
        console.log('✅ SobreTab: Imagem carregada:', data.images[0]);
      } else {
        setImagemSobre(null);
        console.log('📝 SobreTab: Nenhuma imagem encontrada');
      }
    } catch (error) {
      console.error('❌ SobreTab: Erro ao carregar imagem:', error);
      setImagemSobre(null);
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      showStatus("info", "Salvando dados...");

      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          sobre: formData
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        showStatus("success", "Dados salvos com sucesso!");
      } else {
        showStatus("error", data.error || "Erro ao salvar dados");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showStatus("error", "Erro ao salvar dados");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      showStatus("error", "Tipo de arquivo não permitido. Use JPG, PNG ou WebP.");
      return;
    }

    if (file.size > maxSize) {
      showStatus("error", "Arquivo muito grande. Máximo 5MB.");
      return;
    }

    setIsUploadingImage(true);
    showStatus("info", "Enviando imagem...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", "sobre");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        showStatus("success", "Imagem enviada com sucesso!");
        await carregarImagemSobre(); // Recarrega a imagem
        e.target.value = ''; // Limpa o input
      } else {
        showStatus("error", data.error || "Erro ao enviar imagem");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      showStatus("error", "Erro ao enviar imagem");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!imagemSobre || !confirm("Tem certeza que deseja deletar esta imagem?")) return;

    try {
      const filename = imagemSobre.split('/').pop();
      const response = await fetch(
        `/api/admin/upload?directory=sobre&filename=${filename}`,
        { method: "DELETE" }
      );

      const data = await response.json();
      if (data.success) {
        showStatus("success", "Imagem deletada com sucesso!");
        setImagemSobre(null);
      } else {
        showStatus("error", data.error || "Erro ao deletar imagem");
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
      showStatus("error", "Erro ao deletar imagem");
    }
  };

  const showStatus = (type, message) => {
    setStatus({ show: true, type, message });
    setTimeout(() => {
      setStatus({ show: false, type: null, message: null });
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              ℹ️ Sobre a NPi
            </h2>
            <p className="text-gray-600 mt-1">
              Configure o conteúdo da seção "Quem Somos"
            </p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors ${
              isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
            ) : (
              "Salvar Alterações"
            )}
          </button>
        </div>

        {/* Status message */}
        {status.show && (
          <div className={`mt-4 p-4 rounded-md ${
            status.type === "success" ? "bg-green-100 text-green-800" :
            status.type === "error" ? "bg-red-100 text-red-800" :
            "bg-blue-100 text-blue-800"
          }`}>
            {status.message}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Formulário de Texto */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            📝 Conteúdo Textual
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título Principal
            </label>
            <input
              type="text"
              value={formData.titulo || ""}
              onChange={(e) => handleChange("titulo", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: A NPi Imóveis nasceu em 2007"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição Completa
            </label>
            <textarea
              value={formData.descricao || ""}
              onChange={(e) => handleChange("descricao", e.target.value)}
              rows="8"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Escreva sobre a história e missão da NPi Imóveis..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Este texto aparecerá na seção "Quem Somos" da home
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Missão (opcional)
            </label>
            <textarea
              value={formData.missao || ""}
              onChange={(e) => handleChange("missao", e.target.value)}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nossa missão é..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valores (opcional)
            </label>
            <textarea
              value={formData.valores || ""}
              onChange={(e) => handleChange("valores", e.target.value)}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nossos valores são..."
            />
          </div>
        </div>

        {/* Gestão de Imagem */}
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            🖼️ Imagem da Seção
          </h3>

          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem Principal
            </label>
            
            <div className="space-y-4">
              {/* Input de Upload */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  className="hidden"
                  id="imagemSobre"
                />
                <label
                  htmlFor="imagemSobre"
                  className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer transition-colors hover:bg-blue-700 ${
                    isUploadingImage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isUploadingImage ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      📤 {imagemSobre ? "Trocar Imagem" : "Enviar Imagem"}
                    </>
                  )}
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Formatos aceitos: JPG, PNG, WebP (máx. 5MB)
                </p>
              </div>

              {/* Preview da Imagem */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {isLoadingImage ? (
                  <div className="flex items-center justify-center h-48 bg-gray-100 rounded">
                    <div className="text-center">
                      <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-gray-500 mt-2">Carregando...</p>
                    </div>
                  </div>
                ) : imagemSobre ? (
                  <div className="relative group">
                    <img
                      src={imagemSobre}
                      alt="Imagem Sobre NPi"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        console.error('❌ Erro ao carregar preview:', imagemSobre);
                        e.target.style.display = 'none';
                      }}
                    />
                    
                    {/* Overlay com ações */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={handleDeleteImage}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        🗑️ Deletar
                      </button>
                    </div>

                    {/* Status indicator */}
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                      ✅ Ativa na Home
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-400">
                    <div className="text-center">
                      <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>Nenhuma imagem selecionada</p>
                      <p className="text-sm">A seção aparecerá sem imagem na home</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info sobre uso da imagem */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Como funciona:</strong> A imagem carregada aqui aparecerá automaticamente na seção "Quem Somos" da home. Se não houver imagem, será exibido um placeholder padrão.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded-lg text-sm">
          <strong>🔧 Debug SobreTab:</strong><br />
          Imagem carregada: {imagemSobre ? '✅ Sim' : '❌ Não'}<br />
          URL da imagem: {imagemSobre || 'Nenhuma'}<br />
          Loading: {isLoadingImage ? 'Sim' : 'Não'}
        </div>
      )}
    </div>
  );
}
