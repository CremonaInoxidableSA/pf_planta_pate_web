import { ThemeSwitcher } from "@/components/theme/themeSwitcher";

import { useTranslation } from "react-i18next";
import { VscBell } from "react-icons/vsc";
import { GoGear } from "react-icons/go";

import Link from "next/link";
import Image from "next/image";
import { JSX, useEffect, useState } from "react";

import DropdownBanderas from "@/components/translate/dropdownBanderas";
import UserIcon from "@/components/userIcon/userIcon";
import Logo from "@/public/logo/creminox_innovate.webp";

interface Header {
  currentPath: string;
}

interface OpcionIcono {
  id: number;
  url?: string;
  icon: JSX.Element | React.ReactNode;
}

interface OpcionMenu {
  id: number;
  url?: string;
  text: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const HeaderPrincipal: React.FC<Header> = ({ currentPath }) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const opcionesIconos: OpcionIcono[] = [
    {
      id: 1,
      icon: <UserIcon />,
    },
    {
      id: 2,
      url: "/alertas",
      icon: (
        <Link
          className="group relative flex items-center justify-center w-6.25 h-6.25 ease-in-out"
          href="/alertas"
        >
          <div className="absolute inset-0 rounded-md bg-gray-400/0 group-hover:bg-gray-400/20 ease-in-out group-hover:scale-150 pointer-events-none" />
          <VscBell className="w-6.25 h-6.25 transition-transform ease-in-out group-hover:scale-110" />
        </Link>
      ),
    },
    {
      id: 3,
      icon: (
        <Link
          className="group relative flex items-center justify-center w-6.25 h-6.25 ease-in-out"
          href="/config_equipos"
        >
          <div className="absolute inset-0 rounded-md bg-gray-400/0 group-hover:bg-gray-400/20 ease-in-out group-hover:scale-150 pointer-events-none" />
          <GoGear className="w-6.25 h-6.25 transition-transform ease-in-out group-hover:scale-110" />
        </Link>
      ),
    },
    { id: 4, icon: <DropdownBanderas /> },
    { id: 5, icon: <ThemeSwitcher /> },
  ];

  const opcionesMenu: OpcionMenu[] = [
    { id: 1, url: "/", text: t("min.home") },
    { id: 2, url: "/camaras", text: t("min.camaras") },
  ];

  if (!mounted) {
    return null;
  }
  return (
    <header className="flex bg-header-bg text-texto-header p-5">
      <div className="flex flex-row h-full w-[30%] justify-start gap-7.5 items-center">
        {opcionesIconos.map(({ id, icon }) => (
          <div
            key={id}
            className="flex items-center justify-center cursor-pointer"
          >
            {icon}
          </div>
        ))}
      </div>

      <p className="flex w-[40%] justify-center header font-bold">
        {t("mayus.titulo")}
      </p>

      <div className="flex flex-row w-[30%] justify-end">
        <ul className="flex flex-row w-full h-full gap-7.5 justify-end">
          {opcionesMenu.map(({ id, url, text, onClick }) => (
            <li key={id} className="h-full">
              {onClick ? (
                <button
                  className="header bg-transparent border-none p-0 m-0 cursor-pointer"
                  type="button"
                  onClick={onClick}
                >
                  {text}
                </button>
              ) : (
                url && (
                  <Link
                    className={currentPath === url ? "activeLink" : ""}
                    href={url}
                  >
                    <p className="header">{text}</p>
                  </Link>
                )
              )}
            </li>
          ))}
          <Link
            href="https://creminox.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image src={Logo} alt="Creminox logo" className="h-6 w-auto" />
          </Link>
        </ul>
      </div>
    </header>
  );
};

export default HeaderPrincipal;
