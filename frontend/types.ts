
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

export interface StatusUpdate {
  status: ReportStatus;
  officer: string;
  timestamp: string;
  note?: string;
}

export interface InternalNote {
  author: string;
  text: string;
  timestamp: string;
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
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  history?: StatusUpdate[];
  internalNotes?: InternalNote[];
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
  adminName?: string;
  action: string;
  timestamp: string;
  targetId?: string;
  details?: string;
}

// Live Chat Types
export interface ChatMessage {
  id: string;
  senderId: string; // 'user', 'bot', or adminId
  senderName: string;
  text: string;
  timestamp: string;
  status?: 'SENT' | 'DELIVERED' | 'SEEN';
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
  ip?: string;
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

export enum ResourceType {
  ARTICLE = 'ARTICLE',
  VIDEO = 'VIDEO',
  GUIDE = 'GUIDE'
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  icon: string;
  readTime: string;
  content: string;
  link?: string;
  category: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hotline {
  id: string;
  name: string;
  number: string;
  description: string;
  icon: string;
  category: string;
  language: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface Setting {
  id?: string;
  key: string;
  value: string;
  language: string;
  updatedAt?: string;
}
