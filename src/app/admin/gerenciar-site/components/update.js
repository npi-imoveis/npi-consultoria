"use client";

import { useState, useEffect } from "react";

export default function UpdateContent() {
    const [form, setForm] = useState({
        "sobre_titulo": "",
        "sobre_subtitulo": "",
        "sobre_descricao": "",
        "sobre_page_title": "",
        "sobre_page_descricao": "",
        "sobre_page_title2": "",
        "sobre_page_descricao2": ""
    });

    const [loading, setLoading] = useState(true);

    // Carrega os valores atuais
    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/api/admin/content/get/");
            const data = await res.json();
            setForm(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    console.log('Dados Site', form);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("/api/admin/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const data = await res.json();
        alert(data.success ? "Atualizado!" : "Erro!");
    };

    if (loading) return <p>Carregando dados...</p>;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input name="sobre.titulo" value={form["sobre_titulo"]} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="sobre.subtitulo" value={form["sobre_subtitulo"]} onChange={handleChange} />
            <textarea name="sobre.descricao" value={form["sobre_descricao"]} onChange={handleChange} />
            <textarea name="sobre.texto" value={form["sobre.texto"]} onChange={handleChange} />
            <button type="submit">Salvar</button>
        </form>
    );
}