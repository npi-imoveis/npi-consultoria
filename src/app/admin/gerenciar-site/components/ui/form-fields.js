"use client";

import { useState, useEffect } from "react";

export function InputField({ label, name, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        name={name}
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
}

export function TextareaField({ label, name, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        name={name}
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
        {...props}
      />
    </div>
  );
}

export function ImageUpload({ label, onChange, value, name }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(value || null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("O arquivo é muito grande. Tamanho máximo: 2MB.");
      return;
    }

    setSelectedFile(file);
    setError(null);

    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    if (onChange) {
      onChange({
        target: {
          name,
          value: null,
          file,
          previewUrl: localPreviewUrl,
        },
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[120px]">
      <label className="block text-sm font-medium mb-2">{label}</label>

      {previewUrl && (
        <div className="mb-4 relative w-full max-w-[200px]">
          <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-md object-cover" />
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        className="mb-2"
        onChange={handleFileChange}
        name={name}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
      {!error && <span className="text-xs text-gray-500">(JPG, PNG, até 2MB)</span>}
    </div>
  );
}
