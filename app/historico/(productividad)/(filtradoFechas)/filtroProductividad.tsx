"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/selectores/dateRangePicker";
import BotonAplicar from "@/app/historico/(productividad)/(filtradoFechas)/botonAplicar";
import Selector from "./selectorLineas";

const FiltroProductividad = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleApply = () => {
    if (!dateRange?.from || !dateRange?.to) return;
  };

  return (
    <div className="w-[20%] h-full flex flex-col gap-3">
      <h1 className="w-full text-center text-3xl">{t("mayus.filtroFechas")}</h1>
      <Selector />
      <div className="w-full flex flex-row items-center justify-between gap-3">
        <DateRangePicker
          className="w-[80%] cursor-pointer"
          value={dateRange}
          onChange={setDateRange}
        />
        <BotonAplicar selectClasses="cursor-pointer" onClick={handleApply} />
      </div>
    </div>
  );
};

export default FiltroProductividad;
