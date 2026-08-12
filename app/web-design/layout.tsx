import { Outfit } from "next/font/google";

const outfit = Outfit({
  variable: "--font-wd-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default function WebDesignLayout({
  children,
}: LayoutProps<"/web-design">) {
  return (
    <div className={`${outfit.variable} [font-family:var(--font-wd-sans)]`}>
      {children}
    </div>
  );
}
