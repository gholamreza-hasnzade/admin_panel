import type { Metadata } from "next";
import { QueryProvider } from "@repo/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyMedu — پنل مدیریت",
  description: "پنل مدیریت MyMedu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="font-sans">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
