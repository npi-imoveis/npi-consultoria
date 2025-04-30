"use client";

export default function TabButtons({ tabs, activeTab, setActiveTab, allowAdd = false, onAdd }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {tabs.map((tab, idx) => (
        <button
          key={idx}
          className={`px-4 py-2 rounded-t-md font-semibold border-b-2 transition-colors ${
            activeTab === idx
              ? "border-black text-black bg-gray-50"
              : "border-transparent text-gray-400 bg-gray-100"
          }`}
          onClick={() => setActiveTab(idx)}
        >
          {typeof tab === "string" ? tab : `${tab.label} ${idx + 1}`}
        </button>
      ))}

      {allowAdd && (
        <button
          className="px-4 py-2 rounded-t-md font-semibold border-b-2 border-transparent text-blue-500 bg-gray-100 hover:bg-blue-50 ml-2"
          onClick={onAdd}
        >
          + Adicionar
        </button>
      )}
    </div>
  );
}
