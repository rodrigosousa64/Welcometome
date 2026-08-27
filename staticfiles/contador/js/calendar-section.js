document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('calendar-blocks-container');
    if (!container) return;

    const isAdmin = container.getAttribute('data-is-admin') === 'true';

    // Elementos do Modal
    const modal = document.getElementById('week-modal');
    const closeBtn = document.getElementById('close-dialog-btn');
    const modalTitle = document.getElementById('dialog-week-title');
    const modalBadge = document.getElementById('dialog-week-badge');
    const modalInput = document.getElementById('dialog-objective-input');
    const modalDisplay = document.getElementById('dialog-objective-display');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.close();
        });
    }

    container.innerHTML = '<p style="color:var(--text-muted,#888);padding:1rem;">Carregando blocos...</p>';

    let blocksData = [];
    try {
        const response = await fetch('/pessoal/api/calendario/');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        function formatDateLabel(dateString) {
            if (!dateString) return '';
            const d = new Date(dateString);
            const day = String(d.getDate()).padStart(2, '0');
            const month = monthNames[d.getMonth()];
            const year = d.getFullYear();
            return `${day} de ${month}, ${year}`;
        }
        
        blocksData = data.map(item => ({
            id: item.id,
            title: item.title,
            block_theme: item.block_theme || 'Foco e Disciplina',
            start: item.start,
            end: item.end,
            weeksPerBlock: item.weeks,
            labelStart: formatDateLabel(item.start),
            labelEnd: formatDateLabel(item.end),
            semanas: item.semanas || []
        }));
        
    } catch (err) {
        console.error('Erro ao buscar calendário:', err);
        container.innerHTML = `<p style="color:#f87171;padding:1rem;">Erro ao carregar blocos: ${err.message}</p>`;
        return;
    }

    container.innerHTML = ''; 

    let startWeek = 1;

    // Cache para os dados das semanas para o modal
    const weeksCache = {};

    blocksData.forEach((data, index) => {
        const i = index + 1;
        const block = document.createElement('div');
        block.className = 'calendar-block';
        
        const weeksPerBlock = data.weeksPerBlock || 12;
        
        const blockStartMs = new Date(data.start).getTime();
        const blockEndMs = new Date(data.end).getTime();
        const weekDurationMs = (blockEndMs - blockStartMs) / weeksPerBlock;
        const dayDurationMs = weekDurationMs / 7;
        
        // Progress bar logic
        const nowMs = new Date().getTime();
        let totalDays = (blockEndMs - blockStartMs) / (1000 * 60 * 60 * 24);
        let daysPassed = (nowMs - blockStartMs) / (1000 * 60 * 60 * 24);
        daysPassed = Math.max(0, Math.min(daysPassed, totalDays));
        const progressPercent = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;

        let weeksHtml = '';
        for (let w = 1; w <= weeksPerBlock; w++) {
            const absoluteWeek = startWeek + w - 1;
            const weekStartMs = blockStartMs + (w - 1) * weekDurationMs;
            const weekEndMs = blockStartMs + w * weekDurationMs - 1; 

            const semanaData = data.semanas.find(s => s.numero_semana === w) || {};
            const weekId = semanaData.id;
            const isMilestone = semanaData.is_milestone;
            const milestoneClass = isMilestone ? 'milestone-week' : '';
            const mainObjective = semanaData.main_objective || '';
            const weekTitle = semanaData.week_title ? `S${absoluteWeek}: ${semanaData.week_title}` : `Semana ${absoluteWeek}`;
            
            const internalWeekKey = `week-${weekId || absoluteWeek}`;
            weeksCache[internalWeekKey] = {
                id: weekId,
                title: weekTitle,
                objective: mainObjective,
                isMilestone: isMilestone,
                milestoneLabel: semanaData.week_title
            };

            let daysHtml = '';
            for(let d = 0; d < 7; d++) {
                const dayStartMs = weekStartMs + d * dayDurationMs;
                const dayEndMs = dayStartMs + dayDurationMs - 1;
                daysHtml += `<div class="day-box auto-day" data-day-start="${dayStartMs}" data-day-end="${dayEndMs}"></div>`;
            }

            weeksHtml += `
                <div class="week-grid-card auto-week ${milestoneClass}" 
                     data-week-start="${weekStartMs}" 
                     data-week-end="${weekEndMs}"
                     data-week-key="${internalWeekKey}">
                    <span class="week-number-small">S${absoluteWeek}</span>
                    <div class="week-days-flex">
                        ${daysHtml}
                    </div>
                </div>
            `;
        }
        
        startWeek += weeksPerBlock;

        block.innerHTML = `
            <div class="block-header-banner">
                <div class="banner-content">
                    <span class="block-subtitle-small">OBJETIVO PRINCIPAL</span>
                    <h2>${data.block_theme}</h2>
                    <span class="block-dates">${data.labelStart} - ${data.labelEnd}</span>
                </div>
                <div class="banner-progress">
                    <div class="progress-labels">
                        <span>Progresso</span>
                        <span>${progressPercent.toFixed(1)}%</span>
                    </div>
                    <progress class="block-progress" value="${progressPercent}" max="100"></progress>
                </div>
            </div>
            <div class="weeks-meso-grid">
                ${weeksHtml}
            </div>
        `;
        container.appendChild(block);
    });

    // Abrir modal ao clicar no cartão da semana
    document.querySelectorAll('.week-grid-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!modal) return;
            const weekKey = card.getAttribute('data-week-key');
            const data = weeksCache[weekKey];

            modalTitle.innerText = data.title;
            
            if (data.isMilestone) {
                modalBadge.style.display = 'inline-block';
                modalBadge.innerText = `🎯 MARCO: ${data.milestoneLabel || 'Decisivo'}`;
            } else {
                modalBadge.style.display = 'none';
            }

            if (isAdmin) {
                modalInput.style.display = 'block';
                modalDisplay.style.display = 'none';
                modalInput.value = data.objective;
                modalInput.setAttribute('data-semana-id', data.id || '');
                modalInput.setAttribute('data-week-key', weekKey);
            } else {
                modalInput.style.display = 'none';
                modalDisplay.style.display = 'block';
                modalDisplay.innerHTML = data.objective ? data.objective.replace(/\n/g, '<br>') : '<span style="color:var(--text-muted)">Nenhum objetivo definido.</span>';
            }

            modal.showModal();
        });
    });

    // Setup Textarea Auto-save
    if (isAdmin && modalInput) {
        modalInput.addEventListener('blur', async (e) => {
            const semanaId = e.target.getAttribute('data-semana-id');
            const weekKey = e.target.getAttribute('data-week-key');
            const newObjective = e.target.value;
            if (!semanaId) return;

            e.target.classList.add('saving');

            try {
                const res = await fetch('/pessoal/api/calendario/semana/update/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        semana_id: semanaId,
                        main_objective: newObjective
                    })
                });
                if (res.ok) {
                    e.target.classList.remove('saving');
                    e.target.classList.add('saved');
                    if (weeksCache[weekKey]) {
                        weeksCache[weekKey].objective = newObjective; // update cache
                    }
                    setTimeout(() => e.target.classList.remove('saved'), 2000);
                } else {
                    console.error("Falha ao salvar");
                    e.target.classList.remove('saving');
                }
            } catch (err) {
                console.error(err);
                e.target.classList.remove('saving');
            }
        });
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const autoDays = document.querySelectorAll('.auto-day');
    const autoWeeks = document.querySelectorAll('.auto-week');

    function updateTimers() {
        const now = new Date().getTime();

        // Atualização automática dos DIAS (Micro)
        autoDays.forEach(box => {
            const dStart = parseFloat(box.getAttribute('data-day-start'));
            const dEnd = parseFloat(box.getAttribute('data-day-end'));
            
            if (now > dEnd) {
                if(!box.classList.contains('completed-day')) {
                    box.classList.add('completed-day');
                    box.classList.remove('current-day');
                }
            } else if (now >= dStart && now <= dEnd) {
                if(!box.classList.contains('current-day')) {
                    box.classList.add('current-day');
                    box.classList.remove('completed-day');
                }
            } else {
                box.classList.remove('completed-day', 'current-day');
            }
        });

        // Atualização automática das SEMANAS (Meso)
        autoWeeks.forEach(card => {
            const wStart = parseFloat(card.getAttribute('data-week-start'));
            const wEnd = parseFloat(card.getAttribute('data-week-end'));

            if (now > wEnd) {
                card.classList.add('completed-week');
                card.classList.remove('current-week');
            } else if (now >= wStart && now <= wEnd) {
                card.classList.add('current-week');
                card.classList.remove('completed-week');
            } else {
                card.classList.remove('completed-week', 'current-week');
            }
        });
    }

    updateTimers();
    setInterval(updateTimers, 1000);
});
