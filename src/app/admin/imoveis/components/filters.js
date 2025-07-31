import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MultiSelectSituacao = ({ value = [], onChange, options = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Opções padrão se não fornecidas
  const defaultOptions = [
    "PRÉ-LANÇAMENTO",
    "LANÇAMENTO", 
    "CONSTRUÇÃO",
    "PRONTO",
    "ENTREGUE"
  ];

  const availableOptions = options.length > 0 ? options : defaultOptions;

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle seleção de item
  const toggleOption = (option) => {
    const newValue = value.includes(option)
      ? value.filter(item => item !== option)
      : [...value, option];
    
    onChange(newValue);
  };

  // Remover item específico
  const removeOption = (optionToRemove) => {
    const newValue = value.filter(item => item !== optionToRemove);
    onChange(newValue);
  };

  // Limpar todas as seleções
  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Campo de Input */}
      <div 
        className="min-h-[40px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer bg-white hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center gap-1 flex-wrap min-h-[24px]">
            {value.length === 0 ? (
              <span className="text-gray-400 text-sm">Selecione situações...</span>
            ) : (
              value.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                >
                  {item}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(item);
                    }}
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {value.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Limpar
              </button>
            )}
            <ChevronDownIcon 
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="py-1">
            {availableOptions.map((option) => {
              const isSelected = value.includes(option);
              return (
                <div
                  key={option}
                  className={`px-3 py-2 cursor-pointer text-sm transition-colors duration-150 ${
                    isSelected 
                      ? 'bg-blue-50 text-blue-900' 
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleOption(option)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Controlado pelo onClick do div
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                    />
                    <span className={isSelected ? 'font-medium' : 'font-normal'}>
                      {option}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {availableOptions.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Nenhuma opção disponível
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectSituacao;
