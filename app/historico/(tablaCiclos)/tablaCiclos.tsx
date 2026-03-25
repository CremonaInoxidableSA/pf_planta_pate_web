import React, { useEffect, useState } from "react";
import { parse, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import ciclosData from "@/mocks/ciclosHistorico.json";

interface Ciclo {
  id_ciclo: number;
  lote: string;
  fecha_inicio: string;
  fecha_fin: string;
  tiempo_transcurrido: string;
}

export function getCiclosFiltrados(
  fechaInicio: string,
  fechaFin: string,
  equipoId: number,
): Ciclo[] {
  const from = startOfDay(parse(fechaInicio, "yyyy-MM-dd", new Date()));
  const to = endOfDay(parse(fechaFin, "yyyy-MM-dd", new Date()));

  return ciclosData
    .filter((c) => {
      const start = new Date(c.fechaInicio);
      return (
        c.idEquipo === equipoId &&
        isWithinInterval(start, { start: from, end: to })
      );
    })
    .map((c) => ({
      id_ciclo: c.idCiclo,
      lote: c.lote,
      fecha_inicio: c.fechaInicio,
      fecha_fin: c.fechaFin,
      tiempo_transcurrido: `${c.tiempoTranscurridoHs} hs`,
    }));
}

interface TablaCiclosProps {
  fechaInicio: string;
  fechaFin: string;
  equipoId: number;
  selectedCicloId?: number | null;
  onCicloSelect?: (ciclo: Ciclo) => void;
}

const TablaCiclos: React.FC<TablaCiclosProps> = ({
  fechaInicio,
  fechaFin,
  equipoId,
  selectedCicloId,
  onCicloSelect,
}) => {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [selectedKeys, setSelectedKeys] = useState(
    new Set(selectedCicloId ? [selectedCicloId.toString()] : []),
  );

  useEffect(() => {
    const filtered = getCiclosFiltrados(fechaInicio, fechaFin, equipoId);
    const timer = setTimeout(() => {
      setCiclos(filtered);
      setSelectedKeys(new Set());
    }, 0);
    return () => clearTimeout(timer);
  }, [fechaInicio, fechaFin, equipoId]);

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <Table
        aria-label="Tabla de ciclos"
        className="min-w-150 backdrop-blur-sm text-texto"
      >
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Lote</TableHead>
            <TableHead>Inicio</TableHead>
            <TableHead>Fin</TableHead>
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
