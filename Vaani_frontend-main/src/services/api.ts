import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { io, Socket } from 'socket.io-client';
import { 
  Visit, 
  HealthAlert, 
  Household, 
  EarningRecord, 
  UserProfile, 
  StructuredClinicalData,
  Patient 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class ApiClient {
  private client: AxiosInstance;
  private socket: Socket | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor: attach JWT token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('intelliashe_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: handle 401 & standard response format
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn('Session expired or unauthorized token.');
        }
        return Promise.reject(error.response?.data || error);
      }
    );

    this.initSocket();
  }

  private initSocket() {
    try {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000
      });

      this.socket.on('connect', () => {
        console.log('⚡ Connected to Vaani Real-Time WebSocket server');
      });

      this.socket.on('connect_error', (err) => {
        console.debug('Socket connection waiting for server:', err.message);
      });
    } catch (e) {
      console.debug('Socket.IO initialization deferred:', e);
    }
  }

  // Socket listener subscription
  public on(event: string, callback: (data: any) => void): () => void {
    if (!this.socket) {
      this.initSocket();
    }
    this.socket?.on(event, callback);
    return () => {
      this.socket?.off(event, callback);
    };
  }

  // Generic HTTP helpers
  public async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  // Auth APIs
  public async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const res = await this.client.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('intelliashe_token', res.data.token);
      localStorage.setItem('intelliashe_current_user', JSON.stringify(res.data.user));
    }
    return res.data;
  }

  public async syncClerk(payload: any): Promise<{ token: string; user: UserProfile }> {
    const res = await this.client.post('/auth/clerk-sync', payload);
    if (res.data.token) {
      localStorage.setItem('intelliashe_token', res.data.token);
      localStorage.setItem('intelliashe_current_user', JSON.stringify(res.data.user));
    }
    return res.data;
  }

  public async register(data: any): Promise<{ token: string; user: UserProfile }> {
    const res = await this.client.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('intelliashe_token', res.data.token);
      localStorage.setItem('intelliashe_current_user', JSON.stringify(res.data.user));
    }
    return res.data;
  }

  public async getMe(): Promise<UserProfile> {
    const res = await this.client.get('/auth/me');
    return res.data.user;
  }

  public logout(): void {
    localStorage.removeItem('intelliashe_token');
    localStorage.removeItem('intelliashe_current_user');
  }

  // Visits APIs
  public async getVisits(params?: any): Promise<{ visits: Visit[]; pagination?: any }> {
    const res = await this.client.get('/visits', { params });
    return res.data;
  }

  public async getVisitById(id: string): Promise<Visit> {
    const res = await this.client.get(`/visits/${id}`);
    return res.data.visit;
  }

  public async logVisit(data: {
    transcript: string;
    latitude: number;
    longitude: number;
    locationAccuracy: number;
    manualStructuredData?: StructuredClinicalData;
    audioUrl?: string;
  }): Promise<{ visit: Visit; alert: HealthAlert | null; earning: EarningRecord | null }> {
    const res = await this.client.post('/visits', data);
    return res.data;
  }

  public async extractPreview(transcript: string, village?: string): Promise<StructuredClinicalData> {
    const res = await this.client.post('/visits/extract-preview', { transcript, village });
    return res.data.structuredData;
  }

  public async updateVisit(id: string, updates: Partial<Visit>): Promise<Visit> {
    const res = await this.client.put(`/visits/${id}`, updates);
    return res.data.visit;
  }

  // Alerts APIs
  public async getAlerts(params?: any): Promise<{ alerts: HealthAlert[] }> {
    const res = await this.client.get('/alerts', { params });
    return res.data;
  }

  public async updateAlertStatus(
    id: string,
    status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED',
    supervisorNotes?: string
  ): Promise<HealthAlert> {
    const res = await this.client.put(`/alerts/${id}/status`, { status, supervisorNotes });
    return res.data.alert;
  }

  // Households APIs
  public async getHouseholds(): Promise<{ households: Household[] }> {
    const res = await this.client.get('/households');
    return res.data;
  }

  public async createHousehold(data: Partial<Household>): Promise<Household> {
    const res = await this.client.post('/households', data);
    return res.data.household;
  }

  // Incentives APIs
  public async getIncentives(workerId?: string): Promise<{ incentives: EarningRecord[]; totalEarned: number }> {
    const res = await this.client.get('/incentives', { params: { workerId } });
    return res.data;
  }

  // Analytics APIs
  public async getOverviewAnalytics(): Promise<any> {
    const res = await this.client.get('/analytics/overview');
    return res.data;
  }

  public async getVisitsAnalytics(): Promise<any> {
    const res = await this.client.get('/analytics/visits');
    return res.data;
  }

  public async getHealthAnalytics(): Promise<any> {
    const res = await this.client.get('/analytics/health');
    return res.data;
  }

  // Health Check API
  public async getHealth(): Promise<{ status: string; service: string; database: string; realtime: string; timestamp: string }> {
    const res = await this.client.get('/health');
    return res.data;
  }

  public isSocketConnected(): boolean {
    return !!this.socket?.connected;
  }

  // Patients APIs
  public async getPatients(params?: { householdId?: string }): Promise<{ patients: Patient[] }> {
    const res = await this.client.get('/patients', { params });
    return res.data;
  }

  public async getPatientById(id: string): Promise<Patient> {
    const res = await this.client.get(`/patients/${id}`);
    return res.data.patient;
  }

  public async createPatient(data: {
    householdId: string;
    name: string;
    age?: number | null;
    gender?: string | null;
    patientCategory?: string | null;
  }): Promise<Patient> {
    const res = await this.client.post('/patients', data);
    return res.data.patient;
  }

  public async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    const res = await this.client.put(`/patients/${id}`, data);
    return res.data.patient;
  }

  // Map Bhopal Visits
  public async getBhopalVisits(): Promise<{ visits: any[] }> {
    const res = await this.client.get('/visits/bhopal-visits');
    return res.data;
  }

  // Follow-ups APIs
  public async getFollowUps(params?: any): Promise<{ followUps: any[] }> {
    const res = await this.client.get('/followups', { params });
    return res.data;
  }

  public async createFollowUp(data: any): Promise<any> {
    const res = await this.client.post('/followups', data);
    return res.data.followUp;
  }

  public async updateFollowUp(id: string, data: any): Promise<any> {
    const res = await this.client.put(`/followups/${id}`, data);
    return res.data.followUp;
  }

  // Claude / AI Diagnose API
  public async diagnoseWithClaude(payload: { symptoms: string[]; patientDetails?: any; vitals?: any }): Promise<any> {
    const res = await this.client.post('/claude/diagnose', payload);
    return res.data;
  }
}

export const api = new ApiClient();
export const apiService = api;

