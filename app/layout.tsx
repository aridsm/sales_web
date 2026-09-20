import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import AppDialog from "./components/AppDialog";
import ColorModeScript from "./components/ColorModeScript";
import LocaleScript from "./components/LocaleScript";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SalesApp | Gestão de Vendas",
  description: "Sistema de gestão de vendas, produtos e despesas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${figtree.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ColorModeScript />
        <LocaleScript />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <AppDialog />
      </body>
    </html>
  );
}
