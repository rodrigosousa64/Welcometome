/**
 * habitos_calendar.js
 * ─────────────────────────────────────────────────────────────
 * Transforma cada "hábito/contador" (que tem uma data de início)
 * num card com heatmap estilo GitHub.
 *
 * Lógica:
 *   - Todos os dias desde `startDate` até HOJE ficam "ativos"
 *   - A intensidade da cor aumenta quanto mais o dia fica próximo
 *     ao presente (mostra a progressão visual do contador)
 *   - Dias antes do início = células cinza/inativas
 *   - Dias futuros = células transparentes
 *
 * Para integrar com Django: popule o array HABITOS a partir de
 * dados passados pelo contexto ou via fetch('/api/habitos/').
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

/* ════════════════════════════════════════════════════════════
   CONFIGURAÇÃO DOS HÁBITOS
   Cada objeto representa um contador do projeto.
   startDate: new Date(ano, mês-1, dia)  ← mês começa em 0!
   ════════════════════════════════════════════════════════════ */
const HABITOS = [
    {
        id:        'english',
        name:      'Shadowing diário',
        desc:      'Prática diária de shadowing para fluência em inglês',
        startDate: new Date(2026, 5, 17),  // 17/06/2026
    },
    {
        id:        'listening',
        name:      'Listening em inglês',
        desc:      'Rotina de listening diário em inglês desde Dezembro de 2025',
        startDate: new Date(2025, 11, 13), // 13/12/2025
    },
    {
        id:        'Mandarin',
        name:      'Learning Mandarin',
        desc:      'Rotina de Mandarin diário desde 13/07/2026',
        startDate: new Date(2026, 6, 13), // 13/07/2026
    }
];

/* ════════════════════════════════════════════════════════════
   CONSTANTES
   ════════════════════════════════════════════════════════════ */
const DAYS_PT   = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Quantas semanas mostrar no heatmap (≈ últimas N semanas visíveis)
const WEEKS_TO_SHOW = 26;   // ~6 meses — compacto mas informativo

// Tamanho e gap das células (pixels) — sincronizado com o CSS
const CELL_PX = 10;
const GAP_PX  = 2;

/* ════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════ */

/** Dias entre duas datas (d2 - d1), sem contar horas */
function daysBetween(d1, d2) {
    const ms = 1000 * 60 * 60 * 24;
    return Math.floor((d2 - d1) / ms);
}

/** Formata Date → 'dd/mm/aaaa' */
function fmt(date) {
    return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
}

/** Retorna true se `date` é hoje */
function isToday(date) {
    const n = new Date();
    return date.getDate()  === n.getDate()  &&
           date.getMonth() === n.getMonth() &&
           date.getFullYear() === n.getFullYear();
}

/**
 * Converte "quão recente é o dia ativo" em nível de cor (1–4).
 * - Dias mais antigos dentro do período → nível 1 (mais escuro)
 * - Dias mais recentes → nível 4 (verde brilhante)
 * `totalDays` = total de dias ativos do contador
 * `dayIndex`  = posição do dia no período (0 = início)
 */
function dayToLevel(dayIndex, totalDays) {
    if (totalDays <= 0) return 1;
    const ratio = dayIndex / totalDays;
    if (ratio < 0.25) return 1;
    if (ratio < 0.50) return 2;
    if (ratio < 0.75) return 3;
    return 4;
}

/* ════════════════════════════════════════════════════════════
   TOOLTIP
   ════════════════════════════════════════════════════════════ */
let tooltip = null;

function createTooltip() {
    tooltip = document.createElement('div');
    tooltip.className = 'hm-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tooltip);
}

