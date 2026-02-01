import api from './api';
import { toast } from 'react-toastify';

const QUEUE_KEY = 'majdoor_offline_attendance';

export const saveOfflineAttendance = (data) => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    queue.push({ ...data, timestamp: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    toast.info('📶 Offline: Check-in saved. Will sync when online.');
};

export const syncOfflineData = async () => {
    if (!navigator.onLine) return;

    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    try {
        // Prepare payload for backend sync endpoint
        const payload = { records: queue };

        await api.post('/attendance/sync', payload);

        // Clear queue on success
        localStorage.removeItem(QUEUE_KEY);
        toast.success(`✅ Synced ${queue.length} offline records!`);
    } catch (err) {
        console.error('Sync Failed:', err);
        // Keep in queue to retry later
    }
};

// Auto-sync listener
window.addEventListener('online', syncOfflineData);
