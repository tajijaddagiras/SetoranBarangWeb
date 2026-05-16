import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Setor Barang - Sistem Manajemen Setoran",
  description: "Aplikasi manajemen setoran barang untuk tracking nasabah dan pembayaran",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <Providers>{children}</Providers>
        <div id="print-area"></div>
      </body>
    </html>
  );
}
