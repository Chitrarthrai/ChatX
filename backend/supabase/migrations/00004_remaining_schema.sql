-- Migration 00004: ChatX Remaining Schema Tables
-- meeting_participants, meeting_chat, devices/user_sessions, invitations

-- 1. Meeting Participants
CREATE TABLE IF NOT EXISTS public.meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'attendee' CHECK (role IN ('host', 'co-host', 'presenter', 'attendee')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT false,
    is_video_off BOOLEAN DEFAULT false,
    is_hand_raised BOOLEAN DEFAULT false,
    UNIQUE(meeting_id, user_id)
);

-- 2. Meeting In-Call Chat
CREATE TABLE IF NOT EXISTS public.meeting_chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Registered Devices (for push notifications)
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_type TEXT NOT NULL CHECK (device_type IN ('ios', 'android', 'web', 'desktop')),
    push_token TEXT,
    device_name TEXT,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, push_token)
);

-- 4. User Sessions (for revoke-all-sessions UI)
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    device_type TEXT,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 5. Invitations (team/workspace invite links)
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ
);

-- Enable RLS for all new tables
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "meeting_participants_select" ON public.meeting_participants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meeting_chat_select" ON public.meeting_chat
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.meeting_participants
            WHERE meeting_id = meeting_chat.meeting_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "devices_own" ON public.devices
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "user_sessions_own" ON public.user_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "invitations_inviter" ON public.invitations
    FOR ALL USING (auth.uid() = inviter_id);
