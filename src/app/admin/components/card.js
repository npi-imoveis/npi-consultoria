import Link from "next/link";

export default function Card({ title, value, link }) {
  return (
    <div className="flex flex-col bg-white rounded-lg">
      <div className="px-4 py-8">
        <div className="grid items-center justify-center w-full grid-cols-1 text-left">
          <div>
            <h2 className="text-lg font-medium tracking-tighter text-gray-600">{title}</h2>
          </div>
          <div className="mt-2">
            <p>
              <span className="text-xl font-bold tracking-tight text-black">{value}</span>
            </p>
          </div>
          <div className="mt-4">
            <Link
              aria-describedby="tier-company"
              className="flex items-center justify-center w-full px-6 py-2.5 text-center text-white duration-200 bg-black border-2 border-black rounded-lg nline-flex hover:bg-transparent hover:border-black hover:text-black focus:outline-none focus-visible:outline-black text-sm focus-visible:ring-black"
              href={link}
            >
              Acessar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
