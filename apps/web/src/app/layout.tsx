import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

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
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
