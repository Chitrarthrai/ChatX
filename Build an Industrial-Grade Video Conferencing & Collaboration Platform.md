# Build an Industrial-Grade Video Conferencing & Collaboration Platform

You are a **senior software architect and full-stack engineer**. Build a production-grade communication and collaboration platform combining the best concepts from:

- Google Meet — video conferencing
- Microsoft Teams — meetings, teams, collaboration, permissions
- Telegram — fast, reliable, feature-rich messaging
- Slack — channels, threads, search, organization
- Zoom — meetings, recording, participant management
- AI meeting assistants — transcription, summaries, action items and meeting intelligence

The application must be designed as a **scalable, secure, modular and maintainable product**, not as a prototype.

---

# 1. Technology Stack

## Mobile Application

Build a cross-platform mobile application using:

- React Native
- TypeScript
- Expo where practical
- Expo Router
- Zustand for client-side state
- TanStack Query for server state
- React Hook Form
- Zod
- Native WebRTC implementation suitable for production
- Supabase client
- Supabase Realtime
- Push notifications
- Secure storage for authentication/session information

Target:

- Android
- iOS

The mobile application should feel like a native premium communication application.

---

# 2. Web Application

Build the web application using:

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui
- Radix UI where appropriate
- Zustand
- TanStack Query
- React Hook Form
- Zod
- Supabase
- WebRTC

The web application should be responsive and work properly on:

- Desktop
- Laptop
- Tablet
- Mobile browser

The desktop experience should be optimized for professional/business usage.

---

# 3. Backend

Use **Supabase as the primary backend platform**.

Use:

- Supabase PostgreSQL
- Supabase Auth
- Supabase Realtime
- Supabase Storage
- Supabase Edge Functions
- PostgreSQL Row Level Security
- PostgreSQL functions/triggers where appropriate

Do NOT put sensitive business logic directly inside the frontend.

Create a proper backend/service layer around Supabase.

The architecture should allow future migration of computationally intensive services to dedicated backend microservices without rewriting the entire application.

---

# 4. Core Product

The application should support:

### Authentication

- Email/password
- Google OAuth
- Microsoft OAuth
- Apple login for mobile
- Phone authentication if required
- Email verification
- Forgot password
- Reset password
- Session management
- Multiple devices
- Device/session management
- Logout from all devices
- Account deletion
- Profile management

User profile:

- Name
- Username
- Profile picture
- Email
- Phone
- Bio
- Timezone
- Language
- Status
- Last seen
- Online/offline state

---

# 5. Main Application Structure

Create the following primary sections:

## Mobile

- Home
- Chats
- Calls
- Meetings
- Contacts
- Groups
- Channels
- Notifications
- AI Assistant
- Recordings
- Saved Messages
- Settings

## Web

Sidebar navigation:

- Home
- Messages
- Teams
- Channels
- Meetings
- Calendar
- Calls
- Recordings
- AI Assistant
- Files
- Contacts
- Saved Messages
- Settings
- Admin

---

# 6. Telegram-Level Chat System

Build a powerful realtime chat system.

Support:

### Direct Messages

- One-to-one conversations
- Text messages
- Emoji
- GIFs
- Stickers
- Reactions
- Replies
- Message forwarding
- Message editing
- Message deletion
- Delete for everyone
- Message pinning
- Message bookmarking
- Message copying
- Message sharing
- Message links
- Read receipts
- Delivery receipts
- Typing indicators
- Online status
- Last seen
- Mentions
- Hashtags
- Message search

### Media

Support:

- Images
- Videos
- Audio
- Voice messages
- Documents
- PDFs
- ZIP files
- Other file types

Include:

- Upload progress
- Download progress
- File preview
- Image preview
- Video preview
- Audio player
- Document preview
- File metadata

Use Supabase Storage with secure signed URLs.

---

# 7. Advanced Chat Features

Implement:

### Message Threads

Messages can have threaded replies.

### Message Reactions

Users can react with emojis.

### Polls

Support:

- Single-choice polls
- Multiple-choice polls
- Anonymous polls
- Poll closing time

