// Utility to calculate daily wage including overtime
exports.calculateDailyWage = (baseWage, workHours) => {
    const STANDARD_HOURS = 8;
    const OVERTIME_MULTIPLIER = 1.5;

    let totalPay = 0;
    let overtimeHours = 0;

    if (workHours <= STANDARD_HOURS) {
        // Pro-rata if less than 8? Or fixed daily? Assuming daily wage is for 8 hours.
        // If hourly rate is derived: hourly = wage / 8
        const hourlyRate = baseWage / STANDARD_HOURS;
        totalPay = hourlyRate * workHours;
    } else {
        overtimeHours = workHours - STANDARD_HOURS;
        const hourlyRate = baseWage / STANDARD_HOURS;
        const normalPay = baseWage; // for first 8 hours
        const overtimePay = overtimeHours * hourlyRate * OVERTIME_MULTIPLIER;
        totalPay = normalPay + overtimePay;
    }

    return {
        totalPay: Math.round(totalPay),
        overtimeHours,
        breakdown: {
            base: baseWage,
            overtime: Math.round(totalPay - baseWage)
        }
    };
};
