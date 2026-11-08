# Neon database migrations

Plain, hand-written SQL files. Nothing in the app runs these for you —
drizzle-kit's migration generator/runner is intentionally not used here.
Drizzle is wired up only as a typed query builder (see `src/lib/db`).

## Workflow

1. Write (or ask for a draft of) the next numbered file in `migrations/`,
   e.g. `0002_add_wishlists.sql`. Numbers are sequential and never reused.
2. Run it yourself against the Neon database — paste it into the Neon
   SQL editor, or run it with `psql "$NEON_DATABASE_URL" -f migrations/0002_add_wishlists.sql`.
3. Update `src/lib/db/schema.ts` by hand so the Drizzle schema matches
   what the database now looks like. There is no generator keeping these
   two in sync automatically.

## Env var

The app reads the connection string from `NEON_DATABASE_URL` (see
`.env.local.example`). This same var is what you'd point `psql` at.