### Scheduled Messages

Allow users to schedule messages.

### Draft Messages

Persist message drafts.

### Message Reminders

Users can set reminders for messages.

### Saved Messages

Create a personal "Saved Messages" conversation.

### Message Forwarding

Support forwarding to:

- Users
- Groups
- Channels
- Teams

### Message Editing History

Maintain message edit metadata where required.

### Message Locking

Allow authorized users to lock important messages from modification/deletion.

---

# 8. Chat Archive System

Build an industrial-grade archive system.

Users should be able to:

- Archive chats
- Unarchive chats
- Archive multiple chats
- Automatically archive inactive chats
- Search archived chats
- Filter archived chats
- Lock archived conversations
- Export archived conversations
- Restore archived conversations

Archived data must remain searchable according to permissions.

Do not simply hide archived chats in the UI.

Create a proper database state for archived conversations.

---

# 9. Chat Lock & Security

Implement conversation-level security.

Features:

- Lock conversation
- PIN/password protected chat
- Biometric unlock on mobile
- Auto-lock timer
- Hide locked conversations
- Screenshot protection where platform capabilities permit
- Local encrypted cache
- Secure session storage
- Device management

Never store plaintext passwords/PINs.

---

# 10. Groups

Support groups with:

- Group name
- Group image
- Description
- Members
- Admins
- Moderators
- Roles
- Permissions
- Join/leave
- Invite links
- Approval-based joining
- Member removal
- Member banning
- Mute users
- Slow mode
- Pinned messages
- Group announcements
- Group files
- Group media
- Group search

Group permissions should include:

- Send messages
- Send media
- Send files
- Add members
- Remove members
- Pin messages
- Delete messages
- Start meetings
- Create polls
- Manage group

---

# 11. Channels

Implement Telegram-style channels.

Features:

- Public channels
- Private channels
- Channel administrators
- Subscribers
- Posts
- Reactions
- Comments
- Polls
- Media
- Files
- Scheduled posts
- Pinned posts
- Channel analytics

---

# 12. Teams / Organizations

Build Microsoft Teams-style organizations.

Hierarchy:

Organization
→ Teams
→ Channels
→ Members
→ Meetings
→ Files
→ Conversations

Support:

- Create organization
- Invite employees
- Departments
- Teams
- Channels
- Roles
- Permissions
- Organization administrators
- Team administrators
- Moderators
- Members
- Guests

---

# 13. Video Conferencing

Build a professional video conferencing system.

Meeting features:

- Create meeting
- Instant meeting
- Scheduled meeting
- Meeting links
- Meeting ID
- Password-protected meetings
- Waiting room
- Lobby
- Host controls
- Co-hosts
- Participant permissions

---

# 14. Video Meeting UI

Create a polished Google Meet / Teams-style interface.

Support:

- Grid view
- Speaker view
- Screen sharing
- Camera toggle
- Microphone toggle
- Device selection
- Speaker selection
- Noise suppression
- Echo cancellation
- Background blur
- Virtual backgrounds
- Raise hand
- Reactions
- Participant list
- Chat
- Meeting information
- Meeting controls
- Full screen
- Picture-in-picture
- Network quality indicator

---

# 15. Meeting Host Controls

Host should be able to:

- Mute participant
- Remove participant
- Disable participant camera
- Disable participant microphone
- Allow/disallow screen sharing
- Allow/disallow chat
- Lock meeting
- Enable waiting room
- Admit participants
- Promote co-host
- End meeting for everyone
- Record meeting
- Enable transcription
- Enable AI notes

---

# 16. Screen Sharing

Support:

- Full screen sharing
- Application/window sharing on supported platforms
- Browser tab sharing
- Mobile screen sharing where supported

Display clear indicators when screen sharing is active.

---

# 17. Meeting Chat

Every meeting should have an associated realtime chat.

Support:

- Public meeting chat
- Private participant messages where permitted
- Reactions
- File sharing
- Links
- Pinned messages
- Chat history
- Meeting-specific attachments

Meeting chat should automatically associate with the meeting.

---

