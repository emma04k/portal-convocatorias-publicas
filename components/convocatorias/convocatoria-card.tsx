import Link from "next/link";
import type { Convocatoria } from "@/lib/secop/types";

type ConvocatoriaCardProps = {
  convocatoria: Convocatoria;
  onBookmark?: (convocatoria: Convocatoria) => Promise<void> | void;
};

function formatCurrency(value?: number) {
  if (value === undefined) {
    return "Valor no disponible";
  }

  return new Intl.NumberFormat("es-CO", {
    currency: "COP",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function ConvocatoriaCard({ convocatoria, onBookmark }: ConvocatoriaCardProps) {
  return (
    <article className="call-card">
      <div className="card-kicker">
        <span className="status-badge">{convocatoria.status ?? "Estado no disponible"}</span>
        <span>SECOP II</span>
      </div>
      <div>
        <h2>{convocatoria.title}</h2>
        <p>{convocatoria.entityName}</p>
      </div>
      <dl className="call-meta">
        <div>
          <dt>Proceso</dt>
          <dd>{convocatoria.processNumber ?? convocatoria.externalId}</dd>
        </div>
        <div>
          <dt>Valor base</dt>
          <dd>{formatCurrency(convocatoria.basePrice)}</dd>
        </div>
        <div>
          <dt>Publicado</dt>
          <dd>{convocatoria.publishedAt?.slice(0, 10) ?? "Sin fecha"}</dd>
        </div>
      </dl>
      <div className="card-actions">
        <Link className="button-secondary" href={`/convocatorias/${encodeURIComponent(convocatoria.externalId)}`}>
          Ver detalle
        </Link>
        {convocatoria.url ? (
          <a className="button-ghost" href={convocatoria.url} rel="noreferrer" target="_blank">
            Fuente SECOP
          </a>
        ) : null}
        <button className="button-primary" onClick={() => onBookmark?.(convocatoria)} type="button">
          Guardar favorito
        </button>
      </div>
    </article>
  );
}
