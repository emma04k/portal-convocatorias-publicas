import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

export function SiteNav() {
  return (
    <header className="site-header">
      <Link className="brand-link" href="/" aria-label="Portal de Convocatorias Públicas">
        Portal Convocatorias
      </Link>
      <nav className="site-nav" aria-label="Navegación principal">
        <Link href="/convocatorias">Convocatorias</Link>
        <Link href="/bookmarks">Favoritos</Link>
        <Link href="/saved-searches">Búsquedas</Link>
        <Link href="/profile">Perfil</Link>
        <Link href="/auth/login">Iniciar sesión</Link>
        <Link className="nav-cta" href="/auth/register">Crear cuenta</Link>
        <LogoutButton />
      </nav>
    </header>
  );
}
