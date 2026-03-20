"use client";

import React from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface DateRange {
  start: string;
  end: string;
}

interface MetricsProps {
  ciclosRealizados: number;
  produccionTotal: number;
  dateRange: DateRange;
}

const Metrics: React.FC<MetricsProps> = ({
  ciclosRealizados,
  produccionTotal,
  dateRange,
}) => {
  const { t } = useTranslation();
  const metrics = [
    {
      id: 1,
      titulo: t("metrica.ciclos"),
      dato: (
        <span className="flex items-center gap-2 mb-[3px]">
          {ciclosRealizados}
          <Image
            alt="Ciclo"
            className="ciclos-image ml-[-3px] mt-[20px]"
            height={24}
            src="/ciclo.png"
            width={24}
          />
        </span>
      ),
    },
    {
      id: 2,
      titulo: t("metrica.produccion"),
      dato: (
        <span>
          {produccionTotal.toFixed(2)}{" "}
          <span className="text-xl ml-[-8px] mb-[3px]">Tn</span>
        </span>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-3xl text-white font-bold mb-[-3px]">{t("titulo")}</h2>
      <div>
        <span className="text-l text-orange">{dateRange.start}</span>
        <span className="text-l text-white"> - </span>
        <span className="text-l text-orange">{dateRange.end}</span>
      </div>
      <div className="w-full flex items-center justify-evenly">
        {metrics.map((m) => (
          <div key={m.id} className="text-center">
            <div className="flex items-center justify-center text-5xl text-white font-bold">
              {m.dato}
            </div>
            <div className="text-2xl text-white">{m.titulo}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Metrics;
