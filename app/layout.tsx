import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal de Convocatorias Públicas",
  description: "Portal AI-First para explorar convocatorias públicas colombianas desde datos.gov.co/SECOP.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
