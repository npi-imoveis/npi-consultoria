"use client";

import { memo } from "react";

const FormSection = ({ title, children, highlight = false }) => {
  return (
    <div
      className={`bg-white rounded-lg overflow-hidden p-5 ${
        highlight ? "border-2 border-[#8B6F48]" : ""
      }`}
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">{title}</h2>
      {children}
    </div>
  );
};

export default memo(FormSection);
