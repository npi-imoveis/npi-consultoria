"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

import { atualizarCorretor, getCorretorById } from "@/app/admin/services";
import { ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import AuthCheck from "@/app/admin/components/auth-check";

export default function EditarCorretor({ params }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const id = unwrappedParams.id;

    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Carregar dados do corretor
    useEffect(() => {
        const fetchCorretor = async () => {
            setIsLoading(true);
            try {
                const result = await getCorretorById(id);
                if (result.success && result.data) {
                    setFormData(result.data);
                } else {
                    setError("Corretor não encontrado");
                    router.push("/admin/corretores");
                }
            } catch (error) {
                console.error("Erro ao carregar corretor:", error);
                setError("Erro ao carregar dados do corretor");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchCorretor();
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
            const result = await atualizarCorretor(id, formData);
            if (result && result.success) {
                setSuccess("Corretor atualizado com sucesso!");
                setTimeout(() => {
                    router.push("/admin/corretores");
                }, 2000);
            } else {
                setError(result?.message || "Erro ao atualizar corretor");
            }
        } catch (error) {
            console.error("Erro ao atualizar corretor:", error);
            setError("Ocorreu um erro ao salvar as alterações");
        } finally {
            setIsSaving(false);
        }
    };

    // Campos do formulário organizados por seções
    const fieldSections = [
        {
            title: "Dados Pessoais",
            fields: [
                { name: "nomeCompleto", label: "Nome Completo", type: "text" },
                { name: "inavito", label: "Inativo", type: "text" },
                { name: "codigoD", label: "Código", type: "text" },
                { name: "rg", label: "RG", type: "text" },
                { name: "cpf", label: "CPF", type: "text" },
                { name: "nascimento", label: "Data de Nascimento", type: "date" },
                { name: "nacional", label: "Nacionalidade", type: "text" },
                {
                    name: "estCivil",
                    label: "Estado Civil",
                    type: "select",
                    options: [
                        { value: "Solteiro(a)", label: "Solteiro(a)" },
                        { value: "Casado(a)", label: "Casado(a)" },
                        { value: "Divorciado(a)", label: "Divorciado(a)" },
                        { value: "Viúvo(a)", label: "Viúvo(a)" },
                    ]
                },
                {
                    name: "sexo",
                    label: "Sexo",
                    type: "select",
                    options: [
                        { value: "Masculino", label: "Masculino" },
                        { value: "Feminino", label: "Feminino" },
                        { value: "Outro", label: "Outro" },
                    ]
                },
            ],
        },
        {
            title: "Documentação",
            fields: [
                { name: "cnh", label: "CNH", type: "text" },
                { name: "creci", label: "CRECI", type: "text" },
            ],
        },
        {
            title: "Contato",
            fields: [
                { name: "celular", label: "Celular", type: "text" },
                { name: "fone", label: "Telefone Fixo", type: "text" },
                { name: "email", label: "E-mail", type: "email" },
            ],
        },
        {
            title: "Endereço",
            fields: [
                { name: "endereco", label: "Endereço", type: "text" },
                { name: "bairro", label: "Bairro", type: "text" },
                { name: "cidade", label: "Cidade", type: "text" },
                { name: "uf", label: "UF", type: "text" },
                { name: "cep", label: "CEP", type: "text" },
                { name: "pais", label: "País", type: "text" },
            ],
        },
    ];

    return (
        <AuthCheck>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-bold text-gray-900">
                            {isLoading ? "Carregando..." : "Editar Corretor"}
                        </h1>
                        <button
                            type="button"
                            onClick={() => router.push("/admin/corretores")}
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
                                            <div key={field.name}>
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
                                    onClick={() => router.push("/admin/corretores")}
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