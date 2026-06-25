"use client";

import { useState } from "react";

export function LogoutButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.assign("/");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button className="nav-button" disabled={isSubmitting} onClick={handleLogout} type="button">
      {isSubmitting ? "Cerrando..." : "Cerrar sesión"}
    </button>
  );
}
