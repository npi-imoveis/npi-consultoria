"use client";

const formatarHtml = (htmlString) => {
    if (!htmlString) return "";
    return htmlString.replace(/\r\n|\r|\n/g, "<br />");
};

export default function FichaTecnica({ condominio }) {
    const fichaTecnica = formatarHtml(condominio.FichaTecnica);
    return (
        <div className="bg-white rounded-lg container mx-auto p-10 mt-4">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-black">Ficha Técnica</h2>
            </div>

            <div>
                <h2 className="font-semibold text-lg mb-3">Informações Gerais</h2>
                <h4 className="my-8 text-sm" dangerouslySetInnerHTML={{ __html: fichaTecnica }} />
            </div>
        </div>
    );
} 