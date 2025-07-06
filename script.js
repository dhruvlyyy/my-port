document.addEventListener('DOMContentLoaded', () => {
    // Screens
    const welcomeScreen = document.getElementById('welcome-screen');
    const brainScreen = document.getElementById('brain-screen');
    const codingSection = document.getElementById('coding-section');
    const medicalSection = document.getElementById('medical-section');
    const screens = [welcomeScreen, brainScreen, codingSection, medicalSection];

    // Buttons
    const enterButton = document.getElementById('enter-button');
    const brainLeft = document.getElementById('brain-left');
    const brainRight = document.getElementById('brain-right');
    const backButtons = document.querySelectorAll('.back-button');

    // Audio Elements
    const ambientSound = document.getElementById('ambient-sound');
    const clickSound = document.getElementById('click-sound');
    const hoverSound = document.getElementById('hover-sound');
    const selectSound = document.getElementById('select-sound');

    // Sound files (using very short base64 encoded silent audio as placeholders)
    const sounds = {
        ambient: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA', // Silent
        click: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA', // Silent
        hover: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA', // Silent
        select: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'  // Silent
    };

    if (ambientSound) ambientSound.src = sounds.ambient;
    if (clickSound) clickSound.src = sounds.click;
    if (hoverSound) hoverSound.src = sounds.hover;
    if (selectSound) selectSound.src = sounds.select;

    let audioInitialized = false;

    function initializeAudio() {
        if (audioInitialized || !ambientSound) return; // Ensure ambientSound exists
        ambientSound.play().then(() => {
            ambientSound.pause();
            console.log("Audio context initialized.");
        }).catch(e => console.warn("Audio play for initialization failed:", e.message));
        audioInitialized = true;
    }

    const initAudioEvents = ['click', 'mousemove', 'touchstart', 'keydown'];
    function userInteractionListener() {
        initializeAudio();
        initAudioEvents.forEach(event => document.body.removeEventListener(event, userInteractionListener));
    }
    initAudioEvents.forEach(event => document.body.addEventListener(event, userInteractionListener, { once: true }));

    function playSound(soundElement) {
        if (!soundElement || !soundElement.src) { // Also check if src is set
            // console.warn("Sound element or src missing for playback.");
            return;
        }
        if (!audioInitialized) {
            initializeAudio();
        }
        soundElement.currentTime = 0;
        soundElement.play().catch(e => console.warn("Sound play failed:", e.message));
    }

    // --- Particle Background Effect ---
    const particleCanvas = document.getElementById('particle-canvas');
    let pCtx, particlesArray, particleAnimationId;

    if (particleCanvas) {
        pCtx = particleCanvas.getContext('2d');
        setupParticleCanvas();
        startParticleAnimation(); // Initial call
    }

    function setupParticleCanvas() {
        if (!particleCanvas) return;
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
    }

    class Particle {
        constructor(x, y, size, speedX, speedY, color) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.speedX = speedX;
            this.speedY = speedY;
            this.color = color;
        }
        update() {
            if (!particleCanvas) return;
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.size > 0.2) this.size -= 0.02;
            if (this.size <= 0.2 || this.x < 0 || this.x > particleCanvas.width || this.y < 0 || this.y > particleCanvas.height) {
                this.x = Math.random() * particleCanvas.width;
                this.y = Math.random() * particleCanvas.height;
                this.size = Math.random() * 2.5 + 1;
                this.speedX = (Math.random() * 0.4 - 0.2);
                this.speedY = (Math.random() * 0.4 - 0.2);
            }
        }
        draw() {
            if (!pCtx) return;
            pCtx.fillStyle = this.color;
            pCtx.beginPath();
            pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            pCtx.fill();
        }
    }

    function initParticles() {
        if (!particleCanvas) return;
        particlesArray = [];
        const numberOfParticles = Math.min(150, Math.floor(window.innerWidth / 12));
        const colors = ['rgba(0,255,255,0.6)', 'rgba(255,0,255,0.6)', 'rgba(220,220,255,0.4)'];
        for (let i = 0; i < numberOfParticles; i++) {
            const size = Math.random() * 2 + 0.5;
            const x = Math.random() * particleCanvas.width;
            const y = Math.random() * particleCanvas.height;
            const speedX = (Math.random() * 0.3 - 0.15);
            const speedY = (Math.random() * 0.3 - 0.15);
            const color = colors[Math.floor(Math.random() * colors.length)];
            particlesArray.push(new Particle(x, y, size, speedX, speedY, color));
        }
    }

    function animateParticles() {
        if (!pCtx || !particlesArray || !particleCanvas) return;
        pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a + 1; b < particlesArray.length; b++) {
                const dx = particlesArray[a].x - particlesArray[b].x;
                const dy = particlesArray[a].y - particlesArray[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 120) {
                    pCtx.strokeStyle = `rgba(220, 220, 255, ${0.8 - distance / 120})`;
                    pCtx.lineWidth = 0.4;
                    pCtx.beginPath();
                    pCtx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    pCtx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    pCtx.stroke();
                }
            }
        }
        particleAnimationId = requestAnimationFrame(animateParticles);
    }

    function startParticleAnimation() {
        if (!particleCanvas) return;
        if (particleAnimationId) cancelAnimationFrame(particleAnimationId);
        initParticles();
        animateParticles();
    }

    if (particleCanvas) {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                setupParticleCanvas();
                startParticleAnimation();
            }, 250);
        });
    }


    const welcomeTitle = document.getElementById('welcome-title');
    if (welcomeTitle) {
        const chars = welcomeTitle.querySelectorAll('.char');
        chars.forEach((char, index) => {
            char.style.animationDelay = `${index * 0.07 + 0.6}s`;
        });
    }

    function switchScreen(hideScreen, showScreen) {
        if (!hideScreen || !showScreen) return;

        hideScreen.classList.add('inactive-fadeout');
        hideScreen.classList.remove('active');

        setTimeout(() => {
            hideScreen.style.display = 'none';
            hideScreen.classList.remove('inactive-fadeout');

            showScreen.style.display = 'flex';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    showScreen.classList.add('active');
                });
            });

            if (showScreen === welcomeScreen) {
                if (ambientSound && ambientSound.src && audioInitialized) ambientSound.play().catch(e => console.warn(e.message));
            } else {
                if (ambientSound && ambientSound.src && audioInitialized) ambientSound.pause();
            }

            if (particleCanvas) { // Only manage particles if canvas exists
                if (showScreen === welcomeScreen || showScreen === brainScreen) {
                    if (particleCanvas.style.display === 'none') particleCanvas.style.display = 'block';
                    startParticleAnimation();
                } else {
                    if (particleAnimationId) cancelAnimationFrame(particleAnimationId);
                }
            }

        }, 700);
    }

    screens.forEach(screen => {
        if (screen) {
            if (!screen.classList.contains('active')) {
                screen.style.display = 'none';
            } else {
                screen.style.display = 'flex';
                if (screen === welcomeScreen && ambientSound && ambientSound.src && audioInitialized) {
                     ambientSound.play().catch(e => console.warn(e.message));
                }
            }
        }
    });

    enterButton?.addEventListener('click', () => {
        playSound(clickSound);
        switchScreen(welcomeScreen, brainScreen);
    });

    [brainLeft, brainRight].forEach(hemi => {
        hemi?.addEventListener('click', () => {
            playSound(selectSound);
            const targetSectionId = hemi.dataset.section + '-section';
            const targetSection = document.getElementById(targetSectionId);
            switchScreen(brainScreen, targetSection);
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            playSound(clickSound);
            const currentSection = button.closest('.content-section');
            if (currentSection) {
                switchScreen(currentSection, brainScreen);
            }
        });
    });

    document.querySelectorAll('[data-sound]').forEach(element => {
        const soundType = element.dataset.sound;
        let soundToPlay;
        if (soundType === 'click') soundToPlay = clickSound;
        else if (soundType === 'hover') soundToPlay = hoverSound;
        else if (soundType === 'select') soundToPlay = selectSound;

        if (soundToPlay) {
            if (soundType === 'hover') {
                element.addEventListener('mouseenter', () => playSound(soundToPlay));
            } else {
                element.addEventListener('click', () => playSound(soundToPlay));
            }
        }
    });

    if (welcomeScreen?.classList.contains('active')) {
       setTimeout(() => {
           if(audioInitialized && ambientSound && ambientSound.src) ambientSound.play().catch(e => console.warn("Ambient sound failed to play on load:", e.message));
       }, 200);
    }
});
