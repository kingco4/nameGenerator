import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NAMEIT — Business Name Generator",
  description:
    "Generate bold, creative business name ideas powered by AI. Describe your business and get 8 unique name ideas instantly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