# 18. Meeting Recording

Implement meeting recording.

Recording should support:

- Audio
- Video
- Screen sharing
- Meeting chat
- Participant information

Store recordings securely in Supabase Storage or an appropriate recording infrastructure.

Recording metadata:

- Meeting ID
- Owner
- Start time
- End time
- Duration
- Participants
- File size
- Recording status
- Storage location

Support:

- Recording processing
- Recording thumbnails
- Playback
- Download
- Sharing
- Access permissions
- Delete
- Archive

---

# 19. Recording Library

Create a dedicated recording dashboard.

Users should see:

- My recordings
- Shared recordings
- Meeting recordings
- Archived recordings
- Recently viewed
- Favorites

Support:

- Search
- Filters
- Sort
- Tags
- Folders
- Sharing
- Permissions

---

# 20. AI Meeting Assistant

Build an AI-powered meeting assistant.

After a meeting, generate:

### Transcript

- Full meeting transcript
- Speaker identification
- Timestamped transcript
- Searchable transcript

### AI Summary

Generate:

- Executive summary
- Important discussion points
- Decisions
- Action items
- Questions
- Key topics
- Risks
- Follow-ups

### Action Items

Extract:

- Task
- Assigned person
- Deadline
- Priority
- Status

### Meeting Intelligence

Generate:

- Topics discussed
- Sentiment overview
- Important moments
- Decisions
- Questions asked
- Unresolved issues

Allow users to ask:

> "What did we decide about the API architecture?"

> "What tasks were assigned to me?"

> "Summarize the discussion about the mobile application."

> "What are the important deadlines from this meeting?"

---

# 21. AI Chat Assistant

Create a global AI assistant.

Users can ask questions about:

- Meetings
- Transcripts
- Chat history
- Documents
- Recordings
- Tasks
- Teams
- Channels

Example:

"Show me all meetings where the payment gateway was discussed."

"Summarize all discussions from this week."

"What action items are assigned to me?"

"Find the conversation where we discussed the production deployment."

Use permission-aware retrieval.

The AI must NEVER expose data the user does not have access to.

---

# 22. Search System

Build powerful global search.

Search across:

- Messages
- Users
- Groups
- Teams
- Channels
- Files
- Meetings
- Recordings
- Transcripts
- AI notes

Filters:

- Date
- User
- Team
- Channel
- File type
- Message type
- Meeting
- Media

Use PostgreSQL full-text search initially.

Design the architecture so Elasticsearch/OpenSearch can be introduced later if required.

---

# 23. Notification System

Implement realtime notifications.

Notification types:

- New message
- Mention
- Reply
- Reaction
- Meeting invitation
- Meeting starting
- Missed call
- Missed meeting
- File shared
- Group invitation
- Channel update
- AI summary ready
- Recording ready
- Task assigned

Support:

- In-app notifications
- Push notifications
- Email notifications where required

Allow granular notification settings.

---

# 24. Calls

Support:

### One-to-one calls

- Audio call
- Video call

### Group calls

- Multiple participants
- Participant management
- Call history
- Missed calls

Display call history similar to Telegram.

---

# 25. Contacts

Support:

- Search users
- Add contacts
- Remove contacts
- Block users
- Unblock users
- Contact groups
- Invite users

---

# 26. Calendar & Meetings

Create a calendar system.

Support:

- Create meeting
- Schedule meeting
- Recurring meetings
- Meeting reminders
- Invite participants
- Calendar view
- Upcoming meetings
- Past meetings
- Meeting links

Design the architecture so Google Calendar / Microsoft Outlook integration can be added later.

---

# 27. Files

Create a centralized file system.

Users can access files shared through:

- Chats
- Groups
- Channels
- Teams
- Meetings

Features:

- Upload
- Download
- Preview
- Search
- Folders
- Tags
- Sharing
- Permissions
- Archive
- Delete

---

# 28. Security

Treat security as a first-class requirement.

Implement:

