# Concept Marketing Albania — Portfolio CMS

Portfolio multi-service (branding, social media, web design, video, photoshooting) me **Next.js App Router**, **MySQL** dhe admin të autentikuar.

## Niisja (dev)

```bash
npm install
cp .env.example .env.local
# plotëso DB_* , AUTH_SECRET, ADMIN_*
npm run db:init
npm run dev
```

Hap [http://localhost:3000](http://localhost:3000) dhe [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## Rrugët kryesore

| Route | Përshkrim |
|---|---|
| `/` | Homepage (SSR) |
| `/branding`, `/social-media`, `/web-design`, `/photoshooting` | Lista publike |
| `…/[slug]?preview=true` | Draft preview (vetëm me sesion admin) |
| `/video-production/social` · `/production` | Video |
| `/admin/login` | Login |
| `/admin/*` | CMS (cookie session) |
| `/admin/migration` | Migrim IndexedDB → MySQL |

## Stack

- Next.js 16 + React 19 + TypeScript
- MySQL (`mysql2`) + repository pattern
- Media: local uploads (dev) / Cloudinary (prod)
- Auth: bcrypt + sesione HttpOnly
- IndexedDB (Dexie) vetëm legacy / migration

## Dokumente

- [HOSTINGER_DEPLOY.md](HOSTINGER_DEPLOY.md)
- [MIGRATION.md](MIGRATION.md)
- `.env.example`

## Shënime

- Publiku lexon MySQL nga Server Components.
- Admin shkruan përmes `/api/admin/*`.
- `NEXT_PUBLIC_USE_LOCAL_DATA=true` (vetëm dev) kthen adminin te IndexedDB.
