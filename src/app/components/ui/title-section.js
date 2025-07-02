import { Button } from "./button";

export function TitleSection({ 
  destaque, 
  section, 
  title, 
  description, 
  button, 
  center = false 
}) {
  const titleClasses = "text-xl uppercase font-bold tracking-tight";
  
  return (
    <div
      className={`container mx-auto flex flex-col p-4 ${
        center ? "items-center text-center" : ""
      }`}
    >
      <div className="space-y-3 max-w-md">
        <span className="bg-[#8B6F4B] text-white px-5 py-2 text-sm font-bold">
          {section}
        </span>
        <h2 className={titleClasses}>{title}</h2>
        <h3 className="text-black font-medium text-base">{description}</h3>
      </div>
      {button && (
        <div className="mt-5">
          <Button link="/" text="Ver todos" />
        </div>
      )}
    </div>
  );
}
