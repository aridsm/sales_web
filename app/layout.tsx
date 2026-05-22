import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import AppDialog from "./components/AppDialog";
import ColorModeScript from "./components/ColorModeScript";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kivo — Gestão de Vendas",
  description: "Sistema de gestão de vendas, produtos e despesas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ColorModeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        <AppDialog />
      </body>
    </html>
  );
}
