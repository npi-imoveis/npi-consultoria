"use client";

import { memo } from "react";

const FormRequiredIndicator = ({ isValid }) => {
  return (
    <span className={`text-[9px] ml-1 font-medium ${isValid ? "text-green-500" : "text-red-500"}`}>
      {isValid ? "(obrigatório)" : "preencher campo"}
    </span>
  );
};

export default memo(FormRequiredIndicator);
