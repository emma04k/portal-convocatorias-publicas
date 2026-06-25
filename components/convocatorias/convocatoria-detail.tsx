"use client";

import { useEffect, useState } from "react";
import type { Convocatoria } from "@/lib/secop/types";

type ConvocatoriaDetailProps = {
  externalId: string;
};

export function ConvocatoriaDetail({ externalId }: ConvocatoriaDetailProps) {
  const [item, setItem] = useState<Convocatoria | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    fetch(`/api/convocatorias/${encodeURIComponent(externalId)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No fue posible cargar el detalle.");
        }
        return response.json() as Promise<{ item: Convocatoria }>;
      })
      .then((data) => {
        if (isActive) {
          setItem(data.item);
        }
      })
      .catch((error: Error) => {
        if (isActive) {
          setMessage(error.message);
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
  }, [externalId]);

  async function saveBookmark() {
    if (!item) {
      return;
    }

    const response = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        externalId: item.externalId,
        source: item.source,
        title: item.title,
        entityName: item.entityName,
        status: item.status,
        processNumber: item.processNumber,
        url: item.url,
        rawData: item.rawData,
      }),
    });

    setMessage(response.ok ? "Favorito guardado." : "No fue posible guardar el favorito.");
  }

  if (isLoading) {
    return <p>Cargando detalle...</p>;
  }

  if (!item) {
    return <p>{message ?? "Convocatoria no encontrada."}</p>;
  }

  return (
    <article className="content-card detail-card">
      <p className="eyebrow">{item.status ?? "Detalle SECOP"}</p>
      <h1>{item.title}</h1>
      <p>{item.description ?? "Sin descripción adicional."}</p>
      <dl className="detail-list">
        <div><dt>Entidad</dt><dd>{item.entityName}</dd></div>
        <div><dt>Proceso</dt><dd>{item.processNumber ?? item.externalId}</dd></div>
        <div><dt>Modalidad</dt><dd>{item.contractingModality ?? "No disponible"}</dd></div>
        <div><dt>Tipo de contrato</dt><dd>{item.contractType ?? "No disponible"}</dd></div>
        <div><dt>Ubicación</dt><dd>{[item.city, item.department].filter(Boolean).join(", ") || "No disponible"}</dd></div>
      </dl>
      <div className="card-actions">
        <button className="button-primary" onClick={saveBookmark} type="button">Guardar favorito</button>
        {item.url ? <a className="button-secondary" href={item.url} rel="noreferrer" target="_blank">Abrir fuente SECOP</a> : null}
      </div>
      {message ? <p className="form-message" role="status">{message}</p> : null}
    </article>
  );
}
