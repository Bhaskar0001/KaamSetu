const User = require('../models/User');
const Job = require('../models/Job');
const Attendance = require('../models/Attendance');

// @desc    Get Today's Screen Data (Context Aware)
// @route   GET /api/engagement/today
// @access  Private
exports.getTodayScreen = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ success: false, message: 'User context missing' });
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        let data = {
            role: user.role,
            greeting: `Namaste, ${user.name ? user.name.split(' ')[0] : 'User'}`,
            stats: user.stats || {},
            badges: user.badges || [],
            tips: getDailyTip()
        };

        if (user.role === 'worker') {
            // Check Attendance
            const attendance = await Attendance.findOne({
                worker: user.id,
                date: { $gte: todayStart }
            });

            data.attendance = attendance ? { status: 'PRESENT', time: attendance.checkInTime } : { status: 'PENDING' };

            // Logic: Default to Find Jobs (Real World Flow)
            // Workers want work first. Attendance is secondary or implicit.
            data.mainAction = { type: 'FIND_JOBS', label: 'Find New Jobs (काम ढूंढें)', icon: 'search' };

            // Earnings (Mock logic for now, or aggregate from payments)
            data.stats.earningsToday = 0; // Replace with actual payment query later

        } else if (user.role === 'thekedar') {
            // Thekedar Logic
            const workers = await User.find({ _id: { $in: user.myWorkers } });
            const presentCount = await Attendance.countDocuments({
                worker: { $in: user.myWorkers },
                date: { $gte: todayStart }
            });

            data.stats.activeWorkers = presentCount;
            data.stats.totalWorkers = workers.length;
            data.mainAction = { type: 'VIEW_SITE', label: 'View Live Sites (साइट देखें)', icon: 'map' };
        }

        res.status(200).json({ success: true, data });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Helper: Rotating Tips
const getDailyTip = () => {
    const tips = [
        "Time is money! (समय ही पैसा है)",
        "Clear selfies get faster approval.",
        "Update your skills to earn more."
    ];
    return tips[Math.floor(Math.random() * tips.length)];
};
