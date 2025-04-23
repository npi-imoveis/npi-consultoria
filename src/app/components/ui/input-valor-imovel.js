import { useState } from "react";

export default function InputValorImovel({ label, valor }) {
  const [valorInput, setValorInput] = useState(valor);

  const handleChange = (e) => {
    setValorInput(e.target.value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={valor}
        onChange={handleChange}
        className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
      />
    </div>
  );
}
