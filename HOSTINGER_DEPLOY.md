# Deploy në Hostinger (Node.js / MySQL)

## Parakushtet

- Hosting me **Node.js** (Next.js) dhe **MySQL**
- Domain / SSL aktiv
- Credencialet e DB dhe Cloudinary (prod)

## 1. Variablat e mjedisit

Kopjo `.env.example` → `.env.local` (lokalisht) ose vendosi në panelin e Hostinger:

| Key | Shembull |
|-----|----------|
| `DB_HOST` | `localhost` ose hosti i MySQL |
| `DB_PORT` | `3306` |
| `DB_USER` | user MySQL |
| `DB_PASSWORD` | fjalëkalimi |
| `DB_NAME` | `cma_portfolio` |
| `AUTH_SECRET` | string i gjatë random |
| `ADMIN_EMAIL` | emaili i adminit të parë |
| `ADMIN_INITIAL_PASSWORD` | vetëm për bootstrap; ndryshoje pas login |
| `NEXT_PUBLIC_SITE_URL` | `https://domain.com` |
| `MEDIA_STORAGE_PROVIDER` | `cloudinary` (prod) |
| `CLOUDINARY_*` | cloud name, key, secret, folder |

Mos vendos `NEXT_PUBLIC_USE_LOCAL_DATA=true` në prod.

## 2. Schema MySQL

Nga makina lokale (ose SSH):

```bash
npm run db:init
```

Ose importo `database/schema.sql` në phpMyAdmin / MySQL client.

## 3. Build & start

```bash
npm ci
npm run build
npm start
```

Në Hostinger Node app: set **start command** `npm start`, **Node 20+**.

## 4. Bootstrap admin

1. Hap `https://domain.com/admin/login`
2. Hyr me `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD`
3. Nëse tabela `admin_users` është bosh, useri krijohet automatikisht
4. Ndrysho fjalëkalimin te **Settings**
5. Opsionalisht hiq / zbraz `ADMIN_INITIAL_PASSWORD` nga env

## 5. Media

- Prod: `MEDIA_STORAGE_PROVIDER=cloudinary`
- Dev: `local` → skedarët në `storage/uploads`, URL `/api/media/:id`

## 6. Cache / revalidim

Mutacionet e adminit thërrasin `revalidatePath` për rrugët publike. Nëse Hostinger ka CDN cache shtesë, pastroje pas publish.

## Troubleshooting

- **Login 500 bootstrap**: mungojnë `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD` dhe nuk ka user në DB
- **Faqe publike bosh**: DB e zbrazët — përdor `/admin/migration` ose krijo projekte
- **Media 404**: kontrollo Cloudinary keys ose `storage/uploads`
