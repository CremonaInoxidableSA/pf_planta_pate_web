export interface HistorialItem {
  id_historial: number;
  tiempo: string;
  temp_agua: number;
  temp_prod?: number;
  temp_ingreso?: number;
  niv_agua: number;
  estado: string;
}

export interface PuntoTiempo {
  x: number;
  y: number;
}