- Supabase Row Level Security
- Role-based access control
- Organization-level isolation
- Team-level permissions
- Channel-level permissions
- Meeting-level permissions
- Secure file access
- Signed URLs
- Secure authentication
- Session management
- Device management
- Rate limiting
- Input validation
- XSS protection
- CSRF protection where applicable
- Secure API design
- Audit logging

Never trust the client for authorization.

Every sensitive operation must be authorized server-side.

---

# 29. Audit Logs

Create an enterprise audit system.

Track:

- Login
- Logout
- Password changes
- User creation
- User deletion
- Role changes
- Permission changes
- File access
- File download
- Message deletion
- Message editing
- Meeting creation
- Meeting recording
- Recording access
- Organization changes
- Team changes
- Channel changes

Audit logs should be immutable to normal users.

---

# 30. Database Design

Create a normalized PostgreSQL schema.

Important tables should include approximately:

- users
- profiles
- organizations
- organization_members
- teams
- team_members
- channels
- channel_members
- conversations
- conversation_members
- messages
- message_reactions
- message_attachments
- message_threads
- saved_messages
- archived_conversations
- locked_conversations
- contacts
- blocked_users
- meetings
- meeting_participants
- meeting_sessions
- meeting_chat
- meeting_recordings
- recording_access
- transcripts
- transcript_segments
- ai_summaries
- ai_action_items
- ai_topics
- files
- folders
- notifications
- devices
- user_sessions
- audit_logs
- polls
- poll_options
- poll_votes
- invitations
- scheduled_messages

Use proper:

- Foreign keys
- Indexes
- Constraints
- Unique constraints
- Timestamps
- Soft deletion where appropriate

---

# 31. Realtime Architecture

Use Supabase Realtime for:

- Chat messages
- Typing indicators
- Online presence
- Read receipts
- Notifications
- Meeting state
- Participant state

Do not unnecessarily persist ephemeral events.

For example:

Typing indicators should be ephemeral.

Message history should be persisted.

---

# 32. WebRTC Architecture

Do not build video conferencing using simple peer-to-peer connections only.

Design the architecture around an **SFU-based WebRTC system** suitable for large meetings.

The application architecture should support a dedicated media infrastructure such as:

- LiveKit
- mediasoup
- Janus
- another production-grade SFU

Keep the media layer abstracted from the main application backend.

Supabase should handle application data, authentication, permissions and metadata, while the media infrastructure handles real-time audio/video transport.

---

# 33. Scalability

Design for:

- 10,000+ users
- 1,000+ concurrent meetings
- Large group chats
- Large file uploads
- High message volume
- Realtime presence
- Large meeting recordings

Avoid architecture that requires every user to connect directly to every other participant.

Use pagination everywhere.

Never load an entire chat history at once.

Use cursor-based pagination for large datasets.

---

# 34. Offline Support

Mobile application should support offline-first behavior where practical.

When offline:

- Show cached conversations
- Allow composing messages
- Queue outgoing messages
- Retry failed messages
- Sync when connection returns

Display:

- Sending
- Sent
- Delivered
- Read
- Failed

states.

---

# 35. UX Requirements

The UI should feel like a modern premium enterprise application.

Design principles:

- Clean
- Minimal
- Fast
- Responsive
- Professional
- Accessible
- Consistent

Avoid excessive animations.

Use skeleton loaders.

Use optimistic updates where appropriate.

Provide proper empty states.

Provide meaningful error states.

Provide confirmation dialogs for destructive actions.

---

# 36. Mobile Navigation

Use a modern mobile navigation architecture.

Suggested tabs:

1. Home
2. Chats
3. Meetings
4. Calls
5. Profile

Use nested navigation for:

- Chat
- Meeting
- Group
- Channel
- Settings
- AI
- Recording

---

# 37. Web Layout

Use:

Sidebar
→ Conversation/Workspace list
→ Main content
→ Optional details panel

For chat:

Left sidebar:
Conversations

Center:
Chat

Right:
Conversation information / media / members

For meetings:

Main:
Video grid

Right:
Participants / Chat / AI / Meeting information

---

# 38. Theme

Support:

- Light mode
- Dark mode
- System theme

Create a centralized design system.

Use reusable components.

