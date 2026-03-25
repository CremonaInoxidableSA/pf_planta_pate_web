import React, { useEffect, useState, useCallback } from "react";
import { parse, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import ciclosData from "@/mocks/ciclosHistorico.json";

interface Ciclo {
  id_ciclo: number;
  lote: string;
  fecha_inicio: string;
  fecha_fin: string;
  tiempo_transcurrido: string;
}

interface TablaCiclosProps {
  fechaInicio: string;
  fechaFin: string;
  equipoId: number;
  selectedCicloId?: number | null;
  onCicloSelect?: (ciclo: Ciclo) => void;
  onTableClose?: () => void;
}

const TablaCiclos: React.FC<TablaCiclosProps> = ({
  fechaInicio,
  fechaFin,
  equipoId,
  selectedCicloId,
  onCicloSelect,
  onTableClose,
}) => {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [selectedKeys, setSelectedKeys] = useState(
    new Set(selectedCicloId ? [selectedCicloId.toString()] : []),
  );

  const memoizedOnTableClose = useCallback(() => {
    onTableClose?.();
  }, [onTableClose]);

  useEffect(() => {
    const from = startOfDay(parse(fechaInicio, "yyyy-MM-dd", new Date()));
    const to = endOfDay(parse(fechaFin, "yyyy-MM-dd", new Date()));

    const filtered: Ciclo[] = ciclosData
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

    if (filtered.length === 0) {
      memoizedOnTableClose();
      toast.error("Error al obtener sus ciclos", {
        description: "No existen datos en el equipo/fecha ingresada",
        position: "bottom-right",
        id: `no-data-${fechaInicio}-${fechaFin}-${equipoId}`,
      });
    } else {
      const timer = setTimeout(() => {
        setCiclos(filtered);
        setSelectedKeys(new Set());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [fechaInicio, fechaFin, equipoId, memoizedOnTableClose]);

  return (
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
  );
};

export default TablaCiclos;
