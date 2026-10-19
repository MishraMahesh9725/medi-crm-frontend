import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediBill",
  description: "Billing and inventory for medical stores",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F3F7F6] text-[#1F2D2B] font-sans">{children}</body>
    </html>
  );
}
