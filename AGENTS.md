# ChatX — AI Agent Guidelines (Gemini Flash / Antigravity)

> These rules are **mandatory** for any AI agent working on the ChatX project.
> Read this file in full before writing a single line of code.

---

## ✅ Phases Already Completed — DO NOT Re-implement

| Phase | Page | Status |
|-------|------|--------|
| Phase 1 | Public Landing Page & Auth Modal (`/`) | ✅ DONE |
| Phase 2 | Main Workspace Chat Dashboard (`/` workspace mode) | ✅ DONE |
| Phase 3 | Enterprise Admin Console (`/admin`) | ✅ DONE |
| Phase 4 | Enterprise File Storage (`/files`) | ✅ DONE |
| Phase 5 | Team Contacts Directory (`/contacts`) | ✅ DONE |
| Phase 6 | Call History & Logs (`/calls`) | ✅ DONE |
| Phase 7 | Application & Account Settings (`/settings`) | ✅ DONE |
| Phase 8 | Saved Messages & Bookmarks (`/saved`) | ✅ DONE |
| Phase 9 | Realtime Notification Center (`/notifications`) | ✅ DONE |
| Phase 10 | Global Permission-Aware Search (`/search`) | ✅ DONE |
| Phase 11 | Scheduled Meetings & Calendar (`/calendar`) | ✅ DONE |
| Phase 12 | Cloud Recordings Library (`/recordings`) | ✅ DONE |
| Phase 13 | Password Reset & Callback (`/auth/reset-password` & `/auth/callback`) | ✅ DONE |

**Never touch completed phases unless the user explicitly asks for a bug fix or enhancement.**
Modifying completed phases without instruction will break working functionality.

---

## 📋 Active Enterprise Features & Realtime Tracking

### 📩 Message Delivery & Read Status Progression
- **`sent`** (✓ Single gray check): Message created and persisted in `public.messages`.
- **`delivered`** (✓✓ Double gray check): Recipient client/user is online or received message payload via Realtime subscription.
- **`read`** (✓✓ Double blue check): Recipient opens/views the active message conversation.

### 🟢 Live User Presence Tracking
- User status values: `online` (green), `away` (yellow), `dnd` (red), `offline` (gray).
- Synchronized dynamically via `public.profiles` updates and Supabase Realtime channel state.

---

## 🏗️ Architecture Rules

### File & Folder Conventions
- **Pages** live in `frontend/app/<route>/page.tsx` (Next.js App Router).
- **Reusable UI components** live in `frontend/components/<feature>/`.
- **Supabase client** is always imported from `frontend/lib/supabase/client.ts` (browser) or `frontend/lib/supabase/server.ts` (server components).
- **Types** come from the shared `@chatx/types` package — never define local duplicate types.
- **Do not** create files inside `node_modules`, `.next`, or `dist`.

### Component Rules
- Every page must be a **default export** React Server Component unless it requires client-side interactivity (hooks, events), in which case add `"use client"` at the top.
- Use existing UI primitives from `frontend/components/ui/` (shadcn/ui). Do not install new UI libraries.
- Match the existing dark-mode design system — use CSS variables already defined in `frontend/app/globals.css`.
- All interactive buttons must have a `disabled` state and a loading spinner while async operations are in flight.

---

## 🗄️ Supabase Integration Rules

### Always Use These Patterns

```typescript
// ✅ CORRECT — browser client in a "use client" component
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// ✅ CORRECT — server client in a Server Component
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();
```

### Data Fetching Pattern
```typescript
// Always handle loading + error states
const [data, setData] = useState<Row[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("table_name").select("*");
    if (error) setError(error.message);
    else setData(data ?? []);
    setLoading(false);
  };
  fetchData();
}, []);
```

### Realtime Subscription Pattern (Phase 9 — Notifications)
```typescript
useEffect(() => {
  const channel = supabase
    .channel("notifications")
    .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, (payload) => {
      // handle payload
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [supabase]);
```

### Key Supabase Tables (from `00001_initial_schema.sql`)
| Table | Used In |
|-------|---------|
| `profiles` | Phase 5 (contacts), Phase 7 (settings) |
| `files` | Phase 4 |
| `saved_messages` | Phase 8 |
| `notifications` | Phase 9 |
| `meetings` | Phase 11 |
| `meeting_recordings` | Phase 12 |
| `calls` | Phase 6 (if table exists; otherwise use mock data with `// TODO: replace with real table`) |

**Always check the migration file at `backend/supabase/migrations/00001_initial_schema.sql` before querying a table** to confirm the exact column names.

---

## 🎨 UI & Design Rules

- **No plain colors** — use the existing gradient + glassmorphism tokens from `globals.css`.
- Every data list must show a **skeleton loader** while fetching and an **empty state** illustration/message when there are no results.
- Status badges must use the same color system as Phase 2/3:
  - `online` → green
  - `away` → yellow
  - `dnd` → red
  - `offline` → gray
- Back navigation buttons must use `router.back()` from `next/navigation`.
- Every page must have a `<title>` meta tag (Next.js `export const metadata`).

---

## 🔒 Auth & Session Rules

- Always read the current user via:
  ```typescript
  const { data: { user } } = await supabase.auth.getUser();
  ```
- If `user` is `null`, redirect to `/` (the landing/auth page).
- Never expose service-role keys on the client side.
- Row-Level Security (RLS) is enabled — queries will automatically scope to the logged-in user.

---

## 🧪 Verification Checklist (After Each Phase)

Before marking a phase complete, verify ALL of the following:

- [ ] TypeScript compiles with zero errors: `npx tsc --noEmit`
- [ ] No `console.error` output in the browser during normal operation.
- [ ] Loading state renders correctly on slow network (throttle in DevTools).
- [ ] Empty state renders correctly when table has no rows.
- [ ] All buttons are keyboard-accessible (Tab + Enter).
- [ ] Back navigation returns to the correct previous page.
- [ ] No hardcoded mock data left in production code (mark mocks with `// TODO` if table doesn't exist yet).
- [ ] The page is responsive on mobile (375px) and desktop (1440px).

---

## ⚠️ Common Mistakes to Avoid

1. **Do NOT** use `supabase.from(...).select()` without handling the `error` return value.
2. **Do NOT** import from `@supabase/supabase-js` directly — always use the local wrapper in `lib/supabase/`.
3. **Do NOT** add `"use client"` to a page that only needs server-side data fetching.
4. **Do NOT** create a new shadcn component when an equivalent already exists in `frontend/components/ui/`.
5. **Do NOT** use `any` as a TypeScript type — use the types from `@chatx/types` or define a proper interface.
6. **Do NOT** implement multiple phases in one task — complete and verify each phase before starting the next.
7. **Do NOT** re-implement or overwrite Phase 1, 2, or 3 code.

---

## 🚀 How to Start a New Phase

1. Read `implementation_plan.md` to understand the exact requirements for the phase.
2. Read `backend/supabase/migrations/00001_initial_schema.sql` to know the real table/column names.
3. Check `frontend/components/ui/` for existing components you can reuse.
4. Implement the page and components.
5. Run `npx tsc --noEmit` and fix all errors.
6. Run the dev server (`npm run dev` in `frontend/`) and manually verify the page.
7. Check off all items in the Verification Checklist above.
8. Update `implementation_plan.md` — change `- [ ]` to `- [x]` and add `✅ COMPLETED` to the phase header.
