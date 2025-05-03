document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const brainScreen = document.getElementById('brain-screen');
    const codingSection = document.getElementById('coding-section');
    const medicalSection = document.getElementById('medical-section');

    const enterButton = document.getElementById('enter-button');
    const brainLeft = document.getElementById('brain-left');
    const brainRight = document.getElementById('brain-right');
    const backButtons = document.querySelectorAll('.back-button');

    // Function to switch screens smoothly
    function switchScreen(hideScreen, showScreen) {
        hideScreen.classList.remove('active');
        setTimeout(() => {
            hideScreen.style.display = 'none';
            showScreen.style.display = 'flex';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                     showScreen.classList.add('active');
                });
            });
        }, 800); // Match CSS transition duration
    }

     // Initialize Screen Display
     document.querySelectorAll('.screen').forEach(screen => {
         if (!screen.classList.contains('active')) {
             screen.style.display = 'none';
         } else {
              screen.style.display = 'flex';
         }
     });

    // --- Matrix Background Effect ---
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    let matrixInterval;

    function startMatrix() {
        if (!canvas) return; // Exit if canvas doesn't exist
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        if(canvas.height === 0) return; // Don't run if not visible

        const letters = '01';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        // Initialize drops only if columns is a positive number
        const drops = columns > 0 ? Array(Math.floor(columns)).fill(1) : [];

        function drawMatrix() {
            if (!canvas || drops.length === 0) return; // Exit if canvas removed or no columns
            ctx.fillStyle = 'rgba(1, 3, 16, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0, 191, 255, 0.7)';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        if (matrixInterval) clearInterval(matrixInterval);
        // Only start interval if there are columns to draw
        if (drops.length > 0) {
            matrixInterval = setInterval(drawMatrix, 50);
        }
    }

    // Debounce resize function
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Check if canvas exists and is visible
            if (canvas && canvas.offsetParent !== null) {
                 startMatrix();
            }
        }, 250);
    });

    function stopMatrix() {
        if (matrixInterval) {
            clearInterval(matrixInterval);
            matrixInterval = null;
        }
    }

    // --- Event Listeners ---
    enterButton?.addEventListener('click', () => {
        switchScreen(welcomeScreen, brainScreen);
        startMatrix();
    });

    brainLeft?.addEventListener('click', () => {
        switchScreen(brainScreen, codingSection);
    });

    brainRight?.addEventListener('click', () => {
        switchScreen(brainScreen, medicalSection);
    });

    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentSection = button.closest('.content-section');
            if (currentSection) {
                switchScreen(currentSection, brainScreen);
            }
        });
    });

    // Initialize Matrix if starting on a screen where it should be visible
    if (canvas && (!welcomeScreen || !welcomeScreen.classList.contains('active'))) {
         // Use setTimeout to ensure canvas has dimensions after initial render
         setTimeout(startMatrix, 50);
    }
});