import axios from 'axios';

// Simple queue-based sync manager
export const syncQueue = async () => {
    if (!navigator.onLine) return;

    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} items...`);

    const newQueue = [];
    for (const item of queue) {
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };

            if (item.type === 'CHECK_IN') {
                await axios.post('http://localhost:5000/api/attendance/check-in', item.payload, config);
            }
            // Add other types here
        } catch (err) {
            console.error('Sync failed for item', item, err);
            newQueue.push(item); // Keep in queue if failed (maybe due to server error, not network)
        }
    }

    localStorage.setItem('offlineQueue', JSON.stringify(newQueue));
    if (newQueue.length === 0) {
        alert('All offline data synced successfully!');
    }
};

export const addToQueue = (type, payload) => {
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    queue.push({ type, payload, timestamp: Date.now() });
    localStorage.setItem('offlineQueue', JSON.stringify(queue));
    alert('You are offline. Data saved locally and will sync when online.');
};
