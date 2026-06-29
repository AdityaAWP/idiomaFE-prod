import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/app/context/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "IdiomaMate - Connect, Speak, Grow",
  description:
    "Practice languages with native speakers through real-time video conversations. Find partners, join lobbies, and grow your fluency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
