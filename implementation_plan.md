# Master Interactive Button & API Call Verification Plan

This plan details the systematic audit and verification of every interactive button, API endpoint, and state handler across all 13 feature areas of **ChatX**.

---

## ⚠️ User Review Required

> [!IMPORTANT]
> Every interactive button across the platform will be checked for correct API binding, loading feedback state, non-blocking error handling, and smooth UI transitions without dead clicks or silent failures.

---

## 📋 Comprehensive Feature Area & Button Checklist

### 🌐 1. Public Landing Page & Auth Modal (`/`)
- [ ] **`Sign In / Get Started`**: Opens Auth Modal.
- [ ] **`Start Free Trial`**: Toggles landing/workspace state.
- [ ] **`Book Demo`**: Triggers consultation modal/link.
- [ ] **`Toggle Theme (☀️/🌙)`**: Toggles `next-themes` dark/light mode.
- [ ] **`Login / Register Submit`**: Calls `signInWithPassword()` / `signUp()` via `frontend/services/auth.ts`.
- [ ] **`Password Visibility Toggle (👁️)`**: Toggles input `type="password" / "text"`.
- [ ] **`Google / GitHub OAuth`**: Calls `signInWithOAuth()`.

### 💬 2. Main Workspace Chat Dashboard (`/` Workspace Mode)
- [ ] **`New Channel (+)`**: Opens Create Channel Dialog.
- [ ] **`Channel Items`**: Switches active channel & fetches channel messages via `fetchMessages()`.
- [ ] **`Lock / Unlock Channel (🔒)`**: Opens Lock Dialog & toggles PIN protection.
- [ ] **`Direct Message Items`**: Switches DM conversation & loads live profile state.
- [ ] **`Send Message (✈️)`**: Calls `sendMessage()`, inserts message into `public.messages`, triggers Realtime event.
- [ ] **`Attach File (📎)`**: Opens native file picker & attaches file metadata.
- [ ] **`Record Voice Message (🎙️)`**: Toggles audio recording & attaches voice note.
- [ ] **`Create Poll (📊)`**: Submits structured poll message.
- [ ] **`Emoji Picker (😊)`**: Adds reaction entry to message.
- [ ] **`Reply in Thread (💬)`**: Opens Thread Drawer.
- [ ] **`Ask AI Assistant (✨)`**: Opens AI Assistant Drawer.
- [ ] **`Bookmark Message (🔖)`**: Calls `saveMessage()` into `public.saved_messages`.
- [ ] **`Copy Message (📋)`**: Copies text payload to clipboard with toast checkmark.
- [ ] **`Forward Message (➡️)`**: Opens Forward Dialog & dispatches payload.
- [ ] **`User Profile Avatar`**: Opens Profile Dialog.
- [ ] **`Sign Out (🚪)`**: Calls `signOut()` & resets workspace state.

### 👥 3. Team Contacts Directory (`/contacts`)
- [ ] **`Back Navigation (←)`**: Invokes `router.back()`.
- [ ] **`Invite Member (+)`**: Opens Invite Dialog with copyable link.
- [ ] **`Status Filter Tabs (All | Online | Away | Dnd | Offline)`**: Filters contacts list dynamically.
- [ ] **`Clear Search (✕)`**: Resets search query input.
- [ ] **`Send DM (💬)`**: Sets active DM and navigates to `/`.
- [ ] **`Start HD Call (📹)`**: Launches video meeting room session.

### 📁 4. Enterprise File Storage (`/files`)
- [ ] **`Back Navigation (←)`**: Invokes `router.back()`.
- [ ] **`Upload New File (+)`**: Opens file selector & uploads payload to `public.files`.
- [ ] **`Folder Category Tabs (All | General | Engineering | Architecture | Design)`**: Filters file list.
- [ ] **`Download File`**: Triggers file download payload.
- [ ] **`Delete File (🗑️)`**: Deletes record from `public.files`.

