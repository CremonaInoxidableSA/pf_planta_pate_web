import { useAlarmas } from "@/context/AlarmasContext";
import { useTranslation } from "react-i18next";

interface ContenedorAlarmasProps {
  linea: "1" | "2";
}

export default function ContenedorAlarmas({ linea }: ContenedorAlarmasProps) {
  const { alarmas, loading, error } = useAlarmas();
  const activas =
    (linea === "1" ? alarmas.alarmas_l1 : alarmas.alarmas_l2)?.filter(
      (a) => a.valor,
    ) || [];
  const { t } = useTranslation();

  return (
    <div className="w-full h-full flex flex-col bg-background3 p-2.5 rounded-md overflow-y-auto">
      <span className="font-semibold text-lg mb-2">
        {t("min.alarmasActivasLinea")} {linea}
      </span>
      {loading && (
        <span className="text-xs text-gray-400">{t("min.cargando")}</span>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
      <ul className="flex flex-col gap-1">
        {activas.length === 0 && !loading && (
          <li className="text-xs text-gray-400">
            {t("min.sinAlarmasActivas")}
          </li>
        )}
        {activas.map((a) => (
          <li
            key={a.id}
            className="bg-background5 rounded px-2 py-1 text-sm text-texto truncate"
            title={a.nombre}
          >
            {a.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}
