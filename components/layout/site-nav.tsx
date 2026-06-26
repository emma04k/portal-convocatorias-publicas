import Link from "next/link";
import { cookies } from "next/headers";
import { LogoutButton } from "@/components/auth/logout-button";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";

export function SiteNav() {
  const isAuthenticated = Boolean(cookies().get(AUTH_COOKIE_NAME)?.value);

  return (
    <header className="site-header">
      <Link className="brand-link" href="/" aria-label="Portal de Convocatorias Públicas">
        Portal Convocatorias
      </Link>
      <nav className="site-nav" aria-label="Navegación principal">
        <Link href="/convocatorias">Convocatorias</Link>
        {isAuthenticated ? (
          <>
            <Link href="/bookmarks">Favoritos</Link>
            <Link href="/saved-searches">Búsquedas</Link>
            <Link href="/profile">Perfil</Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/auth/login">Iniciar sesión</Link>
            <Link className="nav-cta" href="/auth/register">Crear cuenta</Link>
          </>
        )}
      </nav>
    </header>
  );
}
