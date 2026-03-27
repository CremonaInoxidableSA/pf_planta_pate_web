export interface Alerta {
  key: string;
  description: string;
  type: string;
  state: string;
  time: string;
}

export interface AlarmaData {
  id_alarma: number;
  descripcion: string;
  tipo: string;
  estadoAlarma: boolean;
  fecha_registro: string;
}

export type ColumnKey = "description" | "type" | "state" | "time";
