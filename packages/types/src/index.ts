/**
 * ChatX Core Data Interfaces & Enums
 */

export type UserStatus = 'online' | 'away' | 'dnd' | 'offline';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  status: UserStatus;
  customStatus?: string;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export type OrgRole = 'owner' | 'admin' | 'member' | 'guest';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrgRole;
  joinedAt: string;
  profile?: UserProfile;
}

export type TeamRole = 'admin' | 'moderator' | 'member';

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
}

export type ChannelType = 'text' | 'voice' | 'announcement';

export interface Channel {
  id: string;
  teamId: string;
  name: string;
  topic?: string;
  type: ChannelType;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ConversationType = 'direct' | 'group' | 'channel' | 'saved';

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  avatarUrl?: string;
  isArchived: boolean;
  isLocked: boolean;
  pinRequired?: boolean;
  lastMessageId?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'voice' | 'document' | 'poll' | 'system';

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  metadata?: Record<string, unknown>;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  threadId?: string;
  replyToId?: string;
  isEdited: boolean;
  isPinned: boolean;
  isLocked: boolean;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  sender?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export type MeetingStatus = 'scheduled' | 'active' | 'ended' | 'cancelled';

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  organizationId?: string;
  meetingCode: string;
  passcode?: string;
  status: MeetingStatus;
  scheduledStart?: string;
  startedAt?: string;
  endedAt?: string;
  isWaitingRoomEnabled: boolean;
  isRecordingEnabled: boolean;
  createdAt: string;
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId: string;
  role: 'host' | 'co_host' | 'participant';
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  joinedAt: string;
  leftAt?: string;
  profile?: UserProfile;
}

export interface MeetingRecording {
  id: string;
  meetingId: string;
  durationSeconds: number;
  fileUrl: string;
  fileSizeBytes: number;
  status: 'processing' | 'ready' | 'failed';
  createdAt: string;
}

export interface AISummary {
  id: string;
  meetingId?: string;
  conversationId?: string;
  executiveSummary: string;
  keyTopics: string[];
  actionItems: {
    task: string;
    assignee?: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  organizationId?: string;
  actorId: string;
  action: string;
  targetResource: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}
