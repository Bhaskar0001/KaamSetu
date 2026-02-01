import Dexie from 'dexie';

export const db = new Dexie('KaamSetuOfflineDB');

db.version(1).stores({
    // Primary key: id (auto-increment)
    // Indexes: siteId, timestamp, synced
    attendance: '++id, siteId, timestamp, [synced+timestamp]',

    // For caching sites/jobs when offline
    sites: 'id',
    jobs: 'id',

    // Key-value store for offline auth tokens/secrets
    secrets: 'key'
});

// Helper to check net status
export const isOnline = () => navigator.onLine;

// Save attendance locally
export const saveOfflineAttendance = async (attendanceData) => {
    return await db.attendance.add({
        ...attendanceData,
        timestamp: Date.now(),
        synced: 0 // 0 = false, 1 = true
    });
};

// Get pending items
export const getPendingAttendance = async () => {
    return await db.attendance.where('synced').equals(0).toArray();
};

export const markAsSynced = async (id) => {
    return await db.attendance.update(id, { synced: 1 });
};
