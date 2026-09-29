import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../utils/demoData';
import { api } from './api';

class AuthService {
  private readonly USER_STORAGE_KEY = 'intelliashe_current_user';
  private currentUser: UserProfile | null = null;
  private listeners: Set<(user: UserProfile | null) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.USER_STORAGE_KEY);
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
        } catch (e) {
          this.currentUser = DEMO_USERS[0];
        }
      } else {
        this.currentUser = DEMO_USERS[0];
      }
    }
  }

  public getCurrentUser(): UserProfile {
    if (!this.currentUser) {
      this.currentUser = DEMO_USERS[0];
    }
    return this.currentUser;
  }

  public async loginWithCredentials(email: string, password: string): Promise<UserProfile> {
    const res = await api.login(email, password);
    this.setUser(res.user);
    return res.user;
  }

  public switchRole(role: UserRole): UserProfile {
    const user = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    this.setUser(user);
    return user;
  }

  public switchUserById(uid: string): UserProfile {
    const user = DEMO_USERS.find((u) => u.uid === uid) || DEMO_USERS[0];
    this.setUser(user);
    return user;
  }

  public setUser(user: UserProfile | null) {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.USER_STORAGE_KEY);
        localStorage.removeItem('intelliashe_token');
      }
    }
    this.listeners.forEach((l) => l(this.currentUser));
  }

  public subscribe(listener: (user: UserProfile | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => this.listeners.delete(listener);
  }

  public logout() {
    api.logout();
    this.setUser(null);
  }
}

export const authService = new AuthService();
