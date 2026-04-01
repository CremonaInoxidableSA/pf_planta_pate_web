"use client";

import ContenedorAlarmas from "@/components/home/contenedorAlarmas";
import { ImagenLayout } from "@/components/home/imagenLayout";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  return (
    <section className="p-5 flex flex-row w-full gap-5 items-center bg-background2 rounded-md">
      <div className="w-1/4 h-full flex flex-col items-center justify-center">
        <h1 className="flex justify-center w-full text-3xl text-texto font-semibold">
          {t("mayus.alarmas")}
        </h1>
        <p className="flex justify-center w-full text-lg text-texto">
          {t("mayus.activas")}
        </p>

        <div className="w-full h-full flex flex-col items-center gap-5">
          <ContenedorAlarmas linea="1" />
          <ContenedorAlarmas linea="2" />
        </div>
      </div>

      <hr className="h-[95%] w-0.5 mx-0.5 border-none bg-background6 z-500" />

      <div className="w-full h-full flex items-center justify-center">
        <ImagenLayout />
      </div>
    </section>
  );
}
