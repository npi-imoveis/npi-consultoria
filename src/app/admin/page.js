"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function AdminIndex() {
  // Redirecionar para a página de login
  useEffect(() => {
    redirect("/admin/login");
  }, []);

  return null;
}
