
import { Report, ReportStatus, Admin, AdminRole, ChatSession, ChatMessage, BlockedUser } from '../types';

const STORAGE_KEY_REPORTS = 'chars_reports';
const STORAGE_KEY_ADMINS = 'chars_admins';
const STORAGE_KEY_INQUIRIES = 'chars_inquiries';
const STORAGE_KEY_CHATS = 'chars_chats';
const STORAGE_KEY_BLACKLIST = 'chars_blacklist';

const initMockData = () => {
  if (!localStorage.getItem(STORAGE_KEY_REPORTS)) localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEY_INQUIRIES)) localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEY_CHATS)) localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEY_BLACKLIST)) localStorage.setItem(STORAGE_KEY_BLACKLIST, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEY_ADMINS)) {
    const defaultAdmins: Admin[] = [
      { id: '1', name: 'Officer Sarah', email: 'admin@chars.gov', role: AdminRole.SUPER_ADMIN, avatar: '' }
    ];
    localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(defaultAdmins));
  }
};

initMockData();

export const mockApi = {
  submitReport: async (data: Partial<Report>): Promise<{ success: boolean; reportId: string }> => {
    await new Promise(r => setTimeout(r, 1000));
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEY_REPORTS) || '[]');
    const reportId = `CH-${Math.floor(100000 + Math.random() * 900000)}`;
    const newReport: Report = {
      id: reportId,
      description: data.description || '',
      childName: data.childName,
      age: data.age,
      location: data.location,
      reporter: data.reporter,
      evidence: data.evidence || [],
      status: ReportStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminNotes: ''
    };
    reports.push(newReport);
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    return { success: true, reportId };
  },

  getReportStatus: async (reportId: string): Promise<Report | null> => {
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEY_REPORTS) || '[]');
    return reports.find((r: Report) => r.id === reportId) || null;
  },

  login: async (email: string): Promise<{ success: boolean; admin?: Admin; token?: string }> => {
    const admins = JSON.parse(localStorage.getItem(STORAGE_KEY_ADMINS) || '[]');
    const admin = admins.find((a: Admin) => a.email === email);
    if (admin) return { success: true, admin, token: 'mock-jwt-' + Date.now() };
    return { success: false };
  },

  getAllReports: async (): Promise<Report[]> => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_REPORTS) || '[]');
  },

  updateReportStatus: async (id: string, status: ReportStatus, notes: string): Promise<boolean> => {
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEY_REPORTS) || '[]');
    const index = reports.findIndex((r: Report) => r.id === id);
    if (index !== -1) {
      reports[index].status = status;
      reports[index].adminNotes = notes;
      reports[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
      return true;
    }
    return false;
  },

  sendInquiry: async (data: any): Promise<{ success: boolean }> => {
    const inquiries = JSON.parse(localStorage.getItem(STORAGE_KEY_INQUIRIES) || '[]');
    inquiries.push({ ...data, id: Date.now(), createdAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(inquiries));
    return { success: true };
  },

  getAllAdmins: async (): Promise<Admin[]> => JSON.parse(localStorage.getItem(STORAGE_KEY_ADMINS) || '[]'),
  updateAdmin: async (id: string, updates: Partial<Admin>): Promise<Admin | null> => {
    const admins = JSON.parse(localStorage.getItem(STORAGE_KEY_ADMINS) || '[]');
    const idx = admins.findIndex((a: Admin) => a.id === id);
    if (idx !== -1) {
      admins[idx] = { ...admins[idx], ...updates };
      localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins));
      return admins[idx];
    }
    return null;
  },
  createAdmin: async (a: Partial<Admin>) => {
    const admins = JSON.parse(localStorage.getItem(STORAGE_KEY_ADMINS) || '[]');
    const admin = { ...a, id: Date.now().toString() } as Admin;
    admins.push(admin);
    localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins));
    return admin;
  },
  deleteAdmin: async (id: string) => {
    const admins = JSON.parse(localStorage.getItem(STORAGE_KEY_ADMINS) || '[]');
    localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins.filter((a: any) => a.id !== id)));
    return true;
  },

  // LIVE CHAT LOGIC
  checkBlockedStatus: async (userId: string, phone: string): Promise<boolean> => {
    const blacklist = JSON.parse(localStorage.getItem(STORAGE_KEY_BLACKLIST) || '[]');
    return blacklist.some((b: BlockedUser) => b.id === userId || b.phone === phone);
  },

  sendOtp: async (phone: string): Promise<string> => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`[SECURE_SMS] OTP for ${phone}: ${otp}`);
    return otp;
  },

  startChatSession: async (userId: string, phone: string, name: string): Promise<ChatSession> => {
    const chats = JSON.parse(localStorage.getItem(STORAGE_KEY_CHATS) || '[]');
    const session: ChatSession = {
      id: `SESSION-${Date.now()}`,
      userId,
      userPhone: phone,
      userName: name,
      messages: [],
      status: 'ACTIVE',
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Automated Greeting Flow
    const botMessages: ChatMessage[] = [
      { 
        id: `BOT-G-1-${Date.now()}`, 
        senderId: 'bot', 
        senderName: 'CHARS AI', 
        text: `Hello ${name}, how can I help you today?`, 
        timestamp: new Date().toISOString() 
      },
      { 
        id: `BOT-G-2-${Date.now()}`, 
        senderId: 'bot', 
        senderName: 'CHARS AI', 
        text: `Don't be afraid. We strictly protect your privacy. All your details are end-to-end encrypted.`, 
        timestamp: new Date(Date.now() + 500).toISOString() 
      },
      { 
        id: `BOT-G-3-${Date.now()}`, 
        senderId: 'bot', 
        senderName: 'CHARS AI', 
        text: `Shall I connect you with an authorized duty officer for immediate support?`, 
        timestamp: new Date(Date.now() + 1000).toISOString() 
      }
    ];
    session.messages.push(...botMessages);
    
    chats.push(session);
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
    return session;
  },

  getChatSessions: async (): Promise<ChatSession[]> => JSON.parse(localStorage.getItem(STORAGE_KEY_CHATS) || '[]'),

  sendMessage: async (sessionId: string, senderId: string, senderName: string, text: string): Promise<ChatMessage> => {
    const chats = JSON.parse(localStorage.getItem(STORAGE_KEY_CHATS) || '[]');
    const session = chats.find((s: ChatSession) => s.id === sessionId);
    const msg: ChatMessage = { id: `MSG-${Date.now()}`, senderId, senderName, text, timestamp: new Date().toISOString() };
    if (session) {
      session.messages.push(msg);
      session.updatedAt = new Date().toISOString();
      if (senderId === 'user') {
        session.unreadCount += 1;
        const lowerText = text.toLowerCase();
        if (lowerText.includes('yes') || lowerText.includes('connect') || lowerText.includes('please')) {
           const autoReply: ChatMessage = {
             id: `BOT-R-${Date.now()}`,
             senderId: 'bot',
             senderName: 'CHARS AI',
             text: "Connecting you to the Duty Officer now. Please remain on the line.",
             timestamp: new Date(Date.now() + 1000).toISOString()
           };
           session.messages.push(autoReply);
        }
      }
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
    }
    return msg;
  },

  markAsRead: async (sessionId: string): Promise<void> => {
    const chats = JSON.parse(localStorage.getItem(STORAGE_KEY_CHATS) || '[]');
    const session = chats.find((s: ChatSession) => s.id === sessionId);
    if (session) {
      session.unreadCount = 0;
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
    }
  },

  editChatMessage: async (sessionId: string, msgId: string, newText: string): Promise<boolean> => {
    const chats = JSON.parse(localStorage.getItem(STORAGE_KEY_CHATS) || '[]');
    const session = chats.find((s: ChatSession) => s.id === sessionId);
    if (session) {
      const msg = session.messages.find((m: ChatMessage) => m.id === msgId);
      if (msg) {
        msg.text = newText;
        msg.isEdited = true;
        localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
        return true;
      }
    }
    return false;
  },

  deleteChatMessage: async (sessionId: string, msgId: string): Promise<boolean> => {
    const chats = JSON.parse(localStorage.getItem(STORAGE_KEY_CHATS) || '[]');
    const session = chats.find((s: ChatSession) => s.id === sessionId);
    if (session) {
      session.messages = session.messages.filter((m: ChatMessage) => m.id !== msgId);
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
      return true;
    }
    return false;
  },

  blockUser: async (userId: string, phone: string, reason: string): Promise<void> => {
    const blacklist = JSON.parse(localStorage.getItem(STORAGE_KEY_BLACKLIST) || '[]');
    blacklist.push({ id: userId, phone, reason, blockedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY_BLACKLIST, JSON.stringify(blacklist));
    
    const chats = JSON.parse(localStorage.getItem(STORAGE_KEY_CHATS) || '[]');
    chats.forEach((s: ChatSession) => {
      if (s.userId === userId || s.userPhone === phone) s.status = 'BLOCKED';
    });
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
  }
};
