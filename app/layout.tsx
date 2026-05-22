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
  title: "Sales Web",
  description: "Sistema de vendas simples e eficiente",
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
