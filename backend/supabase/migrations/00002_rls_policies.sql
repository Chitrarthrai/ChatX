-- ChatX Row Level Security (RLS) Policies
-- Section 28 & 52 Security Principles

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Organizations RLS
CREATE POLICY "Members can view their organizations" 
ON public.organizations FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = public.organizations.id AND user_id = auth.uid()
    )
);

-- 3. Teams RLS
CREATE POLICY "Members can view teams in their organization" 
ON public.teams FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = public.teams.organization_id AND user_id = auth.uid()
    )
);

-- 4. Conversation & Messages RLS
CREATE POLICY "Users can view conversations they participate in" 
ON public.conversations FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.conversation_members 
        WHERE conversation_id = public.conversations.id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can view messages in their conversations" 
ON public.messages FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.conversation_members 
        WHERE conversation_id = public.messages.conversation_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert messages into their conversations" 
ON public.messages FOR INSERT TO authenticated 
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.conversation_members 
        WHERE conversation_id = public.messages.conversation_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can view conversation members" 
ON public.conversation_members FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can add conversation members" 
ON public.conversation_members FOR INSERT TO authenticated 
WITH CHECK (true);

-- 5. Audit Logs RLS (Read-only for Org Admins)
CREATE POLICY "Org Admins can view audit logs" 
ON public.audit_logs FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = public.audit_logs.organization_id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
);

-- 6. Channels RLS
CREATE POLICY "Public channels are viewable by everyone" 
ON public.channels FOR SELECT TO public USING (true);

CREATE POLICY "Channels can be created by everyone" 
ON public.channels FOR INSERT TO public WITH CHECK (true);

-- 7. Supabase Realtime Publication & Replica Identity
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- 8. Messages Update RLS (for Delivery & Read Receipts)
CREATE POLICY "Allow update on messages" 
ON public.messages FOR UPDATE TO public 
USING (true) WITH CHECK (true);

-- 9. Message Reactions RLS & Realtime
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select on message_reactions" ON public.message_reactions FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert on message_reactions" ON public.message_reactions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow delete on message_reactions" ON public.message_reactions FOR DELETE TO public USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;

-- 10. Meetings & Meeting Participants RLS & Realtime
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert on meetings for all" ON public.meetings FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on meetings for all" ON public.meetings FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on meetings for all" ON public.meetings FOR DELETE TO public USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER TABLE public.meetings REPLICA IDENTITY FULL;

ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select on meeting_participants" ON public.meeting_participants FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert on meeting_participants" ON public.meeting_participants FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow delete on meeting_participants" ON public.meeting_participants FOR DELETE TO public USING (true);
CREATE POLICY "Allow update on meeting_participants" ON public.meeting_participants FOR UPDATE TO public USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_participants;
ALTER TABLE public.meeting_participants REPLICA IDENTITY FULL;


