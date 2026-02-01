const Site = require('../models/Site');
const Attendance = require('../models/Attendance');
const AuditService = require('../services/AuditService');

// Bulk Assign Workers to Site
exports.bulkAssign = async (req, res) => {
    try {
        const { siteId } = req.params;
        const { workerIds } = req.body;

        if (!Array.isArray(workerIds) || workerIds.length === 0) {
            return res.status(400).json({ success: false, message: 'No workers provided' });
        }

        const site = await Site.findById(siteId);
        if (!site) return res.status(404).json({ success: false, message: 'Site not found' });

        // Add workers to site's worker list if not already present
        let count = 0;
        workerIds.forEach(id => {
            if (!site.workers.includes(id)) {
                site.workers.push(id);
                count++;
            }
        });

        await site.save();

        await AuditService.logEvent('BULK_ASSIGN', req.user, { siteId, count }, req);

        res.status(200).json({ success: true, message: `${count} workers assigned` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Bulk Assign Failed' });
    }
};

// Bulk Attendance
exports.bulkAttendance = async (req, res) => {
    try {
        const { records, date, siteId } = req.body; // records: [{ workerId, status }]

        if (!Array.isArray(records)) {
            return res.status(400).json({ success: false, message: 'Invalid records' });
        }

        const attendanceDate = date ? new Date(date) : new Date();
        const results = [];

        for (const record of records) {
            // Upsert attendance for that day
            const att = await Attendance.findOneAndUpdate(
                { worker: record.workerId, date: { $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)), $lt: new Date(attendanceDate.setHours(23, 59, 59, 999)) } },
                {
                    worker: record.workerId,
                    site: siteId,
                    status: record.status, // 'present', 'absent'
                    date: attendanceDate,
                    markedBy: req.user._id
                },
                { upsert: true, new: true }
            );
            results.push(att._id);
        }

        await AuditService.logEvent('BULK_ATTENDANCE', req.user, { siteId, count: results.length }, req);

        res.status(200).json({ success: true, count: results.length });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Bulk Attendance Failed' });
    }
};
