import { useEffect, useState, useMemo } from "react";
import { getProprietario, updateProprietario } from "../../services";

export default function Proprietarios({ id }) {
    // Estado único, conforme backend
    const [proprietarios, setProprietarios] = useState({
        NOME01: "", FONE_P01: "", EMAIL_01: "", UNIDADE_01: "", M2_01: "", VALORP_01: "", DATAP_01: "", OBS_P01: "",
        NOME02: "", FONE_P02: "", EMAIL_02: "", UNIDADE_02: "", M2_02: "", VALORP_02: "", DATAP_02: "", OBS_P02: "",
        NOME03: "", FONE_P03: "", EMAIL_03: "", UNIDADE_03: "", M2_03: "", VALORP_03: "", DATAP_03: "", OBS_P03: "",
        NOME04: "", FONE_P04: "", EMAIL_04: "", UNIDADE_04: "", M2_04: "", VALORP_04: "", DATAP_04: "", OBS_P04: "",
        NOME05: "", FONE_P05: "", EMAIL_05: "", UNIDADE_05: "", M2_05: "", VALORP_05: "", DATAP_05: "", OBS_P05: "",
    });
    const [abaAtiva, setAbaAtiva] = useState(0);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        const fetchProprietarios = async () => {
            const response = await getProprietario(id);
            if (response && response.data) {
                setProprietarios(response.data);
            }
        }
        fetchProprietarios();
    }, [id]);

    // Função para separar os dados em 5 proprietários
    const proprietariosSeparados = useMemo(() => {
        return Array.from({ length: 5 }, (_, i) => {
            const idx = String(i + 1).padStart(2, '0');
            return {
                nome: proprietarios[`NOME${idx}`] || "",
                fone: proprietarios[`FONE_P${idx}`] || "",
                email: proprietarios[`EMAIL_${idx}`] || "",
                unidade: proprietarios[`UNIDADE_${idx}`] || "",
                metrag: proprietarios[`M2_${idx}`] || "",
                valor: proprietarios[`VALORP_${idx}`] || "",
                data: proprietarios[`DATAP_${idx}`] || "",
                observacoes: proprietarios[`OBS_P${idx}`] || "",
            };
        });
    }, [proprietarios]);

    // Atualiza o estado original ao editar um campo
    const handleChange = (index, e) => {
        const { name, value } = e.target;
        const idx = String(index + 1).padStart(2, '0');
        // Mapeamento dos nomes dos campos para as chaves do objeto
        const map = {
            nome: `NOME${idx}`,
            fone: `FONE_P${idx}`,
            email: `EMAIL_${idx}`,
            unidade: `UNIDADE_${idx}`,
            metrag: `M2_${idx}`,
            valor: `VALORP_${idx}`,
            data: `DATAP_${idx}`,
            observacoes: `OBS_P${idx}`,
        };
        setProprietarios(prev => ({ ...prev, [map[name]]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);
        try {
            const result = await updateProprietario(id, proprietarios);
            if (result.success) {
                setFeedback({ type: 'success', message: result.message || 'Dados atualizados com sucesso!' });
            } else {
                setFeedback({ type: 'error', message: result.message || 'Erro ao atualizar dados.' });
            }
        } catch (err) {
            setFeedback({ type: 'error', message: 'Erro inesperado ao atualizar dados.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg overflow-hidden p-6 my-6 ">
            <h1 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Informações dos Proprietários</h1>
            {/* Abas */}
            <div className="flex space-x-2 mb-6 border-b">
                {proprietariosSeparados.map((_, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => setAbaAtiva(idx)}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 focus:outline-none ${abaAtiva === idx
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-black'
                            }`}
                    >
                        Proprietário {idx + 1}
                    </button>
                ))}
            </div>
            {feedback && (
                <div className={`mb-4 p-3 rounded ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {feedback.message}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                {/* Renderiza apenas o proprietário da aba ativa */}
                <div className="mb-6 border-b pb-4">
                    <h2 className="font-bold mb-2">Proprietário {abaAtiva + 1}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <input
                                type="text"
                                name="nome"
                                value={proprietariosSeparados[abaAtiva].nome}
                                onChange={e => handleChange(abaAtiva, e)}
                                className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fone</label>
                            <input
                                type="text"
                                name="fone"
                                value={proprietariosSeparados[abaAtiva].fone}
                                onChange={e => handleChange(abaAtiva, e)}
                                className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={proprietariosSeparados[abaAtiva].email}
                                onChange={e => handleChange(abaAtiva, e)}
                                className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                            <input
                                type="text"
                                name="unidade"
                                value={proprietariosSeparados[abaAtiva].unidade}
                                onChange={e => handleChange(abaAtiva, e)}
                                className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Metragem</label>
                            <input
                                type="text"
                                name="metrag"
                                value={proprietariosSeparados[abaAtiva].metrag}
                                onChange={e => handleChange(abaAtiva, e)}
                                className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                            <input
                                type="text"
                                name="valor"
                                value={proprietariosSeparados[abaAtiva].valor}
                                onChange={e => handleChange(abaAtiva, e)}
                                className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                            <input
                                type="text"
                                name="data"
                                value={proprietariosSeparados[abaAtiva].data}
                                onChange={e => handleChange(abaAtiva, e)}
                                className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                                disabled={loading}
                            />
                        </div>
                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                            <textarea
                                name="observacoes"
                                value={proprietariosSeparados[abaAtiva].observacoes}
                                onChange={e => handleChange(abaAtiva, e)}
                                rows={4}
                                className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-8">
                    <button
                        type="submit"
                        className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
}
