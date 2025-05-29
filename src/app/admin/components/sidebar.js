"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  HomeIcon,
  BuildingOfficeIcon,
  StarIcon,
  Cog6ToothIcon,
  TableCellsIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: TableCellsIcon,
    },
    {
      name: "Imóveis",
      href: "/admin/imoveis",
      icon: BuildingOfficeIcon,
    },
    {
      name: "Destaques",
      href: "/admin/destacados",
      icon: StarIcon,
    },
    {
      name: "Corretores",
      href: "/admin/corretores",
      icon: UserGroupIcon,
    },

    {
      name: "Gerenciar Site",
      href: "/admin/gerenciar-site",
      icon: HomeIcon,
    },
    {
      name: "Configurações",
      href: "/admin/configuracoes",
      icon: Cog6ToothIcon,
    },

    {
      name: "Redirects",
      href: "/admin/redirect",
      icon: Cog6ToothIcon,
    },
  ];

  // Verificar se o caminho atual corresponde a um item de menu
  const isActive = (href) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="bg-black text-white h-screen w-64 transition-all duration-300 ease-in-out fixed top-0 left-0 z-10">
      <div className="p-4 flex flex-col h-full">
        {/* Cabeçalho */}
        <div className="flex items-center justify-center mb-8 mt-2">
          <Image
            src="/assets/images/logo_light.png"
            alt="NPI Imóveis"
            width={150}
            height={50}
            className="mx-auto"
          />
        </div>

        {/* Menu de navegação */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-md transition-colors text-xs ${
                    isActive(item.href)
                      ? "bg-zinc-800 text-white"
                      : "hover:bg-zinc-900 text-zinc-300"
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <button className="w-full mt-8 bg-[#8B6F48] hover:bg-[#8B6F48]/80 text-white p-4 rounded-md transition-colors text-xs">
            <Link href="/admin/automacao">Automação</Link>
          </button>
        </nav>

        {/* Rodapé */}
        <div className="mt-auto pt-4 border-t border-zinc-800">
          <div className="flex items-center p-2">
            <div className="text-xs text-zinc-400">
              &copy; {new Date().getFullYear()} NPI Imóveis
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
