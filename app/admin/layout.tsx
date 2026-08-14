import type { Metadata } from "next";
import { Inter } from "next/font/google";

const adminSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-admin-sans",
});

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${adminSans.variable} ${adminSans.className} admin-ui antialiased`}
    >
      {children}
    </div>
  );
}

