"use client";

import { Button } from "@/app/components/ui/button";


export default function ScrollToImoveisButton({ text }) {
    return (
        <Button
            text={text}
            onClick={() => {
                const el = document.getElementById("imoveis-relacionados");
                if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
        />
    );
}