'use strict';

/* ── Contadores originais (mantidos) ────────────────────────── */
function updateEnglishCounter() {
    const today     = new Date();
    const startDate = new Date(2026, 5, 17); // 17/06/2026
    let daysElapsed = 0;
    if (today >= startDate) {
        daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    }
    const el = document.getElementById('counter-english');
    if (el) el.innerHTML = `${daysElapsed} <span class="podium-unit">dias</span>`;
}

function updateDailyStudiesCounter() {
    const today     = new Date();
    const startDate = new Date(2025, 11, 13); // 13/12/2025
    let daysElapsed = 0;
    if (today >= startDate) {
        daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    }
    const el = document.getElementById('counter-listening');
    if (el) el.innerHTML = `${daysElapsed} <span class="podium-unit">dias</span>`;
}

/* ── Mini-heatmap dos chips do pódio ────────────────────────── */
const PODIUM_CONFIGS = [
    { containerId: 'hm-english',   startDate: new Date(2026, 5, 17)  },
    { containerId: 'hm-listening', startDate: new Date(2025, 11, 13) },
];

const MINI_WEEKS = 12;

function daysBetween(d1, d2) {
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

function miniLevel(dayIndex, totalDays) {
    if (totalDays <= 0) return 1;
    const r = dayIndex / totalDays;
    if (r < 0.25) return 1;
    if (r < 0.50) return 2;
    if (r < 0.75) return 3;
    return 4;
}

function buildMiniHeatmap(containerId, startDate) {
    const wrap = document.getElementById(containerId);
    if (!wrap) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate = new Date(startDate);
    startDate.setHours(0, 0, 0, 0);

    const totalActive = today >= startDate ? daysBetween(startDate, today) : 0;

    // Janela: últimas MINI_WEEKS semanas, alinhada ao Domingo
    const winEnd   = new Date(today);
    const winStart = new Date(today);
    winStart.setDate(winStart.getDate() - (MINI_WEEKS * 7 - 1));
    winStart.setDate(winStart.getDate() - winStart.getDay()); // alinha ao Dom

    const totalCells = MINI_WEEKS * 7;
    const dates = [];
    for (let i = 0; i < totalCells; i++) {
        const d = new Date(winStart);
        d.setDate(d.getDate() + i);
        dates.push(d);
    }

    wrap.innerHTML = '';
    for (let w = 0; w < MINI_WEEKS; w++) {
        const col = document.createElement('div');
        col.className = 'pm-col';
        for (let dow = 0; dow < 7; dow++) {
            const date = dates[w * 7 + dow];
            const cell = document.createElement('div');
            cell.className = 'pm-cell';

            if (date > today) {
                cell.classList.add('pm-empty');
            } else if (date < startDate) {
                cell.classList.add('pm-inactive');
            } else {
                const idx   = daysBetween(startDate, date);
                const level = miniLevel(idx, totalActive);
                cell.classList.add(`pm-active-${level}`);
            }
            col.appendChild(cell);
        }
        wrap.appendChild(col);
    }
}

function buildPodiumMiniHeatmaps() {
    // Hábitos com startDate fixo
    PODIUM_CONFIGS.forEach(cfg => {
        buildMiniHeatmap(cfg.containerId, cfg.startDate);
    });

    // Engineering: startDate calculado a partir do streak do Django (data-streak)
    const hmEng = document.getElementById('hm-engineering');
    if (hmEng) {
        const streak = parseInt(hmEng.dataset.streak, 10);
        if (!isNaN(streak) && streak > 0) {
            const today     = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - streak);
            buildMiniHeatmap('hm-engineering', startDate);
        }
    }
}

/* ── Init ───────────────────────────────────────────────────── */
updateEnglishCounter();
updateDailyStudiesCounter();
buildPodiumMiniHeatmaps();