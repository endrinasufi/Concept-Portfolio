import { Syne, DM_Sans } from "next/font/google";

const syne = Syne({
  variable: "--font-sm-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-sm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export default function SocialMediaLayout({ children }: LayoutProps<"/social-media">) {
  return (
    <div
      className={`${syne.variable} ${dmSans.variable} [font-family:var(--font-sm-sans)]`}
    >
      {children}
    </div>
  );
}
