/**
 * github_calendar.js
 * Calendário de Contribuições estilo GitHub
 * -----------------------------------------
 * - Gera dados de demonstração realistas
 * - Renderiza grid de semanas/dias com labels de meses
 * - Tooltip interativo
 * - Navegação por ano
 * - Stats: streak, total, melhor dia, média semanal
 *
 * Para integrar com dados reais do Django, substitua
 * a função `generateDemoData` por uma chamada à API.
 */

'use strict';

/* ── Configuração ──────────────────────────────────────────── */
const DAYS_PT   = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CELL_SIZE = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size')) || 13;
const CELL_GAP  = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-gap'))  || 3;

/* ── Estado ────────────────────────────────────────────────── */
let currentYear = new Date().getFullYear();

/* ── Helpers de data ────────────────────────────────────────── */
function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInYear(y) {
    return isLeapYear(y) ? 366 : 365;
}

/** Retorna um objeto Date para o primeiro dia do ano */
function firstDayOfYear(y) {
    return new Date(y, 0, 1);
}

/** Formata uma data como 'dd/mm/aaaa' */
function formatDate(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}/${date.getFullYear()}`;
}

/** Verifica se uma data é hoje */
function isToday(date) {
    const now = new Date();
    return date.getDate()     === now.getDate() &&
           date.getMonth()    === now.getMonth() &&
           date.getFullYear() === now.getFullYear();
}

/* ── Geração de dados de demonstração ──────────────────────── */
/**
 * Retorna um mapa: 'YYYY-MM-DD' → count (0–20)
 * Simula padrões realistas: semanas mais ativas, fins de semana menores.
 * 
 * Para integrar com Django, substitua esta função por:
 *   const data = await fetch('/api/contributions/?year=' + year).then(r => r.json());
 *   return data;  // deve retornar { 'YYYY-MM-DD': count, ... }
 */
function generateDemoData(year) {
    const data = {};
    const total = daysInYear(year);
    const start = new Date(year, 0, 1);
    const today = new Date();

    for (let i = 0; i < total; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);

        // Não mostra dados futuros
        if (d > today) break;

        const key = d.toISOString().slice(0, 10);
        const dow = d.getDay(); // 0=Dom, 6=Sáb

        // Base aleatória com padrões
        let base = Math.random();
        if (dow === 0 || dow === 6) base *= 0.4;  // fins de semana menos ativos
        if (dow >= 1 && dow <= 5)   base *= 1.2;  // dias úteis mais ativos

        // Semanas de "pico" (clusters)
        const week = Math.floor(i / 7);
        if (week % 3 === 0) base *= 1.8;

        // Converte para contagem 0-20
        const count = base > 0.55 ? Math.floor(base * 20) : 0;
        data[key] = count;
    }
    return data;
}

/* ── Mapeamento de contagem para nível ─────────────────────── */
function countToLevel(count) {
    if (count === 0)  return 0;
    if (count <= 3)   return 1;
    if (count <= 7)   return 2;
    if (count <= 13)  return 3;
    return 4;
}

/* ── Cálculo de stats ──────────────────────────────────────── */
function calcStats(data) {
    const values   = Object.values(data);
    const total    = values.reduce((s, v) => s + v, 0);
    const bestDay  = Math.max(0, ...values);

    // Streak atual (dias consecutivos até hoje com count > 0)
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        if ((data[key] || 0) > 0) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    // Média semanal (semanas com pelo menos 1 atividade)
    const weeks = {};
    Object.entries(data).forEach(([key, count]) => {
        const d    = new Date(key);
        const week = `${d.getFullYear()}-W${String(Math.ceil((d - new Date(d.getFullYear(), 0, 1)) / 604800000)).padStart(2, '0')}`;
        weeks[week] = (weeks[week] || 0) + count;
    });
    const weekValues = Object.values(weeks);
    const avg = weekValues.length
        ? Math.round(weekValues.reduce((s, v) => s + v, 0) / weekValues.length)
        : 0;

    return { total, bestDay, streak, avg };
}

/* ── Construção do DOM do calendário ───────────────────────── */
function buildCalendar(year, data) {
    const container = document.getElementById('cal-inner');
    container.innerHTML = '';

    const cellPx   = CELL_SIZE + CELL_GAP;
    const start    = firstDayOfYear(year);
    const startDow = start.getDay(); // 0=Dom
    const total    = daysInYear(year);
    const today    = new Date();

    /* Cria array de todas as células do grid
       (células vazias no início para alinhar ao dia da semana) */
    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(null);        // padding
    for (let i = 0; i < total; i++) {
        const d = new Date(year, 0, i + 1);
        cells.push(d);
    }

    /* Preenche semanas completas no final */
    while (cells.length % 7 !== 0) cells.push(null);

    const numWeeks = cells.length / 7;

    /* --- Linha dos meses --- */
    const monthsRow = document.createElement('div');
    monthsRow.className = 'months-row';

    // Computa quantas semanas cada mês ocupa para definir a largura dos labels
    let currentMonth = -1;
    const monthWidths = {};  // month index → number of weeks
    for (let w = 0; w < numWeeks; w++) {
        // Pega o dia representativo da semana (o dia real mais presente)
        const weekCells = cells.slice(w * 7, w * 7 + 7).filter(Boolean);
        if (!weekCells.length) continue;
        const m = weekCells[Math.floor(weekCells.length / 2)].getMonth();
        monthWidths[m] = (monthWidths[m] || 0) + 1;
    }

    // Renderiza labels de meses
    let renderedMonths = new Set();
    let weekPointer = 0;
    for (let m = 0; m < 12; m++) {
        if (!monthWidths[m]) continue;
        const label = document.createElement('span');
        label.className = 'month-label';
        label.textContent = MONTHS_PT[m];
        label.style.width = (monthWidths[m] * cellPx) + 'px';
        monthsRow.appendChild(label);
    }

    container.appendChild(monthsRow);

    /* --- Corpo do grid: labels dos dias + semanas --- */
    const gridBody = document.createElement('div');
    gridBody.className = 'grid-body';

    // Labels dos dias da semana (apenas Dom, Ter, Qui, Sáb visíveis para compactar)
    const weekdayLabels = document.createElement('div');
    weekdayLabels.className = 'weekday-labels';
    DAYS_PT.forEach((d, i) => {
        const span = document.createElement('span');
        span.className = 'weekday-label';
        // Mostra apenas Segunda, Quarta e Sexta (como o GitHub)
        span.textContent = (i === 1 || i === 3 || i === 5) ? d : '';
        weekdayLabels.appendChild(span);
    });
    gridBody.appendChild(weekdayLabels);

    // Container das semanas
    const weeksContainer = document.createElement('div');
    weeksContainer.className = 'weeks-container';

    for (let w = 0; w < numWeeks; w++) {
        const weekCol = document.createElement('div');
        weekCol.className = 'week-col';

        for (let dow = 0; dow < 7; dow++) {
            const date = cells[w * 7 + dow];
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (!date) {
                // Célula de padding
                cell.classList.add('empty');
            } else {
                const key   = date.toISOString().slice(0, 10);
                const count = data[key] || 0;
                const level = countToLevel(count);
                cell.classList.add(`level-${level}`);

                if (isToday(date)) cell.classList.add('today');

                // Acessibilidade
                cell.setAttribute('role', 'gridcell');
                cell.setAttribute('aria-label', `${formatDate(date)}: ${count} contribuições`);
                cell.dataset.date  = key;
                cell.dataset.count = count;

                // Tooltip
                cell.addEventListener('mouseenter', showTooltip);
                cell.addEventListener('mousemove',  moveTooltip);
                cell.addEventListener('mouseleave', hideTooltip);
            }

            weekCol.appendChild(cell);
        }

        weeksContainer.appendChild(weekCol);
    }

    gridBody.appendChild(weeksContainer);
    container.appendChild(gridBody);
}

/* ── Tooltip ────────────────────────────────────────────────── */
const tooltip = document.getElementById('cal-tooltip');

function showTooltip(e) {
    const cell  = e.currentTarget;
    const count = parseInt(cell.dataset.count, 10);
    const date  = new Date(cell.dataset.date + 'T12:00:00');

    const dayName  = DAYS_PT[date.getDay()];
    const dateFmt  = formatDate(date);
    const noun     = count === 1 ? 'contribuição' : 'contribuições';

    tooltip.innerHTML = count > 0
        ? `<strong>${count} ${noun}</strong> em ${dayName}, ${dateFmt}`
        : `Nenhuma contribuição em ${dayName}, ${dateFmt}`;

    tooltip.classList.add('visible');
    tooltip.removeAttribute('aria-hidden');
    positionTooltip(e);
}

function moveTooltip(e) {
    positionTooltip(e);
}

function hideTooltip() {
    tooltip.classList.remove('visible');
    tooltip.setAttribute('aria-hidden', 'true');
}

function positionTooltip(e) {
    const margin = 12;
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    let x = e.clientX + margin;
    let y = e.clientY - th - margin;

    // Não sair da tela
    if (x + tw > window.innerWidth  - 8) x = e.clientX - tw - margin;
    if (y < 8)                            y = e.clientY + margin;

    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
}

/* ── Atualização dos stats no DOM ──────────────────────────── */
function updateStats(stats) {
    document.getElementById('streak-val').textContent = stats.streak;
    document.getElementById('total-val').textContent  = stats.total;
    document.getElementById('best-val').textContent   = stats.bestDay;
    document.getElementById('avg-val').textContent    = stats.avg;

    const summary = document.getElementById('contributions-summary');
    summary.textContent = `${stats.total} contribuições em ${currentYear}`;
}

/* ── Render completo ────────────────────────────────────────── */
function render(year) {
    document.getElementById('year-label').textContent = year;

    // Aqui você pode trocar generateDemoData por dados reais da API Django:
    // const data = await fetchContributions(year);
    const data  = generateDemoData(year);
    const stats = calcStats(data);

    buildCalendar(year, data);
    updateStats(stats);
}

/* ── Navegação de ano ───────────────────────────────────────── */
document.getElementById('btn-prev').addEventListener('click', () => {
    currentYear--;
    render(currentYear);
});

document.getElementById('btn-next').addEventListener('click', () => {
    const maxYear = new Date().getFullYear();
    if (currentYear < maxYear) {
        currentYear++;
        render(currentYear);
    }
});

/* ── Init ───────────────────────────────────────────────────── */
render(currentYear);
