import { Convocatoria, SECOP_SOURCE, SecopRawRecord } from "@/lib/secop/types";

function cleanString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getUrl(value: SecopRawRecord["urlproceso"]): string | undefined {
  if (typeof value === "string") {
    return cleanString(value);
  }

  if (value && typeof value === "object") {
    return cleanString(value.url);
  }

  return undefined;
}

export function mapSecopRecord(record: SecopRawRecord): Convocatoria {
  const externalId = cleanString(record.id_del_proceso) ?? cleanString(record.referencia_del_proceso) ?? "unknown";
  const title =
    cleanString(record.nombre_del_procedimiento) ??
    cleanString(record.descripci_n_del_procedimiento) ??
    "Convocatoria sin título";
  const entityName = cleanString(record.entidad) ?? "Entidad no disponible";

  return {
    externalId,
    processNumber: cleanString(record.referencia_del_proceso),
    title,
    description: cleanString(record.descripci_n_del_procedimiento),
    entityName,
    status: cleanString(record.estado_resumen) ?? cleanString(record.estado_del_procedimiento),
    phase: cleanString(record.fase),
    publishedAt: cleanString(record.fecha_de_publicacion_del),
    basePrice: parseNumber(record.precio_base),
    contractingModality: cleanString(record.modalidad_de_contratacion),
    contractType: cleanString(record.tipo_de_contrato),
    department: cleanString(record.departamento_entidad),
    city: cleanString(record.ciudad_entidad),
    url: getUrl(record.urlproceso),
    source: SECOP_SOURCE,
    rawData: record,
  };
}
