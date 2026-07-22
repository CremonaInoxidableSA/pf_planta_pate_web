"use client";

import { useTranslation } from "react-i18next";

interface BarraCiclosProps {
  ciclos_correctos: number;
  ciclos_incorrectos: number;
}

const BarraCiclos = ({
  ciclos_correctos,
  ciclos_incorrectos,
}: BarraCiclosProps) => {
  const { t } = useTranslation();

  const totalCiclos = ciclos_correctos + ciclos_incorrectos;
  const porcentajeCorrectos =
    totalCiclos > 0 ? (ciclos_correctos / totalCiclos) * 100 : 0;
  const porcentajeIncorrectos =
    totalCiclos > 0 ? (ciclos_incorrectos / totalCiclos) * 100 : 0;

  return (
    <div className="w-full gap-5 flex flex-col text-texto">
      <div className="flex items-center justify-between">
        <h1 className="whitespace-nowrap">% {t("min.ciclosCorrectos")}</h1>
        <h1>{t("min.total")}</h1>
      </div>

      {totalCiclos > 0 ? (
        <>
          <div className="w-full h-6 bg-background3 rounded overflow-hidden flex">
            {ciclos_correctos > 0 && (
              <div
                className="bg-green-500 h-full transition-all"
                style={{ width: `${porcentajeCorrectos}%` }}
                title={
                  t("min.ciclosCorrectos") +
                  `: ${ciclos_correctos} (${porcentajeCorrectos.toFixed(1)}%)`
                }
              />
            )}
            {ciclos_incorrectos > 0 && (
              <div
                className="bg-red-500 h-full transition-all"
                style={{ width: `${porcentajeIncorrectos}%` }}
                title={
                  t("min.ciclosIncorrectos") +
                  `: ${ciclos_incorrectos} (${porcentajeIncorrectos.toFixed(1)}%)`
                }
              />
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            {ciclos_correctos > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span>
                  {t("min.ciclosCorrectos")}: {ciclos_correctos} (
                  {porcentajeCorrectos.toFixed(1)}%)
                </span>
              </div>
            )}
            {ciclos_incorrectos > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span>
                  {t("min.ciclosIncorrectos")}: {ciclos_incorrectos} (
                  {porcentajeIncorrectos.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="w-full h-6 bg-background3 rounded" />
      )}
    </div>
  );
};

export default BarraCiclos;