Do not hardcode colors throughout the application.

Use Tailwind design tokens.

---

# 39. Component Architecture

Create reusable components such as:

- Avatar
- UserCard
- ChatList
- ChatMessage
- MessageComposer
- MessageActions
- AttachmentPreview
- FilePreview
- AudioPlayer
- VideoPlayer
- ReactionPicker
- ThreadView
- ParticipantList
- MeetingControls
- VideoTile
- ScreenShareView
- RecordingPlayer
- TranscriptViewer
- AIInsightCard
- NotificationItem
- SearchBar
- CommandPalette
- Modal
- Drawer
- Dropdown
- Tooltip
- DataTable

Avoid duplicating components between pages.

---

# 40. State Management

Separate state into:

### Server state

Use TanStack Query.

Examples:

- Messages
- Conversations
- Meetings
- Users
- Recordings
- Files

### Client state

Use Zustand.

Examples:

- UI state
- Active conversation
- Meeting controls
- Sidebar state
- Modal state
- Theme
- Local preferences

Do not put everything into one global store.

---

# 41. API Architecture

Create a clean service layer.

Example:

```text
src/
  services/
    auth/
    users/
    chats/
    messages/
    meetings/
    recordings/
    files/
    notifications/
    ai/
    organizations/
```

Never scatter Supabase queries throughout UI components.

Use service/repository abstractions.

---

# 42. Supabase Architecture

Create:

```text
supabase/
  migrations/
  functions/
    create-meeting/
    generate-ai-summary/
    process-transcript/
    send-notification/
    create-upload-url/
    search/
  seed/
```

All database schema changes must be represented as migrations.

Do not manually modify production database structures.

---

# 43. Environment Configuration

Use environment variables.

Never commit:

- Supabase service role keys
- AI API keys
- WebRTC credentials
- Storage secrets
- OAuth secrets

Create:

```text
.env.example
.env.local
```

Document every required environment variable.

---

# 44. Error Handling

Implement centralized error handling.

Errors should provide:

- User-friendly message
- Internal error code
- Logging information
- Retry capability where appropriate

Never expose internal database or infrastructure errors to users.

---

# 45. Logging & Monitoring

Create structured logging.

Track:

- Authentication errors
- API errors
- Realtime failures
- WebRTC failures
- Upload failures
- AI processing failures
- Recording failures

Design the system so tools such as:

- Sentry
- OpenTelemetry
- Prometheus
- Grafana

can be integrated later.

---

# 46. Testing

Implement:

### Unit tests

For:

- Business logic
- Utilities
- Validation
- Permissions

### Integration tests

For:

- Authentication
- Chat
- Meetings
- File uploads
- Permissions

### E2E tests

For:

- Login
- Chat
- Meeting creation
- Joining meeting
- Recording
- AI summary

Use appropriate testing frameworks for React Native and Next.js.

---

# 47. Accessibility

Support:

- Keyboard navigation
- Screen readers
- ARIA labels
- Focus management
- Color contrast
- Accessible dialogs
- Accessible forms

---

# 48. Performance

Optimize for:

- Fast initial load
- Lazy loading
- Code splitting
- Image optimization
- Virtualized chat lists
- Virtualized participant lists
- Efficient realtime subscriptions
- Efficient database queries
- Pagination
- Caching
- Optimistic updates

Never render thousands of messages simultaneously.

---

# 49. Project Structure

Create a clean monorepo:

