import React from "react";
import { useTranslation } from "react-i18next";

interface BarraCiclosProps {
  ciclosCorrectos: number;
  ciclosIncorrectos: number;
}

const BarraCiclos: React.FC<BarraCiclosProps> = ({
  ciclosCorrectos,
  ciclosIncorrectos,
}) => {
  const totalCiclos = ciclosCorrectos + ciclosIncorrectos;
  const porcentajeCorrectos =
    totalCiclos > 0 ? Math.round((ciclosCorrectos / totalCiclos) * 100) : 0;
  const porcentajeIncorrectos =
    totalCiclos > 0 ? Math.round((ciclosIncorrectos / totalCiclos) * 100) : 0;
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-xl font-bold text-texto">
        % {t("barraCiclos.texto")}
      </h2>
      <div className="flex h-[20px] rounded-[5px] overflow-hidden bg-[#444] mb-[15px]">
        <div
          className="h-full bg-green"
          style={{ width: `${porcentajeCorrectos}%` }}
        />
        <div
          className="h-full bg-red"
          style={{ width: `${porcentajeIncorrectos}%` }}
        />
      </div>
      <div className="flex justify-around flex-wrap">
        <div className="flex items-center my-[5px] mx-[10px]">
          <span className="w-[15px] h-[15px] rounded-[3px] mr-[5px] bg-green" />
          <p className="text-texto">
            {`${t("barraCiclos.correctos")} - ${porcentajeCorrectos}% [${ciclosCorrectos} ${t("barraCiclos.ciclos")}]`}
          </p>
        </div>
        <div className="flex items-center my-[5px] mx-[10px]">
          <span className="w-[15px] h-[15px] rounded-[3px] mr-[5px] bg-red" />
          <p className="text-texto">
            {`${t("barraCiclos.incorrectos")} - ${porcentajeIncorrectos}% [${ciclosIncorrectos} ${t("barraCiclos.ciclos")}]`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarraCiclos;
