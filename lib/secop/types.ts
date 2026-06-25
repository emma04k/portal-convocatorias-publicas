export const SECOP_SOURCE = "SECOP_II" as const;

export type SecopRawRecord = Record<string, unknown> & {
  id_del_proceso?: string;
  referencia_del_proceso?: string;
  nombre_del_procedimiento?: string;
  descripci_n_del_procedimiento?: string;
  entidad?: string;
  estado_resumen?: string;
  estado_del_procedimiento?: string;
  fase?: string;
  fecha_de_publicacion_del?: string;
  precio_base?: string | number;
  modalidad_de_contratacion?: string;
  tipo_de_contrato?: string;
  departamento_entidad?: string;
  ciudad_entidad?: string;
  urlproceso?: { url?: string } | string;
};

export type Convocatoria = {
  externalId: string;
  processNumber?: string;
  title: string;
  description?: string;
  entityName: string;
  status?: string;
  phase?: string;
  publishedAt?: string;
  basePrice?: number;
  contractingModality?: string;
  contractType?: string;
  department?: string;
  city?: string;
  url?: string;
  source: typeof SECOP_SOURCE;
  rawData: SecopRawRecord;
};

export type ConvocatoriaListResult = {
  items: Convocatoria[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
};
