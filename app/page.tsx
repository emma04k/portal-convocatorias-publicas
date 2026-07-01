import Link from "next/link";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";

export default function HomePage() {
  const isAuthenticated = Boolean(cookies().get(AUTH_COOKIE_NAME)?.value);

  return (
    <main className="page-shell">
      <section className="hero-layout" aria-labelledby="landing-title">
        <div className="hero-card hero-card-wide">
          <p className="eyebrow">Servicio público digital · Datos abiertos</p>
          <h1 id="landing-title">Portal de Convocatorias Públicas</h1>
          <p className="hero-summary">
            Explora convocatorias públicas colombianas desde datos.gov.co/SECOP,
            guarda favoritos y administra búsquedas frecuentes desde una cuenta segura.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" href="/convocatorias">Explorar convocatorias</Link>
            {!isAuthenticated ? (
              <>
                <Link className="button-secondary" href="/auth/register">Crear cuenta</Link>
                <Link className="button-ghost" href="/auth/login">Iniciar sesión</Link>
              </>
            ) : (
              <Link className="button-secondary" href="/profile">Ir a mi perfil</Link>
            )}
          </div>
        </div>

        <aside className="landing-stats" aria-label="Indicadores de confianza del portal">
          <article className="stat-card stat-card-compact">
            <span>SECOP II</span>
            <p>Fuente oficial consultada desde datos.gov.co.</p>
          </article>
          <article className="stat-card stat-card-compact">
            <span>24/7</span>
            <p>Búsqueda disponible para revisar oportunidades vigentes.</p>
          </article>
          <article className="stat-card stat-card-compact">
            <span>100%</span>
            <p>Enfoque en trazabilidad, filtros claros y seguimiento personal.</p>
          </article>
        </aside>
      </section>

      <section className="feature-grid" aria-label="Beneficios principales">
        <article className="feature-card">
          <h2>Transparencia para decidir mejor</h2>
          <p>Filtra por texto, entidad, estado y fechas para reducir ruido y comparar procesos relevantes.</p>
        </article>
        <article className="feature-card">
          <h2>Seguimiento personalizado</h2>
          <p>Guarda favoritos y búsquedas frecuentes para retomar oportunidades sin repetir trabajo manual.</p>
        </article>
        <article className="feature-card">
          <h2>Consulta responsable</h2>
          <p>Interfaz sobria, accesible y enfocada en información pública verificable, sin distracciones visuales.</p>
        </article>
      </section>
    </main>
  );
}
