"use client";

import { memo } from 'react';

const FormSection = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden p-5">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default memo(FormSection); 