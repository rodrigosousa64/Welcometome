document.addEventListener('DOMContentLoaded', () => {
    // A data do aniversário é dia 8/09/2026
    const birthdayDate = new Date('2026-09-08T00:00:00').getTime();
    const countdownEl = document.getElementById('global-countdown-timer');
    const countdownTextEl = document.getElementById('global-countdown-text');
    let hasCelebrated = false;

    function formatTimeLeft(distance) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }

    function triggerConfetti() {
        var duration = 15 * 1000; // 15 segundos de confetes
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        var interval = setInterval(function() {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            var particleCount = 50 * (timeLeft / duration);
            // Confetes vindos de posições aleatórias
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }

    function updateTimer() {
        const now = new Date().getTime();
        const distance = birthdayDate - now;

        if (distance > 0) {
            countdownTextEl.innerText = "Faltam apenas:";
            countdownEl.innerText = formatTimeLeft(distance);
        } else {
            countdownTextEl.innerText = "Chegou a hora! 🎉🎂";
            countdownEl.innerText = "Feliz Aniversário!";
            countdownEl.style.color = "#ff758c"; // Cor do texto quando for aniversário

            // Evento básico: se o usuário estiver na tela na "hora da virada" (ou seja, se a distância acabou de zerar)
            // Ou se ele entrar no dia do aniversário
            if (!hasCelebrated) {
                triggerConfetti();
                hasCelebrated = true; // Para não ficar chamando os confetes infinitamente a cada segundo
            }
        }
    }

    // Inicia a atualização
    updateTimer();
    setInterval(updateTimer, 1000);
});
