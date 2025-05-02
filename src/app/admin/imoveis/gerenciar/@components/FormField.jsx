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

  return (
    <div className={fullWidth ? "col-span-full" : ""}>
      <label htmlFor={elementId} className="block text-xs font-medium text-gray-700 mb-1">
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
          className={`border-2 px-4 py-2 text-zinc-700 w-full text-xs rounded-md focus:outline-none focus:ring-black focus:border-black ${
            isRequired && !isValid ? "border-red-300 bg-red-50" : ""
          }`}
        />
      ) : type === "select" ? (
        <select
          id={elementId}
          name={name}
          value={value || ""}
          onChange={onChange}
          className={`border-2 px-4 py-2 text-zinc-700 w-full text-xs rounded-md focus:outline-none focus:ring-black focus:border-black ${
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
          className={`border-2 px-4 py-2 text-zinc-700 w-full text-xs rounded-md focus:outline-none focus:ring-black focus:border-black ${
            isRequired && !isValid ? "border-red-300 bg-red-50" : ""
          }`}
          placeholder="R$ 0"
        />
      ) : (
        <input
          type={type}
          id={elementId}
          name={name}
          value={value || ""}
          onChange={onChange}
          className={`border-2 px-4 py-2 text-zinc-700 w-full text-xs rounded-md focus:outline-none focus:ring-black focus:border-black ${
            isRequired && !isValid ? "border-red-300 bg-red-50" : ""
          } ${className || ""}`}
          placeholder={placeholder || ""}
          disabled={disabled}
          readOnly={readOnly}
        />
      )}
      {isRequired && !isValid && <p className="text-xs text-red-500 mt-1">Campo obrigatório</p>}
    </div>
  );
};

export default memo(FormField);
