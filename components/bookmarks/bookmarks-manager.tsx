"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BookmarkItem = {
  id: string;
  externalId: string;
  source: string;
  title: string;
  entityName: string;
  status: string | null;
  processNumber: string | null;
  url: string | null;
  createdAt: string;
};

export function BookmarksManager() {
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadBookmarks() {
    setIsLoading(true);
    const response = await fetch("/api/bookmarks");
    if (!response.ok) {
      setMessage("No fue posible cargar tus favoritos.");
      setIsLoading(false);
      return;
    }

    const body = (await response.json()) as { items: BookmarkItem[] };
    setItems(body.items);
    setIsLoading(false);
  }

  useEffect(() => {
    void loadBookmarks();
  }, []);

  async function deleteBookmark(item: BookmarkItem) {
    const response = await fetch(`/api/bookmarks/${encodeURIComponent(item.externalId)}?source=${encodeURIComponent(item.source)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("No fue posible eliminar el favorito.");
      return;
    }

    setItems((current) => current.filter((bookmark) => bookmark.id !== item.id));
    setMessage("Favorito eliminado.");
  }

  return (
    <section className="stack" aria-labelledby="bookmarks-title">
      <div className="content-card">
        <p className="eyebrow">Favoritos</p>
        <h1 id="bookmarks-title">Mis favoritos</h1>
        <p>Consulta y administra las convocatorias guardadas desde tu cuenta.</p>
      </div>
      {message ? <p className="form-message" role="status">{message}</p> : null}
      {isLoading ? <p>Cargando favoritos...</p> : null}
      {!isLoading && items.length === 0 ? <p>No tienes favoritos guardados todavía.</p> : null}
      <div className="cards-grid">
        {items.map((item) => (
          <article className="call-card" key={item.id}>
            <p className="eyebrow">{item.status ?? item.source}</p>
            <h2>{item.title}</h2>
            <p>{item.entityName}</p>
            <div className="card-actions">
              <Link className="button-secondary" href={`/convocatorias/${encodeURIComponent(item.externalId)}`}>Ver detalle</Link>
              {item.url ? <a className="button-ghost" href={item.url} rel="noreferrer" target="_blank">Fuente SECOP</a> : null}
              <button className="button-primary" onClick={() => deleteBookmark(item)} type="button">Eliminar favorito</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
