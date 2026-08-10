import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().max(250).optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  status: z.enum(['online', 'away', 'dnd', 'offline']).optional(),
  customStatus: z.string().max(100).optional(),
});

export const createMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1, 'Message content cannot be empty').max(10000, 'Message is too long'),
  threadId: z.string().uuid().optional(),
  replyToId: z.string().uuid().optional(),
  type: z.enum(['text', 'image', 'video', 'audio', 'voice', 'document', 'poll', 'system']).default('text'),
});

export const createChannelSchema = z.object({
  teamId: z.string().uuid(),
  name: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Channel name must be lowercase alphanumeric with hyphens'),
  topic: z.string().max(250).optional(),
  type: z.enum(['text', 'voice', 'announcement']).default('text'),
  isPrivate: z.boolean().default(false),
});

export const createMeetingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  passcode: z.string().max(20).optional(),
  isWaitingRoomEnabled: z.boolean().default(true),
  isRecordingEnabled: z.boolean().default(true),
  scheduledStart: z.string().datetime().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
