"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SavedSearchItem = {
  id: string;
  name: string;
  query: string | null;
  entityName: string | null;
  status: string | null;
  dateFrom: string | null;
  dateTo: string | null;
};

function toConvocatoriasUrl(item: SavedSearchItem) {
  const params = new URLSearchParams();
  if (item.query) params.set("q", item.query);
  if (item.entityName) params.set("entity", item.entityName);
  if (item.status) params.set("status", item.status);
  if (item.dateFrom) params.set("dateFrom", item.dateFrom);
  if (item.dateTo) params.set("dateTo", item.dateTo);
  return `/convocatorias?${params.toString()}`;
}

export function SavedSearchesManager() {
  const [items, setItems] = useState<SavedSearchItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadSavedSearches() {
    setIsLoading(true);
    const response = await fetch("/api/saved-searches");
    if (!response.ok) {
      setMessage("No fue posible cargar tus búsquedas guardadas.");
      setIsLoading(false);
      return;
    }

    const body = (await response.json()) as { items: SavedSearchItem[] };
    setItems(body.items);
    setIsLoading(false);
  }

  useEffect(() => {
    void loadSavedSearches();
  }, []);

  async function deleteSavedSearch(item: SavedSearchItem) {
    const response = await fetch(`/api/saved-searches/${encodeURIComponent(item.id)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("No fue posible eliminar la búsqueda.");
      return;
    }

    setItems((current) => current.filter((savedSearch) => savedSearch.id !== item.id));
    setMessage("Búsqueda eliminada.");
  }

  return (
    <section className="stack" aria-labelledby="saved-searches-title">
      <div className="content-card">
        <p className="eyebrow">Búsquedas guardadas</p>
        <h1 id="saved-searches-title">Mis búsquedas</h1>
        <p>Ejecuta de nuevo tus filtros frecuentes o elimina búsquedas que ya no necesites.</p>
      </div>
      {message ? <p className="form-message" role="status">{message}</p> : null}
      {isLoading ? <p>Cargando búsquedas...</p> : null}
      {!isLoading && items.length === 0 ? <p>No tienes búsquedas guardadas todavía.</p> : null}
      <div className="cards-grid">
        {items.map((item) => (
          <article className="call-card" key={item.id}>
            <p className="eyebrow">{item.status ?? "Filtro guardado"}</p>
            <h2>{item.name}</h2>
            <p>{[item.query, item.entityName, item.dateFrom, item.dateTo].filter(Boolean).join(" · ") || "Sin filtros adicionales"}</p>
            <div className="card-actions">
              <Link className="button-secondary" href={toConvocatoriasUrl(item)}>Ejecutar búsqueda</Link>
              <button className="button-primary" onClick={() => deleteSavedSearch(item)} type="button">Eliminar búsqueda</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
