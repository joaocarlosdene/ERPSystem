import type { Metadata } from "next";
import Login from "./(public)/login/page"
import "./globals.css";


export const metadata: Metadata = {
  title: "ERP SYSTEM",
  description: "ERP System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
