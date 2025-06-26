// app/components/ui/title-section.tsx

import { ReactNode } from "react";

export interface TitleSectionProps {
  section?: string;
  title: string;
  description?: string;
  button?: boolean;
  center?: boolean;
  as?: "h1" | "h2" | "h3"; // define o tipo de heading
}

export function TitleSection({
  section,
  title,
  description,
  button,
  center = false,
  as = "h2", // padrão seguro para SEO
}: TitleSectionProps): ReactNode {
  const HeadingTag = as;

  return (
    <div className={`mb-10 ${center ? "text-center" : ""}`}>
      {section && (
        <span className="text-sm font-semibold uppercase text-zinc-500 tracking-wide">
          {section}
        </span>
      )}

      <HeadingTag className="text-3xl font-bold text-zinc-800 mt-1">
        {title}
      </HeadingTag>

      {description && (
        <p className="mt-2 text-zinc-500 text-base">{description}</p>
      )}
    </div>
  );
}
