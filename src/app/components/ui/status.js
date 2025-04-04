"use client";
import CountUp from "react-countup";
const stats = [
  { id: 1, name: "Parceiros satisfeitos", value: 99, suffix: "%" },
  { id: 2, name: "Em vendas", value: 32, suffix: "M" },
  { id: 3, name: "Imobiliárias", value: 125, suffix: "+" },
  { id: 4, name: "Crescimento", value: 240, suffix: "%" },
];

export function Status() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        {/* Título */}
        <h1>Resultados</h1>

        {/* Estatísticas */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat) => (
            <div key={stat.id} className="mx-auto flex flex-col items-center">
              <dd className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
                <CountUp start={0} end={stat.value} duration={3} />
                {stat.suffix}
              </dd>
              <dt className="mt-2 text-lg text-gray-700">{stat.name}</dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
