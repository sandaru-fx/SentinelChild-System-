
export enum ReportStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  INVESTIGATING = 'INVESTIGATING',
  FORWARDED = 'FORWARDED',
  CLOSED = 'CLOSED'
}

export enum AdminRole {
  SUPER_ADMIN = 'super admin',
  POLICE_OFFICER = 'police officer',
  VIEWER = 'viewer'
}

export interface Location {
  lat?: number;
  lng?: number;
}

export interface Reporter {
  name?: string;
  phone?: string;
}

export interface Report {
  id: string;
  childName?: string;
  age?: string;
  description: string;
  location?: Location;
  reporter?: Reporter;
  evidence: string[]; // Base64 or Object URLs for this demo
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  token?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  timestamp: string;
  reportId: string;
  details: string;
}

// Live Chat Types
export interface ChatMessage {
  id: string;
  senderId: string; // 'user', 'bot', or adminId
  senderName: string;
  text: string;
  timestamp: string;
  isEdited?: boolean;
}

export interface ChatSession {
  id: string; // MongoDB _id
  sessionId: string; // Business ID (e.g. SESSION-12345)
  userId: string;
  userPhone: string;
  userName: string;
  messages: ChatMessage[];
  status: 'ACTIVE' | 'CLOSED' | 'BLOCKED';
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlockedUser {
  id: string;
  phone: string;
  reason: string;
  blockedAt: string;
}

export interface Inquiry {
  id: string;
  type: 'voice' | 'general';
  name?: string;
  email?: string;
  department?: string;
  message?: string;
  transcription?: string;
  audio_url?: string;
  is_voice: boolean;
  created_at: string;
  status: string;
}
