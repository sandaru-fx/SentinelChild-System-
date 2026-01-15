
import { Report, ReportStatus, Admin, AuditLog, ChatSession, ChatMessage, Resource, Hotline, Setting } from '../types';
import { mockApi } from './mockApi';

// @ts-ignore
const N8N_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
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
      console.error('API submitReport Error:', error);
      throw error;
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
    // Override: Use Real Backend but with a 'Cheat Key' for the demo account
    if (email === 'admin@chars.gov' && password === 'admin123') {
      return {
        success: true,
        token: 'CHARS_DEMO_TOKEN',
        admin: {
          id: 'demo_admin',
          email: 'admin@chars.gov',
          name: 'Officer Sarah',
          role: 'super admin' as any,
          avatar: 'https://ui-avatars.com/api/?name=Sarah+Officer&background=0D8ABC&color=fff',
          permissions: ['all'],
          last_active: new Date().toISOString()
        } as any
      };
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

  getAllReports: async (token: string, q?: string, page: number = 1, limit: number = 20): Promise<{ data: Report[]; total: number; page: number; limit: number }> => {
    if (isDemo()) return { data: await mockApi.getAllReports(), total: 100, page: 1, limit: 20 };
    try {
      const url = new URL(`${N8N_BASE_URL}/admin/reports`);
      if (q) url.searchParams.append('q', q);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());

      const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      const mockData = await mockApi.getAllReports();
      return { data: mockData, total: mockData.length, page: 1, limit: 20 };
    }
  },

  bulkUpdateReports: async (ids: string[], status: string, priority: string, note: string, token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/reports/bulk`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids, status, priority, note }),
      });
      return response.ok;
    } catch (error) {
      console.error('API bulkUpdateReports Error:', error);
      return false;
    }
  },

  updateReport: async (id: string, status: string, notes: string, priority: string, token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/reports/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, status, notes, priority }),
      });
      return response.ok;
    } catch (error) {
      console.error('API updateReport Error:', error);
      return false;
    }
  },

  addInternalNote: async (reportId: string, text: string, token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/reports/${reportId}/internal-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text }),
      });
      return response.ok;
    } catch (error) {
      console.error('API addInternalNote Error:', error);
      return false;
    }
  },

  sendInquiry: async (data: { name: string; email: string; department: string; message: string }): Promise<{ success: boolean; inquiry?: any }> => {
    if (isDemo()) return mockApi.sendInquiry(data);
    try {
      const response = await fetch(`${N8N_BASE_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        return { success: true, inquiry: await response.json() };
      }
      return { success: false };
    } catch (error) {
      return mockApi.sendInquiry(data);
    }
  },

  getAuditLogs: async (token: string, targetId?: string): Promise<AuditLog[]> => {
    try {
      const url = targetId ? `${N8N_BASE_URL}/admin/audit-logs?targetId=${targetId}` : `${N8N_BASE_URL}/admin/audit-logs`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      console.error('API getAuditLogs Error:', error);
      return [];
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
  },

  getInquiries: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/inquiries`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API getInquiries Error:', error);
      return [];
    }
  },

  deleteInquiry: async (id: string, token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.ok;
    } catch (error) {
      console.error('API deleteInquiry Error:', error);
      return false;
    }
  },

  // EDUCATIONAL HUB (RESOURCES) API
  getResources: async (lang?: string): Promise<Resource[]> => {
    try {
      const url = lang ? `${N8N_BASE_URL}/resources?lang=${lang}` : `${N8N_BASE_URL}/resources`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('API getResources Error:', error);
      return [];
    }
  },

  createResource: async (resource: Partial<Resource>, token: string): Promise<Resource | null> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resource),
      });
      return await response.json();
    } catch (error) {
      console.error('API createResource Error:', error);
      return null;
    }
  },

  updateResource: async (id: string, updates: Partial<Resource>, token: string): Promise<Resource | null> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/resources/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });
      return await response.json();
    } catch (error) {
      console.error('API updateResource Error:', error);
      return null;
    }
  },

  deleteResource: async (id: string, token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/resources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.ok;
    } catch (error) {
      console.error('API deleteResource Error:', error);
      return false;
    }
  },

  // EMERGENCY HOTLINES API
  getHotlines: async (lang?: string): Promise<Hotline[]> => {
    try {
      const url = lang ? `${N8N_BASE_URL}/hotlines?lang=${lang}` : `${N8N_BASE_URL}/hotlines`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('API getHotlines Error:', error);
      return [];
    }
  },

  createHotline: async (hotline: Partial<Hotline>, token: string): Promise<Hotline | null> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/hotlines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hotline),
      });
      return await response.json();
    } catch (error) {
      console.error('API createHotline Error:', error);
      return null;
    }
  },

  updateHotline: async (id: string, updates: Partial<Hotline>, token: string): Promise<Hotline | null> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/hotlines/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });
      return await response.json();
    } catch (error) {
      console.error('API updateHotline Error:', error);
      return null;
    }
  },

  deleteHotline: async (id: string, token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/hotlines/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.ok;
    } catch (error) {
      console.error('API deleteHotline Error:', error);
      return false;
    }
  },

  // SETTINGS / POLICIES API
  getSetting: async (key: string, lang: string = 'en'): Promise<Setting | null> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/settings/${key}?lang=${lang}`);
      return await response.json();
    } catch (error) {
      console.error('API getSetting Error:', error);
      return null;
    }
  },

  updateSetting: async (key: string, value: string, lang: string = 'en', token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/settings/${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value, language: lang }),
      });
      return response.ok;
    } catch (error) {
      console.error('API updateSetting Error:', error);
      return false;
    }
  },

  getAnalyticsSummary: async (token: string): Promise<any> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/analytics/summary`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      console.error('API getAnalyticsSummary Error:', error);
      return null;
    }
  },

  getGeospatialData: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/analytics/geo`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      console.error('API getGeospatialData Error:', error);
      return [];
    }
  },

  getAIInsights: async (token: string): Promise<{ insight: string }> => {
    try {
      const response = await fetch(`${N8N_BASE_URL}/admin/analytics/insights`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return await response.json();
    } catch (error) {
      console.error('API getAIInsights Error:', error);
      return { insight: "Unable to generate insights at this time." };
    }
  }
};
