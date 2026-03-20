interface BaseSectorIO {
  bomba_recirculacion: boolean;
  entrada_agua: boolean;
  filtro_succion_agua: boolean;
  tapa_estado: boolean;
  tapa_estado_acc: string;
}

interface CocinaSectorIO extends BaseSectorIO {
  tipo: "cocina";
  vapor_serpentina: boolean;
  vapor_serpentina_acc: boolean;
  vapor_vivo: boolean;
  vapor_vivo_acc: boolean;
}

interface EnfriadorSectorIO extends BaseSectorIO {
  tipo: "enfriador";
  valvula_amoniaco: boolean;
  vapor_serpentina_acc: boolean;
  vapor_vivo_lim: boolean;
  vapor_vivo_lim_acc: boolean;
}

export type SectorIOType = CocinaSectorIO | EnfriadorSectorIO;
