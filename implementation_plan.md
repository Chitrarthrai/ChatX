# Realtime Message Status & Presence Synchronization Plan

This plan details the technical implementation and verification of **Realtime Message Delivery & Read Status Tracking** (`sent` ➔ `delivered` ➔ `read`) and **Live User Presence Tracking** (`online`, `away`, `dnd`, `offline`) across **ChatX**.

---

## 🎯 Goal & Functional Specification

### 1. Message Status Progression
- **`sent` (✓ Single Gray Check)**: Rendered immediately upon message submission by the sender.
- **`delivered` (✓✓ Double Gray Check)**: Updated automatically when the recipient's client is online or receives the WebSocket payload via Realtime subscription.
- **`read` (✓✓ Double Blue Check)**: Updated automatically when the recipient opens or views the conversation containing the message.

### 2. User Presence Status Tracking
- **Status Levels**:
  - `online` 🟢 (Emerald pill/dot)
  - `away` 🟡 (Amber pill/dot)
  - `dnd` 🔴 (Rose pill/dot)
  - `offline` ⚪ (Slate/muted dot)
- Realtime state synchronization across profile updates and workspace views.

---

## 📋 Proposed Changes

### 1. Database Schema & RLS (`backend/supabase/migrations/`)
- Added `status` (`sent`, `delivered`, `read`), `delivered_at`, `read_at` columns to `public.messages`.
- Created `public.message_receipts` table with RLS policies allowing authenticated read/upsert operations.

### 2. Shared Types (`packages/types/`) & Service Layer (`frontend/services/`)

#### [MODIFY] [types/src/index.ts](file:///d:/Chitrarth/Project%20P/ChatX/packages/types/src/index.ts)
- Extend `Message` interface to include `status: "sent" | "delivered" | "read"`, `deliveredAt`, and `readAt`.

#### [MODIFY] [messages.ts](file:///d:/Chitrarth/Project%20P/ChatX/frontend/services/messages.ts)
- Add `markMessageAsDelivered(messageId, userId)` and `markMessagesAsRead(conversationId, userId)`.
- Update `subscribeToMessages()` to listen to `UPDATE` events on `messages` table so receipt status changes update instantly on the UI without reloading.

### 3. Frontend Workspace UI (`frontend/app/page.tsx` & UI components)

#### [MODIFY] [page.tsx](file:///d:/Chitrarth/Project%20P/ChatX/frontend/app/page.tsx)
- Integrate message status icons in chat message bubbles:
  - `sent` ➔ `<Check className="w-3.5 h-3.5 text-muted-foreground" />`
  - `delivered` ➔ `<CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />`
  - `read` ➔ `<CheckCheck className="w-3.5 h-3.5 text-blue-500" />`
- Trigger `markMessagesAsRead()` when opening an active chat conversation.
- Display live user presence indicators next to DM members and profile header.

---

## 🧪 Verification Plan

### Automated Tests & Type Safety
- Run `npx tsc --noEmit` in `frontend/` to confirm 0 TypeScript compiler errors.

### Interactive Realtime Testing
- Send a message in direct/channel workspace chat and verify check mark progression:
  1. `sent` (✓ Single Gray Check)
  2. `delivered` (✓✓ Double Gray Check)
  3. `read` (✓✓ Double Blue Check)
- Verify status changes (`online`, `away`, `dnd`, `offline`) update dynamically across the UI.
