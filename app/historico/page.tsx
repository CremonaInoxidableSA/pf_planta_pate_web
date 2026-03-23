"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function Historico() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full gap-5">
      <div className="flex flex-row items-center justify-between bg-background2 p-2 w-full rounded-md">
        <div className="w-[35%] justify-start">
          <Button className="w-[35%]"/>
        </div>
        

        <h2 className="w-[30%] flex justify-center items-center text-texto text-xl">
          {t("filtroPeriodo.titulo")}
        </h2>

        <div className="flex flex-row gap-5 w-[35%] justify-end">
          <div className="">
            Selector
          </div>
          <div className="">
            Date Picker
          </div>
          <div className="">
            Boton Aplicar
          </div>
        </div>
      </div>

      <div className="bg-red">
        Grafico Historico
      </div>
      <div className="bg-red">
        Productividad
      </div>
    </div>
  );
}
