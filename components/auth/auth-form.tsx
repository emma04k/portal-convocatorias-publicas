"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";
  const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      ...(isRegister ? { name: String(formData.get("name") ?? "") } : {}),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "No fue posible completar la autenticación.");
        return;
      }

      window.location.assign("/convocatorias");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <p className="eyebrow">Acceso al portal</p>
      <h1 id="auth-title">{isRegister ? "Crear cuenta" : "Iniciar sesión"}</h1>
      <p>
        {isRegister
          ? "Crea una cuenta para guardar convocatorias y búsquedas frecuentes."
          : "Ingresa para consultar tus favoritos y búsquedas guardadas."}
      </p>
      <form className="auth-form" data-endpoint={endpoint} onSubmit={handleSubmit}>
        {isRegister ? (
          <label>
            Nombre
            <input autoComplete="name" name="name" required type="text" />
          </label>
        ) : null}
        <label>
          Email
          <input autoComplete="email" name="email" required type="email" />
        </label>
        <label>
          Contraseña
          <input autoComplete={isRegister ? "new-password" : "current-password"} name="password" required type="password" />
        </label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Enviando..." : isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </button>
      </form>
      <p className="auth-switch">
        {isRegister ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
        <Link href={isRegister ? "/auth/login" : "/auth/register"}>
          {isRegister ? "Iniciar sesión" : "Crear cuenta"}
        </Link>
      </p>
    </section>
  );
}
