function updateTelemetry() {
    const today = new Date('2026-06-20'); // Hardcoded for this example, normally new Date()
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // JS months are 0-11
    const day = today.getDate();

    // Base Calculation Data
    const birthYear = 2005;
    let age = year - birthYear;
    let isCycleA = false;

    // Determine Cycle
    if (month > 6 || (month === 6 && day >= 17)) {
        isCycleA = true;
    } else {
        age -= 1; // Before birthday, still previous age
    }

    const versionStr = `NAWADAP ${age}${isCycleA ? 'A' : 'B'}`;
    document.getElementById('nawadap-version').innerText = versionStr;

    // Calculate Days
    let totalDays, startOfCycle, endOfCycle;

    if (isCycleA) {
        startOfCycle = new Date(year, 5, 17); // June 17
        endOfCycle = new Date(year, 11, 31); // Dec 31
        totalDays = 198;
    } else {
        startOfCycle = new Date(year, 0, 1); // Jan 1
        endOfCycle = new Date(year, 5, 16); // June 16
        // Check for Leap Year
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        totalDays = isLeapYear ? 168 : 167;
    }

    // Time deltas
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysElapsed = Math.floor((today - startOfCycle) / msPerDay) + 1;
    const daysRemaining = totalDays - daysElapsed;
    const percentage = (daysElapsed / totalDays) * 100;

    // Update DOM Elements
    document.getElementById('days-elapsed').innerText = daysElapsed;
    document.getElementById('days-left').innerText = daysRemaining;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

// Initialize system
updateTelemetry();
