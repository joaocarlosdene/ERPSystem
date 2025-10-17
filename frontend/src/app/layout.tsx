import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
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
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: "#333", color: "#fff" },
          }}
        />
      </body>
    </html>
  );
}
