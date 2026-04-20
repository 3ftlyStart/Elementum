import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface PendingSyncItem {
  id: string;
  type: 'sample' | 'job';
  data: any;
  timestamp: string;
}

const STORAGE_KEY = 'elementum_sync_queue';

export const getSyncQueue = (): PendingSyncItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addToSyncQueue = (type: 'sample' | 'job', data: any) => {
  const queue = getSyncQueue();
  const newItem: PendingSyncItem = {
    id: Math.random().toString(36).substring(7),
    type,
    data,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...queue, newItem]));
  return newItem;
};

export const clearSyncItem = (id: string) => {
  const queue = getSyncQueue();
  const filtered = queue.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const processSyncQueue = async () => {
  if (!navigator.onLine) return;
  
  const queue = getSyncQueue();
  if (queue.length === 0) return;

  console.log(`Processing sync queue: ${queue.length} items`);

  for (const item of queue) {
    try {
      const collectionName = item.type === 'sample' ? 'samples' : 'jobs';
      await addDoc(collection(db, collectionName), item.data);
      clearSyncItem(item.id);
      console.log(`Synced ${item.type} [${item.id}] successfully.`);
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error);
      // Stop processing if online but failing (auth issues etc)
      break;
    }
  }
};
