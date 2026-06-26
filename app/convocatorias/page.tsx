import { ConvocatoriasBrowser, type Filters } from "@/components/convocatorias/convocatorias-browser";

type ConvocatoriasSearchParams = {
  q?: string | string[];
  entity?: string | string[];
  status?: string | string[];
  dateFrom?: string | string[];
  dateTo?: string | string[];
};

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ConvocatoriasPage({ searchParams }: { searchParams: ConvocatoriasSearchParams }) {
  const initialFilters: Partial<Filters> = {
    q: firstSearchParam(searchParams.q),
    entity: firstSearchParam(searchParams.entity),
    status: firstSearchParam(searchParams.status),
    dateFrom: firstSearchParam(searchParams.dateFrom),
    dateTo: firstSearchParam(searchParams.dateTo),
  };

  return (
    <main className="content-shell">
      <ConvocatoriasBrowser initialFilters={initialFilters} />
    </main>
  );
}
