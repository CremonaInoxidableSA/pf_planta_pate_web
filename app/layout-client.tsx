"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";

import HeaderPrincipal from "@/components/header&footer/headerPrincipal";
import HeaderSecundario from "@/components/header&footer/headerSecundario";
import Footer from "@/components/header&footer/footer";

import { Toaster } from "@/components/ui/sonner";

import { I18nextProvider } from "react-i18next";
import { i18n } from "@/i18n";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeaderFooter = [
    "/signup",
    "/login",
    "/login/recuperacion",
    "/login/recuperacion/reset_pass",
    "/bootstrap",
  ].includes(pathname);

  const isDesarmadoPage = pathname === "/armado";

  useEffect(() => {
    const saved =
      (typeof window !== "undefined" &&
        (localStorage.getItem("selectedLanguage") ||
          Cookies.get("selectedLanguage"))) ||
      null;
    const lang = saved === "en" || saved === "es" ? saved : "es";
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <div className="flex flex-col min-h-screen">
        <div className="sticky top-0 left-0 w-full z-551">
          {!hideHeaderFooter && <HeaderPrincipal currentPath={pathname} />}
          {!hideHeaderFooter && <HeaderSecundario />}
        </div>
        <main
          className={`grow flex w-full min-w-0 ${
            pathname === "/login" ||
            pathname === "/login/recuperacion" ||
            pathname === "/login/recuperacion/reset_pass"
              ? "flex justify-center items-center"
              : ""
          }`}
        >
          {children}
        </main>
        <Toaster />
        <div className={isDesarmadoPage ? "pl-67.5" : ""}>
          {!hideHeaderFooter && <Footer />}
        </div>
      </div>
    </I18nextProvider>
  );
}
