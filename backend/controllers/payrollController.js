const { calculateDailyWage } = require('../utils/payroll');

// Calculate Wage API
exports.getWageEstimate = async (req, res) => {
    try {
        const { baseWage, workHours } = req.body;

        if (!baseWage || !workHours) {
            return res.status(400).json({ success: false, message: 'Please provide baseWage and workHours' });
        }

        const estimate = calculateDailyWage(Number(baseWage), Number(workHours));

        res.status(200).json({
            success: true,
            data: estimate
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Calculation Failed' });
    }
};
