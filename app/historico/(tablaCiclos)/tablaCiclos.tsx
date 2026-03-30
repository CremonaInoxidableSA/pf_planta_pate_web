import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";

interface Ciclo {
  id_ciclo: number;
  lote: string;
  fecha_inicio: string;
  fecha_fin: string;
  tiempo_transcurrido: string;
}

interface TablaCiclosProps {
  ciclos: Ciclo[];
  selectedCicloId?: number | null;
  onCicloSelect?: (ciclo: Ciclo) => void;
}

const TablaCiclos: React.FC<TablaCiclosProps> = ({
  ciclos,
  selectedCicloId,
  onCicloSelect,
}) => {
  const { t } = useTranslation();
  const [selectedKeys, setSelectedKeys] = useState(
    new Set(selectedCicloId ? [selectedCicloId.toString()] : []),
  );

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <Table
        aria-label="Tabla de ciclos"
        className="min-w-150 backdrop-blur-sm text-texto"
      >
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>{t("min.lote")}</TableHead>
            <TableHead>{t("min.inicio")}</TableHead>
            <TableHead>{t("min.fin")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ciclos.map((ciclo) => {
            const isSelected = selectedKeys.has(ciclo.id_ciclo.toString());

            return (
              <TableRow
                key={ciclo.id_ciclo}
                className={`text-sm cursor-pointer ${isSelected ? "bg-gray-600/70" : "hover:bg-gray-700/50"}`}
                onClick={() => {
                  const id = ciclo.id_ciclo.toString();
                  const newKeys = new Set([id]);

                  setSelectedKeys(newKeys);
                  if (onCicloSelect) {
                    onCicloSelect(ciclo);
                  }
                }}
              >
                <TableCell>{ciclo.id_ciclo}</TableCell>
                <TableCell>{ciclo.lote}</TableCell>
                <TableCell>
                  {new Date(ciclo.fecha_inicio).toLocaleDateString("es-ES")}
                </TableCell>
                <TableCell>
                  {new Date(ciclo.fecha_fin).toLocaleDateString("es-ES")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TablaCiclos;
