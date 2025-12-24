
import { Report, ReportStatus, Admin, AuditLog } from '../types';
import { mockApi } from './mockApi';

const N8N_BASE_URL = 'https://your-n8n-instance.com/webhook';
const isDemo = () => N8N_BASE_URL.includes('your-n8n-instance.com');

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
      const response = await fetch(`${N8N_BASE_URL}/admin-reports`, {
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
      const response = await fetch(`${N8N_BASE_URL}/update-report`, {
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
    return [
      { id: 'l1', adminId: '1', action: 'System Login', timestamp: new Date().toISOString(), reportId: 'N/A', details: 'Authorized session established' },
      { id: 'l2', adminId: '1', action: 'Accessed Case', timestamp: new Date(Date.now() - 3600000).toISOString(), reportId: 'CH-102933', details: 'Forensic review of attachments' }
    ];
  },

  // Admin Management API
  getAllAdmins: async (token: string): Promise<Admin[]> => {
    if (isDemo()) return mockApi.getAllAdmins();
    return mockApi.getAllAdmins();
  },

  createAdmin: async (admin: Partial<Admin>, token: string): Promise<Admin> => {
    return mockApi.createAdmin(admin);
  },

  updateAdmin: async (id: string, updates: Partial<Admin>, token: string): Promise<Admin | null> => {
    return mockApi.updateAdmin(id, updates);
  },

  deleteAdmin: async (id: string, token: string): Promise<boolean> => {
    return mockApi.deleteAdmin(id);
  }
};
