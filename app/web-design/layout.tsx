import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-wd-sans",
  subsets: ["latin"],
  display: "swap",
});

export default function WebDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} [font-family:var(--font-wd-sans)]`}>
      {children}
    </div>
  );
}
