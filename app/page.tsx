import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-card hero-card-wide">
        <p className="eyebrow">Reto AI-First · Fase 1</p>
        <h1>Portal de Convocatorias Públicas</h1>
        <p>
          Explora convocatorias públicas colombianas desde datos.gov.co/SECOP,
          guarda favoritos y administra búsquedas frecuentes desde una cuenta segura.
        </p>
        <div className="hero-actions">
          <Link className="button-primary" href="/convocatorias">Explorar convocatorias</Link>
          <Link className="button-secondary" href="/auth/register">Crear cuenta</Link>
          <Link className="button-ghost" href="/auth/login">Iniciar sesión</Link>
        </div>
      </section>
    </main>
  );
}
