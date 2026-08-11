export interface OfflineComplaint {
  category: string;
  description: string;
  latitude?: number;
  longitude?: number;
}

const STORAGE_KEY = 'gp_offline_complaints';

export function saveToOfflineQueue(complaint: OfflineComplaint): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getOfflineQueue();
    current.push(complaint);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    console.log('Grievance saved locally in offline queue:', complaint);
  } catch (error) {
    console.error('Failed to save complaint to offline queue:', error);
  }
}

export function getOfflineQueue(): OfflineComplaint[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to parse offline complaints queue:', error);
    return [];
  }
}

export function clearOfflineQueue(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export async function syncOfflineQueue(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const queue = getOfflineQueue();
  if (queue.length === 0) return false;

  console.log(`Syncing ${queue.length} offline grievances with the server...`);
  let successCount = 0;

  for (const item of queue) {
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        successCount++;
      }
    } catch (error) {
      console.error('Failed to sync offline grievance record:', error);
      // Stop syncing remaining items if network is still down
      break;
    }
  }

  // Remove the successfully synced complaints from the local queue
  const remaining = queue.slice(successCount);
  if (remaining.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  } else {
    clearOfflineQueue();
  }

  return successCount > 0;
}