function showTooltip(e) {
    const cell  = e.currentTarget;
    const state = cell.dataset.state;
    const date  = new Date(cell.dataset.date + 'T12:00:00');
    const dayN  = parseInt(cell.dataset.day || '0', 10);
    const name  = cell.dataset.name || '';

    if (state === 'inactive') {
        tooltip.innerHTML = `Antes do início — ${fmt(date)}`;
    } else if (state === 'active') {
        tooltip.innerHTML = `<strong>Dia ${dayN + 1}</strong> de ${name} — ${fmt(date)}`;
    } else {
        tooltip.innerHTML = fmt(date);
    }

    tooltip.classList.add('visible');
    tooltip.removeAttribute('aria-hidden');
    moveTooltip(e);
}

function moveTooltip(e) {
    const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
    let x = e.clientX + 14, y = e.clientY - th - 10;
    if (x + tw > window.innerWidth  - 8) x = e.clientX - tw - 14;
    if (y < 8)                            y = e.clientY + 14;
    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
}

function hideTooltip() {
    tooltip.classList.remove('visible');
    tooltip.setAttribute('aria-hidden', 'true');
}

/* ════════════════════════════════════════════════════════════
   CONSTRUÇÃO DO HEATMAP
   ════════════════════════════════════════════════════════════ */

/**
 * Constrói o heatmap para um hábito e retorna o elemento DOM.
 * @param {Object} habito
 * @returns {HTMLElement} card completo
 */
