"use client";

const formatarHtml = (htmlString) => {
    if (!htmlString) return "";
    // Normalize line endings to \n first, then replace with <br />
    return htmlString
        .replace(/\r\n|\r|\n/g, '\n')
        .split('\n')
        .join('<br />');
};

export default function FichaTecnica({ condominio }) {
    const fichaTecnica = formatarHtml(condominio.FichaTecnica);
    return (
        <div className="bg-white rounded-lg container mx-auto p-10 mt-4">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-black">Ficha Técnica {condominio.Empreendimento}</h2>
            </div>

            <div>
                <h2 className="font-semibold text-lg mb-3">Informações Gerais</h2>
                <div
                    className="my-8 text-sm"
                    dangerouslySetInnerHTML={{ __html: fichaTecnica }}
                />
            </div>
        </div>
    );
} 