### 📞 5. Call History & Logs (`/calls`)
- [ ] **`Back Navigation (←)`**: Invokes `router.back()`.
- [ ] **`Start New Call (+)`**: Launches WebRTC video meeting room.
- [ ] **`Category Filter Pills (All | Missed | Incoming | Outgoing)`**: Filters call logs.
- [ ] **`Call Back`**: Re-initiates call with contact.

### 📅 6. Scheduled Meetings & Calendar (`/calendar`)
- [ ] **`Back Navigation (←)`**: Invokes `router.back()`.
- [ ] **`Schedule Meeting (+)`**: Opens Schedule Meeting Modal.
- [ ] **`View Filter Tabs (Upcoming | Past | Hosted by Me)`**: Filters meeting cards.
- [ ] **`Join Meeting Room (📹)`**: Connects to LiveKit SFU meeting room.
- [ ] **`Copy Meeting Code (📋)`**: Copies meeting code to clipboard.
- [ ] **`Submit Schedule Meeting`**: Persists record into `public.meetings`.

### 🎬 7. Cloud Recordings Library (`/recordings`)
- [ ] **`Back Navigation (←)`**: Invokes `router.back()`.
- [ ] **`Play Recording (▶️)`**: Opens embedded HTML5 Video Player Modal.
- [ ] **`Favorite Toggle (⭐)`**: Toggles favorite bookmark status.
- [ ] **`Close Video Player (✕)`**: Closes active video player modal.

### 🔖 8. Saved Messages & Bookmarks (`/saved`)
- [ ] **`Back Navigation (←)`**: Invokes `router.back()`.
- [ ] **`Go to Original Message (🔗)`**: Navigates to original message in chat.
- [ ] **`Remove Bookmark (🗑️)`**: Deletes record from `public.saved_messages`.

### 🔔 9. Realtime Notification Center (`/notifications`)
- [ ] **`Back Navigation (←)`**: Invokes `router.back()`.
- [ ] **`Mark All as Read`**: Calls `markAllNotificationsAsRead()`.
- [ ] **`Filter Tabs (All | Unread | Mentions | System)`**: Filters notification list.
- [ ] **`Mark Individual Read (✓)`**: Calls `markNotificationAsRead()`.
- [ ] **`Delete Notification (✕)`**: Deletes notification entry.

### 🔍 10. Global Permission-Aware Search (`/search`)
- [ ] **`Back Navigation (←)`**: Invokes `router.back()`.
- [ ] **`Category Filter Tabs (All | Messages | Files | Users | Meetings)`**: Filters search results.
- [ ] **`Open Result Item`**: Navigates to matching record.

### 🛡️ 11. Enterprise Admin Console (`/admin`)
- [ ] **`Back Navigation (←)`**: Invokes `router.back()`.
- [ ] **`Add Member (+)`**: Opens admin team member invitation form.
- [ ] **`Export Audit Logs`**: Downloads audit log JSON/CSV.
- [ ] **`Tab Switcher (Members | Security | Audit Logs | Billing)`**: Switches admin console tabs.
- [ ] **`Role Selector Dropdown`**: Updates member role in `public.organization_members`.
- [ ] **`Suspend / Remove Member`**: Updates member status.

### ⚙️ 12. Application & Account Settings (`/settings`)
- [ ] **`Back Navigation (←)`**: Invokes `router.back()`.
- [ ] **`Presence Status Selector (Online | Away | Dnd | Offline)`**: Calls `setPresenceStatus()`.
- [ ] **`Save Changes`**: Calls `updateProfile()` in `public.profiles`.
- [ ] **`Revoke Active Sessions`**: Invokes session cleanup and sign out.
- [ ] **`Delete Account`**: Opens permanent deletion modal.

### 🔒 13. Password Reset & Callback (`/auth/reset-password` & `/auth/callback`)
- [ ] **`Toggle Password Visibility (👁️)`**: Toggles password input type.
- [ ] **`Update Password Submit`**: Calls `updatePassword()` via Supabase Auth API.

---

## 🧪 Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` in `frontend/` to confirm zero TypeScript compilation errors.

### Systematic Verification Workflow
- Audit each page route step-by-step.
- Verify every button click, modal trigger, API service call, and error handling fallback.
- Document progress and screenshots in `walkthrough.md`.
