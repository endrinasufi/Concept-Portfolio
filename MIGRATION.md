# Migrimi IndexedDB → MySQL

## Kur duhet

Nëse ke krijuar përmbajtje në browser (Dexie `cma-portfolio-v1`) dhe do ta çosh në MySQL për production.

## Hapat

1. Konfiguro `.env.local` me MySQL + `AUTH_SECRET` + admin bootstrap
2. `npm run db:init`
3. `npm run dev` (ose deploy)
4. Hyr te `/admin/login`
5. Hap `/admin/migration` **në të njëjtin browser** ku ke IndexedDB
6. **Analizo** → kontrollo counts
7. **Shkarko backup JSON** (ruaje jashtë)
8. **Fillo migrimin**
   - Media blobs → `POST /api/admin/media` me të njëjtin `id`
   - Projekte / settings → UPSERT me të njëjtat ID
9. Shiko raportin; në dështime përdor **Retry**
10. Verifiko faqen publike dhe admin CRUD
11. IndexedDB **nuk fshihet** automatikisht — mund ta pastrosh manualisht nga DevTools nëse dëshiron

## Shënime

- Migrimi është idempotent (ON DUPLICATE / PATCH nëse ekziston)
- `NEXT_PUBLIC_USE_LOCAL_DATA=true` e kthen adminin te IndexedDB — vetëm për zhvillim lokal të vjetër
- Production: gjithmonë MySQL + API
