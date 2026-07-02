function updateCFRM() {
    const today = new Date();
    // 17/06/2026
    const startDate = new Date(2026, 6, 2); // Month is 0-indexed in JS (5 is June)

    let daysElapsed = 0;
    // Only count if today is past or equal to start date
    if (today >= startDate) {
        const msPerDay = 1000 * 60 * 60 * 24;
        // Calculate difference in days and floor it
        daysElapsed = Math.floor((today - startDate) / msPerDay);
    }

    const counterElement = document.getElementById('counter-cfrm');
    console.log("updateCFRM executou! dias: ", daysElapsed, " elemento: ", counterElement);
    if (counterElement) {
        counterElement.innerHTML = `${daysElapsed} <span class="unit">dias</span>`;
    }
}

updateCFRM();
