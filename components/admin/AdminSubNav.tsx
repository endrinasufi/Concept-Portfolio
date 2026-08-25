"use client";

export type AdminSubNavItem = {
  id: string;
  label: string;
  hint?: string;
};

export function AdminSubNav({
  items,
  active,
  onChange,
  title = "Sections",
}: {
  items: AdminSubNavItem[];
  active: string;
  onChange: (id: string) => void;
  title?: string;
}) {
  return (
    <nav className="lg:sticky lg:top-4" aria-label={title}>
      <p className="mb-2 hidden text-[10px] font-medium uppercase tracking-wider text-muted lg:block">
        {title}
      </p>
      <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {items.map((item) => {
          const on = active === item.id;
          return (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onChange(item.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                  on
                    ? "bg-[#1a1a1a] text-white"
                    : "bg-white/70 text-muted hover:text-foreground lg:bg-transparent"
                }`}
              >
                <span className="font-medium">{item.label}</span>
                {item.hint ? (
                  <span
                    className={`tabular-nums text-[11px] ${
                      on ? "text-white/55" : "text-muted"
                    }`}
                  >
                    {item.hint}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
