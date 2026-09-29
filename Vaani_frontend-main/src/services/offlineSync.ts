import { OfflineDraftVisit, Visit } from '../types';

type SyncListener = (status: {
  isOnline: boolean;
  pendingCount: number;
  syncState: 'idle' | 'syncing' | 'synced' | 'failed';
}) => void;

class OfflineSyncService {
  private readonly STORAGE_KEY = 'intelliashe_offline_drafts';
  private listeners: Set<SyncListener> = new Set();
  private isSyncing = false;
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners();
        this.processSyncQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners();
      });
    }
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public getPendingDrafts(): OfflineDraftVisit[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading offline drafts from localStorage:', e);
      return [];
    }
  }

  public saveDraft(draft: Omit<OfflineDraftVisit, 'localId' | 'syncStatus'>): OfflineDraftVisit {
    const fullDraft: OfflineDraftVisit = {
      ...draft,
      localId: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      syncStatus: 'idle'
    };

    const current = this.getPendingDrafts();
    current.unshift(fullDraft);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
    this.notifyListeners();

    // If online, trigger auto sync
    if (this.isOnline) {
      this.processSyncQueue();
    }

    return fullDraft;
  }

  public removeDraft(localId: string) {
    const current = this.getPendingDrafts().filter((d) => d.localId !== localId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
    this.notifyListeners();
  }

  public updateDraftStatus(localId: string, status: OfflineDraftVisit['syncStatus'], error?: string) {
    const current = this.getPendingDrafts().map((d) => {
      if (d.localId === localId) {
        return { ...d, syncStatus: status, syncError: error };
      }
      return d;
    });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
    this.notifyListeners();
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener({
      isOnline: this.isOnline,
      pendingCount: this.getPendingDrafts().length,
      syncState: this.isSyncing ? 'syncing' : 'idle'
    });
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const drafts = this.getPendingDrafts();
    const payload = {
      isOnline: this.isOnline,
      pendingCount: drafts.length,
      syncState: (this.isSyncing ? 'syncing' : (drafts.length === 0 ? 'synced' : 'idle')) as any
    };
    this.listeners.forEach((l) => l(payload));
  }

  public async processSyncQueue(syncExecutor?: (draft: OfflineDraftVisit) => Promise<Visit>): Promise<void> {
    if (!this.isOnline || this.isSyncing) return;

    const drafts = this.getPendingDrafts();
    if (drafts.length === 0) return;

    this.isSyncing = true;
    this.notifyListeners();

    for (const draft of drafts) {
      try {
        this.updateDraftStatus(draft.localId, 'syncing');
        if (syncExecutor) {
          await syncExecutor(draft);
        }
        this.removeDraft(draft.localId);
      } catch (err: any) {
        console.error(`Failed to sync draft ${draft.localId}:`, err);
        this.updateDraftStatus(draft.localId, 'failed', err.message || 'Sync failed');
      }
    }

    this.isSyncing = false;
    this.notifyListeners();
  }
}

export const offlineSyncService = new OfflineSyncService();
