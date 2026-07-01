"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ConvocatoriaCard } from "@/components/convocatorias/convocatoria-card";
import type { Convocatoria, ConvocatoriaListResult } from "@/lib/secop/types";

export type Filters = {
  q: string;
  entity: string;
  status: string;
  dateFrom: string;
  dateTo: string;
};

const INITIAL_FILTERS: Filters = {
  q: "",
  entity: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

const PAGE_SIZE = 12;

function normalizeInitialFilters(initialFilters?: Partial<Filters>): Filters {
  return {
    q: initialFilters?.q ?? "",
    entity: initialFilters?.entity ?? "",
    status: initialFilters?.status ?? "",
    dateFrom: initialFilters?.dateFrom ?? "",
    dateTo: initialFilters?.dateTo ?? "",
  };
}

function toQuery(filters: Filters, offset: number) {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });

  Object.entries(filters).forEach(([key, value]) => {
    if (value.trim()) {
      params.set(key, value.trim());
    }
  });

  return params;
}

type ConvocatoriasBrowserProps = {
  initialFilters?: Partial<Filters>;
};

export function ConvocatoriasBrowser({ initialFilters }: ConvocatoriasBrowserProps) {
  const [filters, setFilters] = useState<Filters>(() => normalizeInitialFilters(initialFilters));
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<Convocatoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const query = useMemo(() => toQuery(filters, offset), [filters, offset]);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setMessage(null);

    fetch(`/api/convocatorias?${query.toString()}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No fue posible cargar convocatorias.");
        }
        return response.json() as Promise<ConvocatoriaListResult>;
      })
      .then((data) => {
        if (isActive) {
          setItems(data.items);
        }
      })
      .catch((error: Error) => {
        if (isActive) {
          setMessage(error.message);
          setItems([]);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [query]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFilters({
      q: String(formData.get("q") ?? ""),
      entity: String(formData.get("entity") ?? ""),
      status: String(formData.get("status") ?? ""),
      dateFrom: String(formData.get("dateFrom") ?? ""),
      dateTo: String(formData.get("dateTo") ?? ""),
    });
    setOffset(0);
  }

  function handleFilterChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.currentTarget;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleClearFilters() {
    setFilters(INITIAL_FILTERS);
    setOffset(0);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/convocatorias");
    }
  }

  async function saveBookmark(convocatoria: Convocatoria) {
    const response = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        externalId: convocatoria.externalId,
        source: convocatoria.source,
        title: convocatoria.title,
        entityName: convocatoria.entityName,
        status: convocatoria.status,
        processNumber: convocatoria.processNumber,
        url: convocatoria.url,
        rawData: convocatoria.rawData,
      }),
    });

    setMessage(response.ok ? "Favorito guardado." : "No fue posible guardar el favorito.");
  }

  async function saveSearch() {
    const response = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: filters.q || filters.entity || "Búsqueda de convocatorias",
        query: filters.q || undefined,
        entityName: filters.entity || undefined,
        status: filters.status || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        filters,
      }),
    });

    setMessage(response.ok ? "Búsqueda guardada." : "No fue posible guardar la búsqueda.");
  }

  return (
    <section className="stack" aria-labelledby="convocatorias-title">
      <div className="content-card">
        <p className="eyebrow">SECOP II / datos.gov.co</p>
        <h1 id="convocatorias-title">Explorar convocatorias</h1>
        <form className="filters-form" onSubmit={handleSubmit}>
          <div className="filters-fields">
            <label>
              Texto libre
              <input name="q" onChange={handleFilterChange} placeholder="Objeto, código o palabra clave" type="search" value={filters.q} />
            </label>
            <label>
              Entidad
              <input name="entity" onChange={handleFilterChange} placeholder="Ej. DANE" type="text" value={filters.entity} />
            </label>
            <label>
              Estado
              <input name="status" onChange={handleFilterChange} placeholder="Ej. Presentación de oferta" type="text" value={filters.status} />
            </label>
            <label>
              Desde
              <input name="dateFrom" onChange={handleFilterChange} type="date" value={filters.dateFrom} />
            </label>
            <label>
              Hasta
              <input name="dateTo" onChange={handleFilterChange} type="date" value={filters.dateTo} />
            </label>
          </div>
          <div className="form-actions">
            <button className="button-primary" type="submit">Buscar</button>
            <button className="button-secondary" onClick={handleClearFilters} type="button">Limpiar filtros</button>
            <button className="button-secondary" onClick={saveSearch} type="button">Guardar búsqueda</button>
          </div>
        </form>
        {message ? <p className="form-message" role="status">{message}</p> : null}
      </div>

      <div className="results-toolbar">
        <button className="button-secondary" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))} type="button">
          Anterior
        </button>
        <span>Página {Math.floor(offset / PAGE_SIZE) + 1}</span>
        <button className="button-secondary" disabled={items.length < PAGE_SIZE} onClick={() => setOffset(offset + PAGE_SIZE)} type="button">
          Siguiente
        </button>
      </div>

      {isLoading ? <p className="loading-state" aria-live="polite">Cargando convocatorias...</p> : null}
      {!isLoading && items.length === 0 ? (
        <div className="empty-state" aria-live="polite">
          <p>No se encontraron convocatorias con esos filtros.</p>
          <p>Prueba ampliar el rango de fechas o usar una palabra clave más general.</p>
        </div>
      ) : null}
      <div className="cards-grid">
        {items.map((convocatoria) => (
          <ConvocatoriaCard convocatoria={convocatoria} key={convocatoria.externalId} onBookmark={saveBookmark} />
        ))}
      </div>
    </section>
  );
}
