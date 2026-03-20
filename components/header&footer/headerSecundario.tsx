"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoDotFill } from "react-icons/go";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const HeaderSecundario = () => {
  const { t } = useTranslation();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const opcionesBotones = [
    {
      id: 1,
      path: "/cocinas",
      text: t("mayus.cocinas"),
      styleClass: "text-orange text-xl",
    },
    {
      id: 2,
      path: "/enfriadores",
      text: t("mayus.enfriadores"),
      styleClass: "text-blue text-xl",
    },
  ];

  return (
    <div className="w-full bg-background2 flex flex-row justify-center shadow-[5px_5px_5px_5px_rgba(0,0,0,0.20)]">
      <ul className="flex flex-row items-center gap-6">
        {opcionesBotones.map(({ id, path, text, styleClass }) => {
          const isActive = Array.isArray(path)
            ? path.includes(pathname)
            : pathname === path;

          return (
            <li
              key={id}
              className={`relative py-3 transition-colors ${
                isActive ? "font-semibold" : "font-normal"
              } ${styleClass}`}
            >
              <Link
                className="flex items-center gap-2 hover:text-texto2"
                href={Array.isArray(path) ? path[0] : path}
              >
                {isActive ? (
                  <GoDotFill className="text-green-500" />
                ) : (
                  <GoDotFill className="text-gray-500" />
                )}
                <p>{text}</p>
              </Link>
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default HeaderSecundario;
