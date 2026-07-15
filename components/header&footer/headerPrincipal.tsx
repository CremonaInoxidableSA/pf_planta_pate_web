import { ThemeSwitcher } from "@/components/theme/themeSwitcher";

import { useTranslation } from "react-i18next";

import Link from "next/link";
import Image from "next/image";
import { JSX } from "react";

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

  const opcionesIconos: OpcionIcono[] = [
    { id: 1, icon: <UserIcon /> },
    { id: 2, icon: <ThemeSwitcher /> },
    { id: 3, icon: <DropdownBanderas /> },
  ];

  const opcionesMenu: OpcionMenu[] = [
    { id: 1, url: "/", text: t("min.home") },
    { id: 2, url: "/historico", text: t("min.historico") },
    { id: 3, url: "/alarmas", text: t("min.alarmas") },
    { id: 4, url: "/monitoreo", text: t("min.monitoreo") },
  ];

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
                    className={
                      currentPath === url
                        ? "underline underline-offset-4 decoration-2"
                        : ""
                    }
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
            <Image
              src={Logo}
              alt="Creminox logo"
              className="h-6 w-auto"
              priority
              loading="eager"
            />
          </Link>
        </ul>
      </div>
    </header>
  );
};

export default HeaderPrincipal;
