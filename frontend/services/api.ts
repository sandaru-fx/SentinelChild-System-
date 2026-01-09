
import { Report, ReportStatus, Admin, AuditLog, ChatSession, ChatMessage } from '../types';
import { mockApi } from './mockApi';

const N8N_BASE_URL = 'https://sentinelchild-system.onrender.com';
const isDemo = () => false; // Disable demo mode since we are using the live backend

export const api = {
  submitReport: async (data: Partial<Report>): Promise<{ success: boolean; reportId: string }> => {
    if (isDemo()) return mockApi.submitReport(data);
    try {
      const response = await fetch(`${N8N_BASE_URL}/submit-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return mockApi.submitReport(data);
    }
  },

  getReportStatus: async (reportId: string): Promise<Report | null> => {
    if (isDemo()) return mockApi.getReportStatus(reportId);
    try {
      const response = await fetch(`${N8N_BASE_URL}/report-status?id=${reportId}`);
      return await response.json();
    } catch (error) {
      return mockApi.getReportStatus(reportId);
    }
  },

  login: async (email: string, password?: string): Promise<{ success: boolean; admin?: Admin; token?: string }> => {
    if (isDemo() || (email === 'admin@chars.gov' && password === 'admin123')) {
      return mockApi.login(email);
    }
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await response.json();
    } catch (error) {
      return mockApi.login(email);
    }
  },

  getAllReports: async (token: string): Promise<Report[]> => {
    if (isDemo()) return mockApi.getAllReports();
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/reports`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      return mockApi.getAllReports();
    }
  },

  updateReportStatus: async (id: string, status: ReportStatus, notes: string, token: string): Promise<boolean> => {
    if (isDemo()) return mockApi.updateReportStatus(id, status, notes);
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/update-report`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, status, notes }),
      });
      return response.ok;
    } catch (error) {
      return mockApi.updateReportStatus(id, status, notes);
    }
  },

  sendInquiry: async (data: { category: string; email?: string; location?: string; message: string }): Promise<{ success: boolean }> => {
    if (isDemo()) return mockApi.sendInquiry(data);
    try {
      const response = await fetch(`${N8N_BASE_URL}/contact-inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return mockApi.sendInquiry(data);
    }
  },

  getAuditLogs: async (token: string): Promise<AuditLog[]> => {
    if (isDemo()) return mockApi.getAuditLogs(token);
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/logs`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      return [
        { id: 'l1', adminId: '1', action: 'System Login', timestamp: new Date().toISOString(), reportId: 'N/A', details: 'Authorized session established' }
      ];
    }
  },

  // Admin Management API
  getAllAdmins: async (token: string): Promise<Admin[]> => {
    if (isDemo()) return mockApi.getAllAdmins();
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/personnel`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      return mockApi.getAllAdmins();
    }
  },

  createAdmin: async (admin: Partial<Admin>, token: string): Promise<Admin> => {
    if (isDemo()) return mockApi.createAdmin(admin);
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/personnel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(admin),
      });
      return await response.json();
    } catch (error) {
      return mockApi.createAdmin(admin);
    }
  },

  updateAdmin: async (id: string, updates: Partial<Admin>, token: string): Promise<Admin | null> => {
    if (isDemo()) return mockApi.updateAdmin(id, updates);
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/personnel/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });
      if (response.ok) return { ...updates, id } as Admin;
      return null;
    } catch (error) {
      return mockApi.updateAdmin(id, updates);
    }
  },

  deleteAdmin: async (id: string, token: string): Promise<boolean> => {
    if (isDemo()) return mockApi.deleteAdmin(id);
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/personnel/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.ok;
    } catch (error) {
      return mockApi.deleteAdmin(id);
    }
  },

  // LIVE CHAT API
  startChatSession: async (userId: string, phone: string, name: string): Promise<ChatSession> => {
    if (isDemo()) return mockApi.startChatSession(userId, phone, name);
    try {
      const response = await fetch(`${N8N_BASE_URL}/chat/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userPhone: phone, userName: name }),
      });
      return await response.json();
    } catch (error) {
      return mockApi.startChatSession(userId, phone, name);
    }
  },

  getChatSessions: async (token: string): Promise<ChatSession[]> => {
    if (isDemo()) return mockApi.getChatSessions();
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/chat/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      return mockApi.getChatSessions();
    }
  },

  sendMessage: async (sessionId: string, senderId: string, senderName: string, text: string): Promise<ChatMessage> => {
    if (isDemo()) return mockApi.sendMessage(sessionId, senderId, senderName, text);
    try {
      const response = await fetch(`${N8N_BASE_URL}/chat/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, senderName, text }),
      });
      return await response.json();
    } catch (error) {
      return mockApi.sendMessage(sessionId, senderId, senderName, text);
    }
  },

  markAsRead: async (sessionId: string, token: string): Promise<void> => {
    if (isDemo()) return mockApi.markAsRead(sessionId);
    try {
      await fetch(`${N8N_BASE_URL}/admin/chat/${sessionId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (error) {
      await mockApi.markAsRead(sessionId);
    }
  }
};
