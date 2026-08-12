import Link from "next/link";

export const metadata = {
  title: "Web Design",
  description: "Web Design portfolio — Concept Marketing Albania",
};

export default function WebDesignIndexPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-5 pt-[var(--header-offset)] pb-24 md:px-8">
      <p className="text-xs uppercase tracking-[0.28em] text-muted">Shërbim</p>
      <h1 className="font-display mt-3 text-4xl leading-tight md:text-6xl">
        Web Design
      </h1>
      <p className="mt-5 max-w-xl text-muted">
        Kjo kategori është në përgatitje. Së shpejti këtu do të shfaqen projektet
        e web design.
      </p>
      <Link
        href="/"
        className="mt-8 w-fit rounded-full border border-border px-6 py-2.5 text-sm text-muted transition hover:border-foreground/40 hover:text-foreground"
      >
        ← Kthehu në kreun
      </Link>
    </div>
  );
}
