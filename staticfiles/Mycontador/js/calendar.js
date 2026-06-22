document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('calendar-blocks-container');
    if (!container) return;

    // Dados com datas reais dos blocos
    const blocksData = [
        { title: 'Block 1', start: '2026-07-11T00:00:00', end: '2026-10-02T23:59:59', labelStart: '11 de Julho, 2026', labelEnd: '02 de Outubro, 2026' },
        { title: 'Block 2', start: '2026-10-03T00:00:00', end: '2026-12-25T23:59:59', labelStart: '03 de Outubro, 2026', labelEnd: '25 de Dezembro, 2026' },
        { title: 'Block 3', start: '2026-12-26T00:00:00', end: '2027-03-19T23:59:59', labelStart: '26 de Dezembro, 2026', labelEnd: '19 de Março, 2027' },
        { title: 'Block 4', start: '2027-03-20T00:00:00', end: '2027-06-11T23:59:59', labelStart: '20 de Março, 2027', labelEnd: '11 de Junho, 2027' },
        { title: 'Block 5', start: '2027-06-12T00:00:00', end: '2027-09-03T23:59:59', labelStart: '12 de Junho, 2027', labelEnd: '03 de Setembro, 2027' },
        { title: 'Block 6', start: '2027-09-04T00:00:00', end: '2027-11-26T23:59:59', labelStart: '04 de Setembro, 2027', labelEnd: '26 de Novembro, 2027' },
        { title: 'Block 7', start: '2027-11-27T00:00:00', end: '2028-02-18T23:59:59', labelStart: '27 de Novembro, 2027', labelEnd: '18 de Fevereiro, 2028' },
        { title: 'Block 8', start: '2028-02-19T00:00:00', end: '2028-05-12T23:59:59', labelStart: '19 de Fevereiro, 2028', labelEnd: '12 de Maio, 2028' },
        { title: 'Block 9', start: '2028-05-13T00:00:00', end: '2028-08-04T23:59:59', labelStart: '13 de Maio, 2028', labelEnd: '04 de Agosto, 2028' },
        { title: 'Block 10', start: '2028-08-05T00:00:00', end: '2028-10-27T23:59:59', labelStart: '05 de Agosto, 2028', labelEnd: '27 de Outubro, 2028' }
    ];

    const weeksPerBlock = 12;

    blocksData.forEach((data, index) => {
        const i = index + 1;
        const block = document.createElement('div');
        block.className = 'calendar-block';
        
        const startWeek = (i - 1) * weeksPerBlock + 1;
        
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
    const globalStartDate = new Date('2026-07-11T00:00:00').getTime();
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
                }
            } else if (now >= wStart && now <= wEnd) {
                // Semana atual (em andamento)
                if(!box.classList.contains('current-week')) {
                    box.classList.add('current-week');
                    box.classList.remove('completed');
                }
            } else {
                // Semana futura
                box.classList.remove('completed');
                box.classList.remove('current-week');
            }
        });
    }

    // Inicia a atualização dos timers
    updateTimers();
    setInterval(updateTimers, 1000);
});
