"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

import { atualizarProprietario, getProprietarioById } from "@/app/admin/services";
import { ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import AuthCheck from "@/app/admin/components/auth-check";

export default function EditarProprietario({ params }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const id = unwrappedParams.id;

    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Carregar dados do proprietário
    useEffect(() => {
        const fetchProprietario = async () => {
            setIsLoading(true);
            try {
                const result = await getProprietarioById(id);
                if (result.success && result.data) {
                    console.log("Dados do proprietário recebidos:", result.data);
                    setFormData(result.data);
                } else {
                    setError(result.error || "Proprietário não encontrado");
                    setTimeout(() => {
                        router.push("/admin/proprietarios");
                    }, 2000);
                }
            } catch (error) {
                console.error("Erro ao carregar proprietário:", error);
                setError("Erro ao carregar dados do proprietário");
                setTimeout(() => {
                    router.push("/admin/proprietarios");
                }, 2000);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchProprietario();
        }
    }, [id, router]);

    // Função para lidar com mudanças nos campos
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Função para salvar as alterações
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            const result = await atualizarProprietario(id, formData);
            if (result && result.success) {
                setSuccess("Proprietário atualizado com sucesso!");
                setTimeout(() => {
                    router.push("/admin/proprietarios");
                }, 2000);
            } else {
                setError(result?.message || "Erro ao atualizar proprietário");
            }
        } catch (error) {
            console.error("Erro ao atualizar proprietário:", error);
            setError("Ocorreu um erro ao salvar as alterações");
        } finally {
            setIsSaving(false);
        }
    };

    // Campos do formulário organizados por seções
    const fieldSections = [
        {
            title: "Dados do Proprietário",
            fields: [
                { name: "nome", label: "Nome", type: "text" },
                { name: "codigoC", label: "Código", type: "text" },
                { name: "status", label: "Status", type: "text" },
                { name: "fonePrincipal", label: "Telefone Principal", type: "text" },
                { name: "foneAntigo", label: "Telefone Antigo", type: "text" },
                { name: "emailR", label: "E-mail", type: "email" },
                { name: "veiculoCaptacao", label: "Veículo de Captação", type: "text" },
                { name: "produto", label: "Produto", type: "text" },
            ],
        }
    ];

    return (
        <AuthCheck>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-bold text-gray-900">
                            {isLoading ? "Carregando..." : "Editar Proprietário"}
                        </h1>
                        <button
                            type="button"
                            onClick={() => router.push("/admin/proprietarios")}
                            className="inline-flex items-center px-4 py-2 text-sm rounded-md text-gray-700 hover:text-black/50"
                        >
                            <ArrowLeftIcon className="w-5 h-5 mr-2" />
                            Voltar
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                            <p className="text-sm text-green-700">{success}</p>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {fieldSections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="bg-white rounded-lg p-6 mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                        {section.title}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {section.fields.map((field) => (
                                            <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                                                <label
                                                    htmlFor={field.name}
                                                    className="block text-sm font-medium text-gray-700 mb-1"
                                                >
                                                    {field.label}
                                                </label>
                                                {field.type === "select" ? (
                                                    <select
                                                        id={field.name}
                                                        name={field.name}
                                                        value={formData[field.name] || ""}
                                                        onChange={handleChange}
                                                        className="border-2 px-3 py-2 text-gray-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {field.options.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : field.type === "textarea" ? (
                                                    <textarea
                                                        id={field.name}
                                                        name={field.name}
                                                        value={formData[field.name] || ""}
                                                        onChange={handleChange}
                                                        rows={4}
                                                        className="border-2 px-3 py-2 text-gray-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                                                    />
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        id={field.name}
                                                        name={field.name}
                                                        value={formData[field.name] || ""}
                                                        onChange={handleChange}
                                                        className="border-2 px-3 py-2 text-gray-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => router.push("/admin/proprietarios")}
                                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${isSaving ? "bg-gray-500" : "bg-black hover:bg-gray-800"
                                        }`}
                                >
                                    {isSaving ? (
                                        <>
                                            <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        "Salvar Alterações"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AuthCheck>
    );
} 