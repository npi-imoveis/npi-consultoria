"use client";

import { memo } from "react";
import FormRequiredIndicator from "./FormRequiredIndicator";

const FormField = ({
  field,
  value,
  displayValue,
  onChange,
  fullWidth = false,
  isRequired = false,
  isValid = true,
}) => {
  const { name, label, type, options, isMonetary, disabled, readOnly, className, placeholder, id } =
    field;

  const elementId = id || name;

  // Verificar se é um campo de área que deve aceitar apenas números inteiros
  const isAreaField = name === "AreaPrivativa" || name === "AreaTotal";

  // Handler especial para campos de área
  const handleAreaChange = (event) => {
    const { name, value } = event.target;

    // Permitir apenas números inteiros (sem vírgulas, pontos, ou outros caracteres)
    const apenasNumeros = value.replace(/[^\d]/g, "");

    // Limitar a 4 dígitos máximo (999m² + 1 dígito extra para flexibilidade)
    const numeroLimitado = apenasNumeros.slice(0, 4);

    // Criar evento sintético com o valor limpo
    const eventoLimpo = {
      target: {
        name,
        value: numeroLimitado,
      },
    };

    onChange(eventoLimpo);
  };

  return (
    <div className={fullWidth ? "col-span-full" : ""}>
      <label htmlFor={elementId} className="block text-[10px] font-bold text-zinc-600 mb-1">
        {label}
        {isRequired && <FormRequiredIndicator isValid={isValid} />}
      </label>

      {type === "textarea" ? (
        <textarea
          id={elementId}
          name={name}
          value={value || ""}
          onChange={onChange}
          rows={4}
          className={`border px-4 py-2 text-zinc-700 w-full text-[10px] rounded-md focus:outline-none focus:ring-black focus:border-black ${
            isRequired && !isValid ? "border-red-300 bg-red-50" : ""
          }`}
        />
      ) : type === "select" ? (
        <select
          id={elementId}
          name={name}
          value={value || ""}
          onChange={onChange}
          className={`border px-4 py-2 text-zinc-700 w-full text-[10px] rounded-md focus:outline-none focus:ring-black focus:border-black ${
            isRequired && !isValid ? "border-red-300 bg-red-50" : ""
          }`}
        >
          <option value="">Selecione uma opção</option>
          {options?.map((option) => (
            <option key={`${elementId}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : isMonetary ? (
        <input
          type="text"
          id={elementId}
          name={name}
          value={displayValue || ""}
          onChange={onChange}
          className={`border px-4 py-2 text-zinc-700 w-full text-[10px] rounded-md focus:outline-none focus:ring-black focus:border-black ${
            isRequired && !isValid ? "border-red-300 bg-red-50" : ""
          }`}
          placeholder="R$ 0"
        />
      ) : isAreaField ? (
        <input
          type="text"
          id={elementId}
          name={name}
          value={value || ""}
          onChange={handleAreaChange}
          className={`border px-4 py-2 text-zinc-700 w-full text-[10px] rounded-md focus:outline-none focus:ring-black focus:border-black ${
            isRequired && !isValid ? "border-red-300 bg-red-50" : ""
          } ${className || ""}`}
          placeholder={isAreaField ? "Ex: 120" : placeholder || ""}
          disabled={disabled}
          readOnly={readOnly}
        />
      ) : (
        <input
          type={type}
          id={elementId}
          name={name}
          value={value || ""}
          onChange={onChange}
          className={`border px-4 py-2 text-zinc-700 w-full text-[10px] rounded-md focus:outline-none focus:ring-black focus:border-black ${
            isRequired && !isValid ? "border-red-300 bg-red-50" : ""
          } ${className || ""}`}
          placeholder={placeholder || ""}
          disabled={disabled}
          readOnly={readOnly}
        />
      )}
      {isRequired && !isValid && <p className="text-[10px] text-red-500 mt-1">Campo obrigatório</p>}
    </div>
  );
};

export default memo(FormField);
