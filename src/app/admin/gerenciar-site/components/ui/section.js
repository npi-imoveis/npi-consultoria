"use client";

export default function Section({ title, children }) {
  return (
    <section className="mb-8 bg-white rounded-lg p-8">
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 my-4">{title}</h2>
      {children}
    </section>
  );
}
