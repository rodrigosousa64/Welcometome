document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('calendar-blocks-container');
    if (!container) return;

    const isAdmin = container.getAttribute('data-is-admin') === 'true';

    // Toast helper
    function showToast(message, type = 'success') {
        const toast = document.getElementById('calendar-toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `calendar-toast show ${type}`;
        setTimeout(() => {
            toast.className = 'calendar-toast';
        }, 3200);
    }

    // Elementos do Modal da Semana
    const weekModal = document.getElementById('week-modal');
    const closeWeekBtn = document.getElementById('close-dialog-btn');
    const cancelWeekBtn = document.getElementById('dialog-cancel-week-btn');
    const saveWeekBtn = document.getElementById('dialog-save-week-btn');
    const weekTitleDisplay = document.getElementById('dialog-week-title');
    const weekBadge = document.getElementById('dialog-week-badge');
    const adminWeekFields = document.getElementById('admin-week-fields');
    const adminWeekActions = document.getElementById('admin-week-actions');
    const weekTitleInput = document.getElementById('dialog-week-title-input');
    const milestoneToggle = document.getElementById('dialog-milestone-toggle');
    const objectiveInput = document.getElementById('dialog-objective-input');
    const objectiveDisplay = document.getElementById('dialog-objective-display');

    // Elementos do Modal do Bloco
    const blockModal = document.getElementById('block-modal');
    const closeBlockBtn = document.getElementById('close-block-dialog-btn');
    const cancelBlockBtn = document.getElementById('dialog-cancel-block-btn');
    const saveBlockBtn = document.getElementById('dialog-save-block-btn');
    const blockNameInput = document.getElementById('dialog-block-name-input');
    const blockThemeInput = document.getElementById('dialog-block-theme-input');

    // Fechamento de Modais
    if (closeWeekBtn) closeWeekBtn.addEventListener('click', () => weekModal.close());
    if (cancelWeekBtn) cancelWeekBtn.addEventListener('click', () => weekModal.close());
    if (closeBlockBtn) closeBlockBtn.addEventListener('click', () => blockModal.close());
    if (cancelBlockBtn) cancelBlockBtn.addEventListener('click', () => blockModal.close());

    // Fechar ao clicar no backdrop do dialog
    [weekModal, blockModal].forEach(dialog => {
        if (!dialog) return;
        dialog.addEventListener('click', (e) => {
            const rect = dialog.getBoundingClientRect();
            const isInDialog = (
                rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                rect.left <= e.clientX && e.clientX <= rect.left + rect.width
            );
            if (!isInDialog) {
                dialog.close();
            }
        });
    });

    container.innerHTML = '<div class="calendar-loading"><div class="spinner"></div><p>Carregando blocos e metas...</p></div>';

    let blocksData = [];
    try {
        const response = await fetch('/calendario/api/calendario/');
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
        container.innerHTML = `<div class="calendar-error"><span class="material-symbols-outlined">error</span><p>Erro ao carregar blocos: ${err.message}</p></div>`;
        return;
    }

    container.innerHTML = ''; 

    let startWeek = 1;

    // Caches para acesso rápido
    const weeksCache = {};
    const blocksCache = {};

    blocksData.forEach((data, index) => {
        blocksCache[data.id] = data;
        const block = document.createElement('div');
        block.className = 'calendar-block';
        block.id = `calendar-block-${data.id}`;
        
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
            const isMilestone = Boolean(semanaData.is_milestone);
            const milestoneClass = isMilestone ? 'milestone-week' : '';
            const mainObjective = semanaData.main_objective || '';
            const weekTitle = semanaData.week_title || '';
            
            const internalWeekKey = `week-${weekId || (data.id + '-' + w)}`;
            weeksCache[internalWeekKey] = {
                id: weekId,
                blocoId: data.id,
                numero_semana: w,
                absoluteWeek: absoluteWeek,
                week_title: weekTitle,
                main_objective: mainObjective,
                is_milestone: isMilestone,
            };

            let daysHtml = '';
            for(let d = 0; d < 7; d++) {
                const dayStartMs = weekStartMs + d * dayDurationMs;
                const dayEndMs = dayStartMs + dayDurationMs - 1;
                daysHtml += `<div class="day-box auto-day" data-day-start="${dayStartMs}" data-day-end="${dayEndMs}"></div>`;
            }

            const milestoneIndicator = isMilestone ? '<span class="milestone-indicator-star" title="Marco">🎯</span>' : '';

            weeksHtml += `
                <div class="week-grid-card auto-week ${milestoneClass}" 
                     data-week-start="${weekStartMs}" 
                     data-week-end="${weekEndMs}"
                     data-week-key="${internalWeekKey}"
                     title="${weekTitle ? 'S' + absoluteWeek + ': ' + weekTitle : 'Semana ' + absoluteWeek}">
                    <div class="week-header-small">
                        <span class="week-number-small">S${absoluteWeek}</span>
                        ${milestoneIndicator}
                    </div>
                    <div class="week-days-flex">
                        ${daysHtml}
                    </div>
                </div>
            `;
        }
        
        startWeek += weeksPerBlock;

        const editBlockBtnHtml = isAdmin ? `
            <button type="button" class="btn-edit-block" data-block-id="${data.id}" title="Editar Meta e Título do Bloco">
                <span class="material-symbols-outlined">edit</span>
                <span>Editar</span>
            </button>
        ` : '';

        block.innerHTML = `
            <div class="block-header-banner">
                <div class="banner-top-row">
                    <div class="banner-content">
                        <div class="block-title-row">
                            <span class="block-subtitle-small">${data.title || 'BLOCO'}</span>
                            ${editBlockBtnHtml}
                        </div>
                        <h2 class="block-theme-title">${data.block_theme}</h2>
                        <span class="block-dates">${data.labelStart} - ${data.labelEnd}</span>
                    </div>
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

    // Abrir modal de edição do bloco (ADM)
    if (isAdmin) {
        document.querySelectorAll('.btn-edit-block').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const blockId = btn.getAttribute('data-block-id');
                const blockData = blocksCache[blockId];
                if (!blockData || !blockModal) return;

                blockNameInput.value = blockData.title || '';
                blockThemeInput.value = blockData.block_theme || '';
                saveBlockBtn.setAttribute('data-block-id', blockId);

                blockModal.showModal();
            });
        });

        // Salvar alterações do Bloco
        if (saveBlockBtn) {
            saveBlockBtn.addEventListener('click', async () => {
                const blockId = saveBlockBtn.getAttribute('data-block-id');
                if (!blockId) return;

                const newName = blockNameInput.value.trim();
                const newTheme = blockThemeInput.value.trim();

                if (!newName) {
                    showToast('Informe o nome do bloco.', 'error');
                    return;
                }

                saveBlockBtn.disabled = true;
                saveBlockBtn.innerHTML = '<span class="material-symbols-outlined icon-small spin">sync</span> Salvando...';

                try {
                    const res = await fetch('/calendario/api/calendario/bloco/update/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: JSON.stringify({
                            bloco_id: blockId,
                            nome: newName,
                            block_theme: newTheme
                        })
                    });

                    const resData = await res.json();
                    if (res.ok && resData.status === 'success') {
                        // Atualizar cache
                        if (blocksCache[blockId]) {
                            blocksCache[blockId].title = newName;
                            blocksCache[blockId].block_theme = newTheme;
                        }

                        // Atualizar DOM do bloco
                        const blockElem = document.getElementById(`calendar-block-${blockId}`);
                        if (blockElem) {
                            const subtitleElem = blockElem.querySelector('.block-subtitle-small');
                            const themeElem = blockElem.querySelector('.block-theme-title');
                            if (subtitleElem) subtitleElem.innerText = newName;
                            if (themeElem) themeElem.innerText = newTheme || 'Foco e Disciplina';
                        }

                        blockModal.close();
                        showToast('Meta do bloco atualizada com sucesso!', 'success');
                    } else {
                        showToast(resData.error || 'Erro ao atualizar bloco', 'error');
                    }
                } catch (err) {
                    console.error('Erro ao salvar bloco:', err);
                    showToast('Falha na comunicação com o servidor', 'error');
                } finally {
                    saveBlockBtn.disabled = false;
                    saveBlockBtn.innerHTML = '<span class="material-symbols-outlined icon-small">save</span> Salvar Bloco';
                }
            });
        }
    }

    // Abrir modal ao clicar no cartão da semana
    document.querySelectorAll('.week-grid-card').forEach(card => {
        card.addEventListener('click', () => {
            if (!weekModal) return;
            const weekKey = card.getAttribute('data-week-key');
            const data = weeksCache[weekKey];
            if (!data) return;

            const weekHeading = data.week_title 
                ? `Semana ${data.absoluteWeek}: ${data.week_title}` 
                : `Semana ${data.absoluteWeek}`;
            
            weekTitleDisplay.innerText = weekHeading;
            
            if (data.is_milestone) {
                weekBadge.style.display = 'inline-flex';
                weekBadge.innerText = `🎯 MARCO: ${data.week_title || 'Semana Chave'}`;
            } else {
                weekBadge.style.display = 'none';
            }

            if (isAdmin) {
                adminWeekFields.style.display = 'flex';
                adminWeekActions.style.display = 'flex';
                objectiveInput.style.display = 'block';
                objectiveDisplay.style.display = 'none';

                weekTitleInput.value = data.week_title || '';
                milestoneToggle.checked = Boolean(data.is_milestone);
                objectiveInput.value = data.main_objective || '';
                
                saveWeekBtn.setAttribute('data-semana-id', data.id || '');
                saveWeekBtn.setAttribute('data-week-key', weekKey);
            } else {
                adminWeekFields.style.display = 'none';
                adminWeekActions.style.display = 'none';
                objectiveInput.style.display = 'none';
                objectiveDisplay.style.display = 'block';
                objectiveDisplay.innerHTML = data.main_objective 
                    ? data.main_objective.replace(/\n/g, '<br>') 
                    : '<span style="color:var(--text-muted)">Nenhum objetivo definido para esta semana.</span>';
            }

            weekModal.showModal();
        });
    });

    // Salvar alterações da Semana (ADM)
    if (isAdmin && saveWeekBtn) {
        saveWeekBtn.addEventListener('click', async () => {
            const semanaId = saveWeekBtn.getAttribute('data-semana-id');
            const weekKey = saveWeekBtn.getAttribute('data-week-key');
            if (!semanaId) return;

            const newTitle = weekTitleInput.value.trim();
            const newObjective = objectiveInput.value;
            const newIsMilestone = milestoneToggle.checked;

            saveWeekBtn.disabled = true;
            saveWeekBtn.innerHTML = '<span class="material-symbols-outlined icon-small spin">sync</span> Salvando...';

            try {
                const res = await fetch('/calendario/api/calendario/semana/update/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        semana_id: semanaId,
                        week_title: newTitle,
                        main_objective: newObjective,
                        is_milestone: newIsMilestone
                    })
                });

                const resData = await res.json();
                if (res.ok && resData.status === 'success') {
                    // Atualizar cache local
                    if (weeksCache[weekKey]) {
                        weeksCache[weekKey].week_title = newTitle;
                        weeksCache[weekKey].main_objective = newObjective;
                        weeksCache[weekKey].is_milestone = newIsMilestone;
                    }

                    // Atualizar card no DOM
                    const card = document.querySelector(`.week-grid-card[data-week-key="${weekKey}"]`);
                    if (card) {
                        if (newIsMilestone) {
                            card.classList.add('milestone-week');
                        } else {
                            card.classList.remove('milestone-week');
                        }

                        const headerSmall = card.querySelector('.week-header-small');
                        if (headerSmall) {
                            const absWeek = weeksCache[weekKey].absoluteWeek;
                            headerSmall.innerHTML = `
                                <span class="week-number-small">S${absWeek}</span>
                                ${newIsMilestone ? '<span class="milestone-indicator-star" title="Marco">🎯</span>' : ''}
                            `;
                        }

                        card.setAttribute('title', newTitle ? `S${weeksCache[weekKey].absoluteWeek}: ${newTitle}` : `Semana ${weeksCache[weekKey].absoluteWeek}`);
                    }

                    weekModal.close();
                    showToast('Meta da semana salva com sucesso!', 'success');
                } else {
                    showToast(resData.error || 'Erro ao salvar semana', 'error');
                }
            } catch (err) {
                console.error('Erro ao salvar semana:', err);
                showToast('Falha na comunicação com o servidor', 'error');
            } finally {
                saveWeekBtn.disabled = false;
                saveWeekBtn.innerHTML = '<span class="material-symbols-outlined icon-small">save</span> Salvar Meta';
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
