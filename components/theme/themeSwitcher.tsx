"use client";

import { MoonFilledIcon, SunFilledIcon } from "../icons";
import { useThemeToggle } from "./themeToggleLogic";

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useThemeToggle();
  const handleClick = () => {
    toggleTheme();
  };

  const isLight = theme === "light";

  return (
    <button
      onClick={handleClick}
      aria-label="Toggle theme"
      className="group relative flex items-center justify-center w-6.25 h-6.25 ease-in-out cursor-pointer"
    >
      {isLight ? (
        <div className="group relative flex items-center justify-center w-6.25 h-6.25 ease-in-out">
          <div className="absolute inset-0 rounded-md bg-gray-400/0 group-hover:bg-gray-400/20 ease-in-out group-hover:scale-150 pointer-events-none" />
          <MoonFilledIcon className="w-6.25 h-6.25 transition-transform ease-in-out group-hover:scale-110" />
        </div>
      ) : (
        <div className="group relative flex items-center justify-center w-6.25 h-6.25 ease-in-out">
          <div className="absolute inset-0 rounded-md bg-gray-400/0 group-hover:bg-gray-400/20 ease-in-out group-hover:scale-150 pointer-events-none" />
          <SunFilledIcon className="w-6.25 h-6.25 transition-transform ease-in-out group-hover:scale-110" />
        </div>
      )}
    </button>
  );
};
