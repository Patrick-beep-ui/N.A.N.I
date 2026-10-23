import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "N.A.N.I.",
  description: "Neural Assistant for Navigation & Intelligence"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
