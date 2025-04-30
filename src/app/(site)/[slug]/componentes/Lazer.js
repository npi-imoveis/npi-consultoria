"use client";

import { formatterStringToArray } from "@/app/utils/formatter-string-to-array";

export default function Lazer({ condominio }) {
    const lazer = formatterStringToArray(condominio.DestaquesLazer);
    return (
        <div className="container mx-auto bg-white mt-4 p-10 rounded-lg">
            <h2 className="text-xl font-bold text-black">Lazer</h2>
            <div className="flex flex-wrap gap-3 mt-6">
                {lazer.map((item, index) => (
                    <h4 key={index} className="px-4 py-1 text-xs font-bold bg-zinc-100 rounded-full">
                        {item}
                    </h4>
                ))}
            </div>
        </div>
    );
} 