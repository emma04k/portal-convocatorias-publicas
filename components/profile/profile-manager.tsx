"use client";

import { FormEvent, useEffect, useState } from "react";

type Profile = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  activity: {
    bookmarks: number;
    savedSearches: number;
  };
};

export function ProfileManager() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadProfile() {
    setIsLoading(true);
    const response = await fetch("/api/profile");
    if (!response.ok) {
      setMessage("No fue posible cargar tu perfil.");
      setIsLoading(false);
      return;
    }

    const body = (await response.json()) as { profile: Profile };
    setProfile(body.profile);
    setIsLoading(false);
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  async function updateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
      }),
    });

    if (!response.ok) {
      setMessage("No fue posible actualizar tu cuenta.");
      return;
    }

    setMessage("Perfil actualizado.");
    await loadProfile();
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        currentPassword: String(formData.get("currentPassword") ?? ""),
        newPassword: String(formData.get("newPassword") ?? ""),
      }),
    });

    setMessage(response.ok ? "Contraseña actualizada." : "No fue posible cambiar la contraseña.");
    if (response.ok) {
      event.currentTarget.reset();
    }
  }

  if (isLoading) {
    return <p>Cargando perfil...</p>;
  }

  if (!profile) {
    return <p>{message ?? "Perfil no disponible."}</p>;
  }

  return (
    <section className="stack" aria-labelledby="profile-title">
      <div className="content-card">
        <p className="eyebrow">Perfil</p>
        <h1 id="profile-title">Mi perfil</h1>
        <p>Administra tus datos de cuenta y revisa tu actividad en el portal.</p>
      </div>

      <div className="profile-stats">
        <article className="stat-card">
          <span>{profile.activity.bookmarks}</span>
          <p>Favoritos guardados</p>
        </article>
        <article className="stat-card">
          <span>{profile.activity.savedSearches}</span>
          <p>Búsquedas guardadas</p>
        </article>
      </div>

      {message ? <p className="form-message" role="status">{message}</p> : null}

      <div className="cards-grid">
        <section className="content-card">
          <h2>Datos de cuenta</h2>
          <form className="auth-form" onSubmit={updateAccount}>
            <label>
              Nombre
              <input defaultValue={profile.user.name} name="name" required type="text" />
            </label>
            <label>
              Email
              <input defaultValue={profile.user.email} name="email" required type="email" />
            </label>
            <button type="submit">Actualizar perfil</button>
          </form>
        </section>

        <section className="content-card">
          <h2>Cambiar contraseña</h2>
          <form className="auth-form" onSubmit={updatePassword}>
            <label>
              Contraseña actual
              <input name="currentPassword" required type="password" />
            </label>
            <label>
              Nueva contraseña
              <input minLength={8} name="newPassword" required type="password" />
            </label>
            <button type="submit">Cambiar contraseña</button>
          </form>
        </section>
      </div>
    </section>
  );
}
