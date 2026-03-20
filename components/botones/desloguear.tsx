"use client";

import React, { useState, useRef, useEffect } from "react";
import { VscAccount } from "react-icons/vsc";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

interface DesloguearProps {
  _username?: string;
}

const Desloguear: React.FC<DesloguearProps> = ({ _username = "Usuario" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const router = useRouter();

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Botón del perfil - Updated hover effects */}
      <button
        className="relative flex items-center justify-center w-[25px] h-[25px] rounded-[100%] group transition-all duration-200 ease-in-out"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-[100%] bg-gray-400/0 group-hover:bg-gray-400/20 transition-all duration-200 ease-in-out group-hover:scale-150 pointer-events-none" />

        {/* Icon with scale effect */}
        <VscAccount className="w-[25px] h-[25px] text-[#131313] transition-transform duration-300 ease-in-out group-hover:scale-110" />
      </button>

      {/* Dropdown menu with shadow */}
      <div
        className={`absolute left-[-10px] mt-[14px] w-48 rounded-md transform transition-all duration-200 ease-in-out origin-top-right shadow-[0_0_15px_rgba(0,0,0,0.3)]
                ${
                  isOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                } bg-[#EEE]`}
      >
        {/* Header del perfil */}
        <div className="px-[10px] py-[14px] border-b border-gray-200">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-[#131313]">Creminox</p>
              <p className="text-xs text-gray-600">{t("deslogueo.estado")}</p>
            </div>
          </div>
        </div>

        {/* Botón de cerrar sesión - Updated styles */}
        <div className="bg-[#f15b5f] rounded-b-md">
          <button
            className="w-full text-left px-[10px] py-[8px] text-sm text-[#D9D9D9] font-bold
                                 hover:bg-[#ff7a7e] rounded-b-md
                                 active:bg-red-200 active:text-black
                                 transition-all duration-200 ease-in-out
                                 flex items-center space-x-2
                                 cursor-pointer"
            onClick={handleLogout}
          >
            <span>{t("deslogueo.botonsesion")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Desloguear;
