export interface Alarma {
  key: string;
  name: string;
  description: string;
  type: string;
  time: string;
  timeEnd: string;
}

export interface AlarmaData {
  id: number;
  nombre_alarmas: string;
  descripcion: string;
  tipo_alarma: string;
  seccion: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export type ColumnKey = "name" | "description" | "type" | "time" | "timeEnd";
