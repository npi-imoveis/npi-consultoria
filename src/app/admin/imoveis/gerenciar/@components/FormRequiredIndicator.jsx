"use client";

import { memo } from 'react';

const FormRequiredIndicator = ({ isValid }) => {
  return (
    <span className={`text-xs ml-1 font-medium ${isValid ? 'text-green-500' : 'text-red-500'}`}>
      {isValid ? '✓' : '*'}
    </span>
  );
};

export default memo(FormRequiredIndicator); 