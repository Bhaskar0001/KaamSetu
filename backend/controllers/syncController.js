const OfflineSyncService = require('../services/OfflineSyncService');

exports.syncData = async (req, res) => {
    try {
        const { attendanceBatch } = req.body;

        if (!attendanceBatch || !Array.isArray(attendanceBatch)) {
            return res.status(400).json({ success: false, message: 'Invalid batch format' });
        }

        const result = await OfflineSyncService.processBatch(attendanceBatch, req.user.id);

        res.status(200).json({
            success: true,
            data: result,
            serverTime: Date.now()
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Sync failed' });
    }
};
