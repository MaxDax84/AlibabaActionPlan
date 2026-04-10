# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build + TypeScript check (always run before committing)
npm run lint     # ESLint
```

There are no automated tests.

## Environment

Two variables required in `.env.local` (never committed):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only routes)

## Architecture

**Stack:** Next.js 16 App Router · TypeScript · Tailwind CSS · Shadcn/UI · Supabase (PostgreSQL) · ExcelJS

**No authentication.** Anyone with the URL can read and edit. Supabase RLS policies use `USING (true)`.

### Data model (`src/lib/types.ts`)

`Action` — the core entity:
- `stage` — one of 4 fixed sections (see `STAGES` in constants)
- `domain` — sub-category within a section (see `DOMAINS` in constants)
- `task_id` — auto-generated server-side on POST (e.g. `BA_01`), never editable in UI
- `status` — `true` = done but still visible in Active tab (not yet archived)
- `archived` — `true` = moved to Archive tab

`FilterState` uses `string[]` for `owner`, `domain`, `stage` (multi-select).

### State management (`src/hooks/useActions.ts`)

`useActions()` loads **all** actions (active + archived) in parallel on mount and stores them in a single React state array. All CRUD operations are **optimistic** — local state updates immediately, API fires in background, rolls back on error.

`useFilteredActions()` filters client-side from that single array — no re-fetching on tab switch.

Auto-versioning: a 5-minute debounce timer fires `POST /api/versions` after the last mutation, saving a full DB snapshot.

### API routes (`src/app/api/`)

All routes call `getSupabase()` at request time (not module load) to avoid build-time errors.

- `GET/POST /api/actions` — list (filtered by `archived`) / create (auto-generates `task_id`)
- `PATCH/DELETE /api/actions/[id]` — update / delete
- `GET/POST /api/versions` — list last 20 snapshots / save new snapshot
- `POST /api/versions/[id]/restore` — replace all actions with snapshot contents

### UI structure

**`src/app/page.tsx`** — single page; owns all state. Active tab always shows `GroupedActionTable`; Archive always shows `GroupedActionTable` with `showArchived`. The flat/grouped toggle was removed.

**`src/components/action-table/`**
- `ActionRow` — desktop `<tr>` + `ActionCard` (mobile card, shown below `md` breakpoint). Both support inline editing of all fields except `task_id`.
- `GroupedActionTable` — single `<table>` with one `<thead>` and one `<tbody>` per section. On mobile renders card list instead. Collapse state is local.
- `ActionTable` — flat variant, kept for potential future use.

**Responsive layout:** below `md`, the table is hidden (`hidden md:block`) and replaced with `md:hidden` card layout. No horizontal scrolling.

**Sticky header:** `TableHeader` uses `sticky top-16 z-10`. This requires the `Table` wrapper div to use `overflow-visible` (not `overflow-auto`) — see `src/components/ui/table.tsx`.

**Dropdown portaling:** `OwnerFilter` and `QuarterMultiSelect` use `@radix-ui/react-portal` with `getBoundingClientRect` positioning to escape table overflow clipping. Stage/Domain selectors use Radix `Popover` (already portaled).

### Constants (`src/lib/constants.ts`)

`STAGES` (4 sections), `DOMAINS`, `STAGE_COLORS`, `STAGE_DOT_COLORS`, `STAGE_HEADER_BG` — all keyed by the exact stage string. Adding a new section requires updating all four maps.

### Database (`supabase/`)

- `schema.sql` — initial schema
- `migration_add_task_id_domain.sql` — adds `task_id` and `domain` columns (run once)
- `seed.sql` — 24 actions across 4 sections; run after migration to reset data

When renaming stage or domain values in constants, also run a SQL `UPDATE` on the live DB to keep existing rows in sync (they will fall into the "Other" group otherwise).
