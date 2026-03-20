import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

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
  equipo: string;
  selectedCicloId?: number | null;
  onCicloSelect?: (ciclo: Ciclo) => void;
  onTableClose?: () => void; // Añadir esta prop
}

const TablaCiclos: React.FC<TablaCiclosProps> = ({
  fechaInicio,
  fechaFin,
  equipo,
  selectedCicloId,
  onCicloSelect,
  onTableClose,
}) => {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_showTable, _setShowTable] = useState(true);
  // Inicializar selectedKeys con el ciclo actual si existe
  const [selectedKeys, setSelectedKeys] = useState(
    new Set(selectedCicloId ? [selectedCicloId.toString()] : []),
  );

  useEffect(() => {
    const fetchCiclos = async () => {
      setLoading(true);
      try {
        const host = process.env.NEXT_PUBLIC_WS_HOST;
        const port = process.env.NEXT_PUBLIC_WS_PORT;
        const url = `http://${host}:${port}/historico-graficos/${equipo}?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || error || !data || data.length === 0) {
          if (onTableClose) {
            onTableClose(); // Llamar a onTableClose cuando no hay datos
          }
          toast.error("Error al obtener sus ciclos", {
            description: "No existen datos en el equipo/fecha ingresada",
            position: "bottom-right",
            id: `no-data-${fechaInicio}-${fechaFin}-${equipo}`, // Unique ID based on parameters
          });

          return null;
        }

        setCiclos(data);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchCiclos();
  }, [fechaInicio, fechaFin, equipo]);

  useEffect(() => {
    if (selectedCicloId) {
      setSelectedKeys(new Set([selectedCicloId.toString()]));
    }
  }, [selectedCicloId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[150px] max-w-[600px]">
        <Spinner className="size-6" />
        <span className="ml-2 text-sm">Cargando ciclos...</span>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="max-h-[600px] overflow-y-auto overflow-x-hidden">
      <Table
        aria-label="Tabla de ciclos"
        className="min-w-[600px] bg-black/50 backdrop-blur-sm text-white"
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
