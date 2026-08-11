# Concept Marketing Albania — Branding Portfolio V1

Portfolio CMS lokal për projekte **branding** (Next.js App Router + IndexedDB).

## Niisja

```bash
npm install
npm run dev
```

Hap [http://localhost:3000](http://localhost:3000).

## Rrugët kryesore

| Route | Përshkrim |
|---|---|
| `/` | Homepage |
| `/branding` | Lista e projekteve të publikuara |
| `/branding/[slug]` | Faqja e projektit |
| `/branding/[slug]?preview=true` | Preview (përfshin draft) |
| `/admin` | Dashboard CMS (pa auth) |
| `/admin/branding` | CRUD + DnD |
| `/admin/branding/new` | Projekt i ri |
| `/admin/branding/[id]` | Editor |
| `/admin/media` | Media lokale |
| `/admin/settings` | Placeholder |

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Motion, Lucide, @dnd-kit
- Dexie / IndexedDB (`LocalProjectRepository`, `LocalMediaRepository`)

## Shënime

- Të dhënat jetojnë në browser; refresh i mban.
- Draft-et nuk shfaqen publikisht pa `?preview=true`.
- Seed: 3 projekte fiktionale (2 / 4 / 5 ngjyra); një është draft.
