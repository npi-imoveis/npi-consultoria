"use client";

import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import AuthCheck from "../components/auth-check";

export default function GerenciarSite() {
  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Em construção</h1>
      </div>
    </AuthCheck>
  );
}
