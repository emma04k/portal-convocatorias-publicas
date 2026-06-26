import { ConvocatoriaListResult, SecopRawRecord } from "@/lib/secop/types";
import { ConvocatoriaQuery } from "@/lib/validators/convocatorias";
import { mapSecopRecord } from "@/lib/secop/mapper";

const SECOP_DATASET_URL = "https://www.datos.gov.co/resource/p6dx-8zbt.json";

type FetchLike = (input: string, init?: RequestInit) => Promise<Pick<Response, "ok" | "status" | "json">>;

function escapeSoqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function buildContainsClause(column: string, value: string): string {
  return `lower(${column}) like '%${escapeSoqlLiteral(value.toLowerCase())}%'`;
}

function buildWhere(filters: Pick<ConvocatoriaQuery, "entity" | "status" | "dateFrom" | "dateTo">): string | null {
  const clauses: string[] = [];

  if (filters.entity) {
    clauses.push(buildContainsClause("entidad", filters.entity));
  }

  if (filters.status) {
    clauses.push(buildContainsClause("estado_resumen", filters.status));
  }

  if (filters.dateFrom) {
    clauses.push(`fecha_de_publicacion_del >= '${filters.dateFrom}T00:00:00'`);
  }

  if (filters.dateTo) {
    clauses.push(`fecha_de_publicacion_del <= '${filters.dateTo}T23:59:59'`);
  }

  return clauses.length > 0 ? clauses.join(" AND ") : null;
}

async function requestSecopRecords(url: URL, fetcher: FetchLike): Promise<SecopRawRecord[]> {
  const response = await fetcher(url.toString(), { headers: { accept: "application/json" } });

  if (!response.ok) {
    throw new Error(`SECOP upstream request failed with status ${response.status}`);
  }

  const json = await response.json();
  if (!Array.isArray(json)) {
    throw new Error("SECOP upstream returned an invalid payload");
  }

  return json as SecopRawRecord[];
}

export async function fetchConvocatorias(
  filters: ConvocatoriaQuery,
  fetcher: FetchLike = fetch,
): Promise<ConvocatoriaListResult> {
  const url = new URL(SECOP_DATASET_URL);
  url.searchParams.set("$limit", String(filters.limit));
  url.searchParams.set("$offset", String(filters.offset));
  url.searchParams.set("$order", "fecha_de_publicacion_del DESC");

  if (filters.q) {
    url.searchParams.set("$q", filters.q);
  }

  const where = buildWhere(filters);
  if (where) {
    url.searchParams.set("$where", where);
  }

  const records = await requestSecopRecords(url, fetcher);

  return {
    items: records.map(mapSecopRecord),
    pagination: {
      limit: filters.limit,
      offset: filters.offset,
      count: records.length,
    },
  };
}

export async function fetchConvocatoriaByExternalId(
  externalId: string,
  fetcher: FetchLike = fetch,
) {
  const url = new URL(SECOP_DATASET_URL);
  url.searchParams.set("$limit", "1");
  url.searchParams.set("$where", `id_del_proceso = '${escapeSoqlLiteral(externalId)}'`);

  const records = await requestSecopRecords(url, fetcher);
  return records[0] ? mapSecopRecord(records[0]) : null;
}
