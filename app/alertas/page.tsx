"use client";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

const Tabla = dynamic(() => import("@/app/alertas/(tabla)/tabla"), {
  ssr: false,
});

export default function Home() {
  const { t } = useTranslation();
  return (
    <section className="flex flex-col w-full">
      <div className="text-center pointer-events-none">
        <p className="text-4xl font-bold leading-none">{t("min.historial")}</p>
        <p className="text-2xl text-lightgrey">{t("min.alertas")}</p>
      </div>
      <Tabla />
    </section>
  );
}