function buildHabitoCard(habito) {
    const today     = new Date();
    today.setHours(0, 0, 0, 0);

    const start     = new Date(habito.startDate);
    start.setHours(0, 0, 0, 0);

    // Dias decorridos desde o início
    const daysElapsed = today >= start ? daysBetween(start, today) : 0;

    /* ── Estrutura da janela do heatmap ── */
    // A janela termina HOJE. Começa WEEKS_TO_SHOW semanas atrás OU no início
    // do ano, o que for mais recente — mas nunca antes do startDate inicial.
    const windowEnd   = new Date(today);
    const windowStart = new Date(today);
    windowStart.setDate(windowStart.getDate() - (WEEKS_TO_SHOW * 7 - 1));

    // Ajusta windowStart para a Domingo da semana
    const startDow     = windowStart.getDay(); // 0=Dom
    windowStart.setDate(windowStart.getDate() - startDow);

    // Número de semanas total
    const totalCells   = WEEKS_TO_SHOW * 7;
    const cellPx       = CELL_PX + GAP_PX;

    /* ── Monta array de datas ── */
    const dates = [];
    for (let i = 0; i < totalCells; i++) {
        const d = new Date(windowStart);
        d.setDate(d.getDate() + i);
        dates.push(d);
    }

    /* ── Pré-calcula mapa de meses ── */
    const monthWidths = {};
    for (let w = 0; w < WEEKS_TO_SHOW; w++) {
        const mid = dates[w * 7 + 3] || dates[w * 7];
        const m   = mid.getMonth();
        monthWidths[m] = (monthWidths[m] || 0) + 1;
    }

    /* ─────── CARD ─────── */
    const card = document.createElement('article');
    card.className = 'habito-card';

    /* Header */
    card.innerHTML = `
        <div class="habito-header">
            <div class="habito-info">
                <div class="habito-name">${habito.name}</div>
                <div class="habito-meta">desde ${fmt(start)}</div>
            </div>
            <div class="habito-counter">
                <span class="habito-days" id="habito-days-${habito.id}">${daysElapsed}</span>
                <span class="habito-days-label">dias</span>
            </div>
        </div>
    `;

    /* Heatmap wrapper */
    const wrap  = document.createElement('div');
    wrap.className = 'habito-heatmap-wrap';

    const inner = document.createElement('div');
    inner.className = 'habito-heatmap-inner';

    /* Linha dos meses */
    const monthsRow = document.createElement('div');
    monthsRow.className = 'hm-months-row';
    for (let m = 0; m < 12; m++) {
        if (!monthWidths[m]) continue;
        const span = document.createElement('span');
        span.className   = 'hm-month-label';
        span.textContent = MONTHS_PT[m];
        span.style.width = (monthWidths[m] * cellPx) + 'px';
        monthsRow.appendChild(span);
    }
    inner.appendChild(monthsRow);

    /* Body: weekday labels + semanas */
    const body = document.createElement('div');
    body.className = 'hm-body';

    // Labels dos dias da semana
    const wdLabels = document.createElement('div');
    wdLabels.className = 'hm-weekdays';
    DAYS_PT.forEach((d, i) => {
        const s = document.createElement('span');
        s.className   = 'hm-wd-label';
        // Mostra só Seg, Qua, Sex
        s.textContent = (i === 1 || i === 3 || i === 5) ? d.slice(0,3) : '';
        wdLabels.appendChild(s);
    });
    body.appendChild(wdLabels);

    // Colunas de semanas
    const weeksWrap = document.createElement('div');
    weeksWrap.className = 'hm-weeks';

    for (let w = 0; w < WEEKS_TO_SHOW; w++) {
        const col = document.createElement('div');
        col.className = 'hm-week-col';

        for (let dow = 0; dow < 7; dow++) {
            const date = dates[w * 7 + dow];
            const cell = document.createElement('div');
            cell.className = 'hm-cell';

            const key = date.toISOString().slice(0, 10);

            if (date > today) {
                // Futuro
                cell.classList.add('future');
                cell.dataset.state = 'future';
                cell.dataset.date  = key;
            } else if (date < start) {
                // Antes do início do contador
                cell.classList.add('inactive');
                cell.dataset.state = 'inactive';
                cell.dataset.date  = key;
                cell.dataset.name  = habito.name;
                cell.addEventListener('mouseenter', showTooltip);
                cell.addEventListener('mousemove',  moveTooltip);
                cell.addEventListener('mouseleave', hideTooltip);
            } else {
                // Dia ATIVO (dentro do período do contador)
                const dayIndex = daysBetween(start, date);
                const level    = dayToLevel(dayIndex, daysElapsed);
                cell.classList.add(`active-${level}`);
                cell.dataset.state = 'active';
                cell.dataset.date  = key;
                cell.dataset.day   = dayIndex;
                cell.dataset.name  = habito.name;

                if (isToday(date)) cell.classList.add('today');

                cell.addEventListener('mouseenter', showTooltip);
                cell.addEventListener('mousemove',  moveTooltip);
                cell.addEventListener('mouseleave', hideTooltip);
            }

            col.appendChild(cell);
        }

        weeksWrap.appendChild(col);
    }

    body.appendChild(weeksWrap);
    inner.appendChild(body);
    wrap.appendChild(inner);
    card.appendChild(wrap);

    /* Scroll automático para o final (mais recente = direita) */
    requestAnimationFrame(() => {
        wrap.scrollLeft = wrap.scrollWidth;
    });

    /* Footer */
    const footer = document.createElement('div');
    footer.className = 'habito-footer';
    footer.innerHTML = `
        <span class="habito-desc">${habito.desc}</span>
        <span class="habito-start-badge">início ${fmt(start)}</span>
    `;
    card.appendChild(footer);

    return card;
}

/* ════════════════════════════════════════════════════════════
   MOUNT — injeta os cards no DOM
   ════════════════════════════════════════════════════════════ */
function mountHabitosCalendar() {
    // Cria tooltip global
    createTooltip();

    // Encontra o container alvo (o section do habitos.html)
    const container = document.getElementById('habitos-calendar-grid');
    if (!container) {
        console.warn('[habitos_calendar.js] Container #habitos-calendar-grid não encontrado.');
        return;
    }

    container.innerHTML = '';

    HABITOS.forEach(h => {
        const card = buildHabitoCard(h);
        container.appendChild(card);
    });
}

/* ── Init ──────────────────────────────────────────────────── */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountHabitosCalendar);
} else {
    mountHabitosCalendar();
}
