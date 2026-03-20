import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown } from "react-icons/fa";
import { US } from "country-flag-icons/react/3x2";
import { AR } from "country-flag-icons/react/3x2";
import Cookies from "js-cookie";

import useOutsideClick from "@/hooks/useOutsideClick";

type Option = {
  value: "es" | "en";
  flagComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const DropdownBanderas = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { i18n } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(dropdownRef, () => {
    setIsOpen(false);
  });

  const options: Option[] = [
    { value: "es", flagComponent: AR },
    { value: "en", flagComponent: US },
  ];

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    Cookies.set("selectedLanguage", value, { path: "/", expires: 365 });
    localStorage.setItem("selectedLanguage", value);
    setIsOpen(false);
  };

  const currentLanguage =
    options.find((opt) => opt.value === i18n.language) || options[0];

  return (
    <div ref={dropdownRef} className="relative z-1000 cursor-pointer">
      <button
        className="flex items-center justify-between w-full py-0.5 px-1 bg-[#BBB5] border border-[#AAA] rounded-xs z-1000 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {React.createElement(currentLanguage.flagComponent, {
          className: "inline-block",
          style: { width: "20px", height: "15px" },
        })}
        <FaChevronDown
          className={`ml-0.5 transition-transform ${
            isOpen ? "rotate-180" : ""
          } inline-block w-2 h-2`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-0.5 w-10 rounded-xs bg-[#DDD] ring-[1px] ring-black ring-opacity-[5px] transition-colors ease-in-out hover:bg-lightGrey z-1000 cursor-pointer">
          <div
            aria-labelledby="options-menu"
            aria-orientation="vertical"
            className="py-px z-1000 cursor-pointer"
            role="menu"
          >
            {options
              .filter((option) => option.value !== currentLanguage.value)
              .map((option) => (
                <button
                  key={option.value}
                  className="block w-full text-left px-1 py-0.5 text-sm text-gray-700 z-901 cursor-pointer"
                  role="menuitem"
                  onClick={() => handleLanguageChange(option.value)}
                >
                  {React.createElement(option.flagComponent, {
                    className: "inline-block",
                    style: { width: "20px", height: "15px" },
                  })}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownBanderas;