```text
platform/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   └── lib/
│   │
│   └── mobile/
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── stores/
│       └── lib/
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── api/
│   ├── ui/
│   └── config/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
│
├── docs/
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

Use a shared package for:

- TypeScript types
- Validation schemas
- API contracts
- Constants
- Business models

---

# 50. Development Strategy

Do NOT attempt to build every feature simultaneously.

Build in phases.

## Phase 1 — Foundation

Implement:

- Monorepo
- Next.js
- React Native
- Supabase
- Authentication
- User profiles
- Database architecture
- Design system
- Navigation
- Theme

## Phase 2 — Chat

Implement:

- Direct messaging
- Realtime messages
- Message status
- Typing indicators
- Reactions
- Replies
- Attachments
- Search
- Archive
- Saved messages

## Phase 3 — Groups & Organizations

Implement:

- Groups
- Channels
- Teams
- Organization
- Roles
- Permissions

## Phase 4 — Video Meetings

Implement:

- Meeting creation
- Meeting joining
- WebRTC
- SFU
- Camera
- Microphone
- Screen sharing
- Participants
- Meeting chat
- Host controls

## Phase 5 — Recording

Implement:

- Meeting recording
- Storage
- Recording processing
- Playback
- Recording library
- Sharing
- Permissions

## Phase 6 — AI

Implement:

- Transcription
- Speaker identification
- AI summary
- Action items
- Meeting insights
- AI search
- AI assistant

## Phase 7 — Enterprise

Implement:

- Audit logs
- Advanced permissions
- Organization administration
- Security controls
- Analytics
- Device management
- Compliance features

---

# 51. Important Engineering Rule

Do not create a fake implementation.

For features that require external infrastructure, create the correct abstraction and integration boundary.

For example:

```text
Application
     |
     ├── Supabase
     │     ├── Auth
     │     ├── PostgreSQL
     │     ├── Storage
     │     └── Realtime
     │
     ├── Media Server
     │     └── WebRTC / SFU
     │
     ├── AI Service
     │     ├── Transcription
     │     ├── LLM
     │     └── Embeddings
     │
     └── Notification Service
           ├── Push
           └── Email
```

Do not pretend Supabase itself is a complete video conferencing infrastructure.

---

# 52. Security Principle

Every operation must answer:

1. Who is making the request?
2. What organization do they belong to?
3. What resource are they accessing?
4. What role do they have?
5. Are they authorized?
6. Should the operation be audited?

Implement authorization at the backend/database level.

---

# 53. AI Security

The AI system must respect the same permissions as the application.

For example:

If User A cannot access:

```text
Private Team → Private Channel → Message
```

then User A's AI assistant must also be unable to retrieve or summarize that message.

Never create a global unrestricted AI knowledge base.

---

# 54. Deliverables

Generate:

1. Complete project architecture
2. Database ERD
3. PostgreSQL schema
4. Supabase migrations
5. RLS policies
6. Authentication
7. Web application
8. React Native application
9. Shared packages
10. Realtime architecture
11. Video conferencing architecture
12. Chat architecture
13. Recording architecture
14. AI architecture
15. API/service layer
16. Testing strategy
17. Security architecture
18. Deployment documentation
19. Environment variable documentation
20. README
21. Developer setup instructions
22. Production deployment instructions

---

# 55. Coding Standards

Use:

- TypeScript strict mode
- ESLint
- Prettier
- Clean architecture
- SOLID principles
- DRY
- Strong typing
- Small reusable components
- Meaningful naming
- Proper error handling
- Proper loading states
- Proper empty states
- Proper permission checks

Avoid:

- `any`
- Massive components
- Massive Zustand stores
- Business logic inside UI
- Duplicate API calls
- Hardcoded credentials
- Hardcoded permissions
- Direct database calls scattered through components
- Fake APIs
- Placeholder implementations presented as production-ready

---

# 56. Final Product Goal

The final product should feel like a serious enterprise communication platform.

The experience should combine:

**Telegram**
→ messaging, groups, channels, media, archive, saved messages

**Google Meet**
→ simple, reliable video meetings

**Microsoft Teams**
→ organizations, teams, channels, permissions and collaboration

**Zoom**
→ meeting management and recording

**AI Assistant**
→ transcription, summaries, action items, meeting intelligence and semantic search

The architecture must be capable of evolving into a **large-scale SaaS collaboration platform**.

Before writing code, first produce:

1. System architecture
2. Database ERD
3. Feature/module breakdown
4. Folder structure
5. Authentication architecture
6. Realtime architecture
7. WebRTC/SFU architecture
8. AI architecture
9. Security model
10. Development phases

Then begin implementation **Phase 1 only**.

After completing each phase, verify it with tests before moving to the next phase.