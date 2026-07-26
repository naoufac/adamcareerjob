import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADAMJOBS",
  description:
    "Adaptation automatique de CV et lettres d'accompagnement pour le marche canadien.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
