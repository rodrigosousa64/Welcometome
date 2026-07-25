document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('calendar-blocks-container');
    if (!container) return;

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
            // Ajusta string para forçar timezone correto se necessário
            const d = new Date(dateString);
            const day = String(d.getDate()).padStart(2, '0');
            const month = monthNames[d.getMonth()];
            const year = d.getFullYear();
            return `${day} de ${month}, ${year}`;
        }
        
        blocksData = data.map(item => ({
            title: item.title,
            start: item.start,
            end: item.end,
            weeksPerBlock: item.weeks,
            labelStart: formatDateLabel(item.start),
            labelEnd: formatDateLabel(item.end)
        }));
        
    } catch (err) {
        console.error('Erro ao buscar calendário:', err);
        container.innerHTML = `<p style="color:#f87171;padding:1rem;">Erro ao carregar blocos: ${err.message}</p>`;
        return;
    }

    container.innerHTML = ''; // clear loading text

    let startWeek = 1;

    blocksData.forEach((data, index) => {
        const i = index + 1;
        const block = document.createElement('div');
        block.className = 'calendar-block';
        
        const weeksPerBlock = data.weeksPerBlock || 12; // Fallback
        
        const blockStartMs = new Date(data.start).getTime();
        const blockEndMs = new Date(data.end).getTime();
        const weekDurationMs = (blockEndMs - blockStartMs) / weeksPerBlock;

        let weeksHtml = '';
        for (let w = 1; w <= weeksPerBlock; w++) {
            const absoluteWeek = startWeek + w - 1;
            const weekStartMs = blockStartMs + (w - 1) * weekDurationMs;
            const weekEndMs = blockStartMs + w * weekDurationMs;
            
            weeksHtml += `
                <div class="week-item">
                    <span class="week-number">S${absoluteWeek}</span>
                    <div class="week-box auto-week" data-week-start="${weekStartMs}" data-week-end="${weekEndMs}" title="Semana ${absoluteWeek}"></div>
                </div>
            `;
        }
        
        startWeek += weeksPerBlock; // Atualiza para o próximo bloco

        block.innerHTML = `
            <div class="block-header">
                <h3>${data.title}</h3>
                <span class="block-subtitle">${data.labelStart} - ${data.labelEnd}</span>
            </div>
            <div class="weeks-grid">
                ${weeksHtml}
            </div>
            <div class="block-countdown" id="block-countdown-${i}">
                Calculando...
            </div>
        `;
        container.appendChild(block);
    });

    // Funções de formatação de tempo
    function formatTimeLeft(distance) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }

    // Atualização dos Relógios / Timers e das Semanas
    const globalStartDate = blocksData.length > 0 ? new Date(blocksData[0].start).getTime() : new Date().getTime();
    const globalCountdownEl = document.getElementById('global-countdown-timer');
    const globalCountdownTextEl = document.getElementById('global-countdown-text');
    const autoWeeks = document.querySelectorAll('.auto-week');

    function updateTimers() {
        const now = new Date().getTime();

        // 1. Relógio Global (Tempo até o início real do projeto)
        if (globalCountdownEl && globalCountdownTextEl) {
            const distanceToStart = globalStartDate - now;
            if (distanceToStart > 0) {
                globalCountdownTextEl.innerText = "Tempo até o início do relógio real:";
                globalCountdownEl.innerText = formatTimeLeft(distanceToStart);
            } else {
                globalCountdownTextEl.innerText = "O Relógio Real já iniciou!";
                globalCountdownEl.innerText = "Em andamento";
                globalCountdownEl.style.color = "var(--accent-green)";
            }
        }

        // 2. Relógio de cada Bloco
        blocksData.forEach((data, index) => {
            const i = index + 1;
            const blockEl = document.getElementById(`block-countdown-${i}`);
            if (!blockEl) return;

            const blockStart = new Date(data.start).getTime();
            const blockEnd = new Date(data.end).getTime();

            if (now < blockStart) {
                const dist = blockStart - now;
                blockEl.className = 'block-countdown';
                blockEl.innerHTML = `Inicia em: <span>${formatTimeLeft(dist)}</span>`;
            } else if (now >= blockStart && now <= blockEnd) {
                const dist = blockEnd - now;
                blockEl.className = 'block-countdown active';
                blockEl.innerHTML = `Em andamento. Termina em: <span>${formatTimeLeft(dist)}</span>`;
            } else {
                blockEl.className = 'block-countdown finished';
                blockEl.innerHTML = `Finalizado`;
            }
        });

        // 3. Atualização automática das semanas
        autoWeeks.forEach(box => {
            const wStart = parseFloat(box.getAttribute('data-week-start'));
            const wEnd = parseFloat(box.getAttribute('data-week-end'));
            
            if (now > wEnd) {
                // Semana já concluída
                if(!box.classList.contains('completed')) {
                    box.classList.add('completed');
                    box.classList.remove('current-week');
                    box.innerHTML = '';
                }
            } else if (now >= wStart && now <= wEnd) {
                // Semana atual (em andamento)
                if(!box.classList.contains('current-week')) {
                    box.classList.add('current-week');
                    box.classList.remove('completed');
                }
                // Adiciona contador de dias percorridos (de 1 a 7)
                const daysPassed = Math.floor((now - wStart) / (1000 * 60 * 60 * 24)) + 1;
                const displayDay = Math.min(daysPassed, 7); // Garante que não passe de 7
                box.innerHTML = `<span class="week-days-left">${displayDay}d</span>`;
            } else {
                // Semana futura
                box.classList.remove('completed');
                box.classList.remove('current-week');
                if(box.innerHTML !== '') box.innerHTML = '';
            }
        });
    }

    // Inicia a atualização dos timers
    updateTimers();
    setInterval(updateTimers, 1000);
});
