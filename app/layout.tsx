import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/layout/site-nav";

export const metadata: Metadata = {
  title: "Portal de Convocatorias Públicas",
  description: "Portal AI-First para explorar convocatorias públicas colombianas desde datos.gov.co/SECOP.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
