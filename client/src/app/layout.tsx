import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Themis - Asistente de IA",
  description: "Themis Chatbot - Tu asistente de inteligencia artificial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}