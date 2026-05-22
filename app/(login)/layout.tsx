import { Figtree } from "next/font/google";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${figtree.className} min-h-screen flex items-center justify-center bg-background transition-colors`}>
      {children}
    </div>
  );
}
