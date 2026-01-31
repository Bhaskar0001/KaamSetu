// Helper to calculate distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
    var R = 6371;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

const matchingEngine = {
    calculateScore: (job, worker) => {
        let score = 0;

        // 1. Skill Match (50%)
        if (job.requiredSkills && job.requiredSkills.length > 0 && worker.skills) {
            const matchedSkills = job.requiredSkills.filter(skill =>
                worker.skills.some(ws => ws.toLowerCase() === skill.toLowerCase())
            );
            const ratio = matchedSkills.length / job.requiredSkills.length;
            score += (ratio * 50);
        }

        // 2. Location Match (30%)
        // If within 5km -> Full 30 points. Decays afterwards.
        if (job.location && worker.location && worker.location.lat) {
            const dist = getDistanceFromLatLonInKm(
                job.location.lat, job.location.lng,
                worker.location.lat, worker.location.lng
            );
            if (dist <= 5) score += 30;
            else if (dist <= 20) score += 15;
            else if (dist <= 50) score += 5;
        }

        // 3. Rating Match (20%)
        if (worker.averageRating) {
            // Normalize rating (0-5) to 0-20 points
            const ratingScore = (worker.averageRating / 5) * 20;
            score += ratingScore;
        }

        // 4. Fraud Penalty
        if (worker.riskScore > 50) score -= 30;

        return Math.min(Math.max(score, 0), 100); // Clamp 0-100
    }
};

module.exports = matchingEngine;
