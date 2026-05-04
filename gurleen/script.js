/* ============================================================
   ROYAL SPARK — Main JavaScript
   Features: Anti-gravity physics (Matter.js), particle effects,
   cursor sparkle trail, collision sounds, scroll animations
   ============================================================ */

// ============================================================
// 1. DOM REFERENCES
// ============================================================
const gravityToggle = document.getElementById('gravity-toggle');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const navbar = document.getElementById('navbar');
const sparkleCanvas = document.getElementById('sparkle-canvas');
const particleCanvas = document.getElementById('particle-canvas');
const sparkleCtx = sparkleCanvas.getContext('2d');
const particleCtx = particleCanvas.getContext('2d');

let gravityActive = false;       // Tracks anti-gravity mode state
let matterEngine = null;         // Matter.js engine reference
let matterRunner = null;         // Matter.js runner reference
let matterBodies = [];           // Array of { element, body } pairs
let mouseConstraint = null;      // Mouse drag constraint
let audioCtx = null;             // Web Audio API context for chime sounds

// ============================================================
// 2. CANVAS SETUP — resize canvases to full viewport
// ============================================================
function resizeCanvases() {
    sparkleCanvas.width = window.innerWidth;
    sparkleCanvas.height = window.innerHeight;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}
resizeCanvases();
window.addEventListener('resize', resizeCanvases);

// ============================================================
// 3. BACKGROUND PARTICLES — subtle floating gold particles
// ============================================================
const bgParticles = [];
const PARTICLE_COUNT = 60;

/** Create a single background particle with random properties */
function createBgParticle() {
    return {
        x: Math.random() * particleCanvas.width,
        y: Math.random() * particleCanvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2,  // phase offset for pulsing
    };
}

// Initialize background particles
for (let i = 0; i < PARTICLE_COUNT; i++) {
    bgParticles.push(createBgParticle());
}

/** Animate background particles — called every frame */
function animateBgParticles() {
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    bgParticles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.02;

        // Wrap around edges
        if (p.x < 0) p.x = particleCanvas.width;
        if (p.x > particleCanvas.width) p.x = 0;
        if (p.y < 0) p.y = particleCanvas.height;
        if (p.y > particleCanvas.height) p.y = 0;

        const alpha = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
        particleCtx.beginPath();
        particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        particleCtx.fillStyle = `rgba(212, 168, 83, ${alpha})`;
        particleCtx.fill();
    });

    requestAnimationFrame(animateBgParticles);
}
animateBgParticles();

// ============================================================
// 4. CURSOR SPARKLE TRAIL
// ============================================================
const sparkles = [];
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Emit 2-3 sparkles per mouse move
    for (let i = 0; i < 2; i++) {
        sparkles.push({
            x: mouseX + (Math.random() - 0.5) * 20,
            y: mouseY + (Math.random() - 0.5) * 20,
            size: Math.random() * 3 + 1,
            life: 1,           // 1 = full life, 0 = dead
            decay: Math.random() * 0.03 + 0.02,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            color: Math.random() > 0.5 ? '212, 168, 83' : '245, 240, 232', // gold or white
        });
    }
});

/** Animate cursor sparkles — called every frame */
function animateSparkles() {
    sparkleCtx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);

    for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        s.size *= 0.97;

        if (s.life <= 0) {
            sparkles.splice(i, 1);
            continue;
        }

        sparkleCtx.beginPath();
        sparkleCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        sparkleCtx.fillStyle = `rgba(${s.color}, ${s.life})`;
        sparkleCtx.fill();

        // Draw a tiny cross/star shape for sparkle effect
        sparkleCtx.strokeStyle = `rgba(${s.color}, ${s.life * 0.5})`;
        sparkleCtx.lineWidth = 0.5;
        sparkleCtx.beginPath();
        sparkleCtx.moveTo(s.x - s.size * 2, s.y);
        sparkleCtx.lineTo(s.x + s.size * 2, s.y);
        sparkleCtx.moveTo(s.x, s.y - s.size * 2);
        sparkleCtx.lineTo(s.x, s.y + s.size * 2);
        sparkleCtx.stroke();
    }

    requestAnimationFrame(animateSparkles);
}
animateSparkles();

// ============================================================
// 5. NAVBAR BEHAVIOUR
// ============================================================

// Scroll detection — add .scrolled class for styling
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // Active nav link based on section in view
    const sections = document.querySelectorAll('section');
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) current = section.id;
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
});

// Mobile hamburger toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
});

// Close mobile menu on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

// ============================================================
// 6. PRODUCT CATEGORY FILTER
// ============================================================
const catTabs = document.querySelectorAll('.cat-tab');
const productCards = document.querySelectorAll('.product-card');

catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        catTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const category = tab.dataset.category;

        productCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// ============================================================
// 7. SCROLL REVEAL ANIMATIONS (Intersection Observer)
// ============================================================
function setupRevealAnimations() {
    // Add .reveal class to elements we want to animate on scroll
    const targets = document.querySelectorAll(
        '.section-header, .category-tabs, .product-card, .about-image, .about-content, .contact-info, .contact-form, .footer-brand, .footer-links'
    );
    targets.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation for a cascading effect
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    targets.forEach(el => observer.observe(el));
}
setupRevealAnimations();

// ============================================================
// 8. ABOUT SECTION — Animated number counters
// ============================================================
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                const duration = 2000;
                const start = performance.now();

                function updateCount(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease-out cubic for smooth deceleration
                    const ease = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(target * ease).toLocaleString();
                    if (progress < 1) requestAnimationFrame(updateCount);
                }
                requestAnimationFrame(updateCount);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}
animateCounters();

// ============================================================
// 9. CONTACT FORM SUBMISSION (demo — visual feedback)
// ============================================================
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('form-submit');
    btn.innerHTML = '<span>Message Sent ✦</span>';
    btn.style.background = 'var(--emerald)';
    btn.style.borderColor = 'var(--emerald)';
    btn.style.color = 'var(--white)';
    setTimeout(() => {
        btn.innerHTML = '<span>Send Message</span><span class="submit-icon">→</span>';
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
        contactForm.reset();
    }, 3000);
});

// ============================================================
// 10. CHIME SOUND EFFECT — Generated via Web Audio API
// ============================================================
/** Play a soft chime sound (no external audio files needed) */
function playChime() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Create oscillator for a soft bell/chime tone
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    // Randomize pitch slightly for variety
    const baseFreq = 800 + Math.random() * 600;
    osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
    osc.type = 'sine';

    // Quick attack, gentle decay — bell-like envelope
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.5);
}

// ============================================================
// 11. ANTI-GRAVITY MODE — Matter.js Physics
// ============================================================

/** Initialize Matter.js engine, world, and bodies for all gravity elements */
function initGravity() {
    const { Engine, Runner, Bodies, Body, World, Mouse, MouseConstraint, Events } = Matter;

    // Create engine with standard gravity
    matterEngine = Engine.create({
        gravity: { x: 0, y: 1 }
    });

    matterRunner = Runner.create();
    matterBodies = [];

    const gravityElements = document.querySelectorAll('.gravity-element');

    gravityElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Store original position and styles so we can restore on deactivation
        el.dataset.origLeft = el.style.left || '';
        el.dataset.origTop = el.style.top || '';
        el.dataset.origPosition = getComputedStyle(el).position;
        el.dataset.origTransform = el.style.transform || '';
        el.dataset.origWidth = rect.width;
        el.dataset.origHeight = rect.height;

        // Create a Matter.js rectangular body for this element
        const body = Bodies.rectangle(x, y, rect.width, rect.height, {
            restitution: 0.5,       // Bounciness
            friction: 0.3,
            density: 0.002,
            frictionAir: 0.01,
            chamfer: { radius: 8 }, // Rounded corners for smoother collisions
        });

        World.add(matterEngine.world, body);
        matterBodies.push({ element: el, body });

        // Apply fixed positioning so JS can control placement
        el.style.position = 'fixed';
        el.style.left = rect.left + 'px';
        el.style.top = rect.top + 'px';
        el.style.width = rect.width + 'px';
        el.style.height = rect.height + 'px';
        el.style.margin = '0';
        el.style.zIndex = '100';
        el.style.transition = 'none';
        el.style.animation = 'none';
    });

    // Create boundary walls (floor, ceiling, left wall, right wall)
    const wallThickness = 60;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const walls = [
        Bodies.rectangle(w / 2, h + wallThickness / 2, w + 200, wallThickness, { isStatic: true }), // floor
        Bodies.rectangle(w / 2, -wallThickness / 2, w + 200, wallThickness, { isStatic: true }),     // ceiling
        Bodies.rectangle(-wallThickness / 2, h / 2, wallThickness, h + 200, { isStatic: true }),     // left
        Bodies.rectangle(w + wallThickness / 2, h / 2, wallThickness, h + 200, { isStatic: true }),  // right
    ];
    World.add(matterEngine.world, walls);

    // Mouse constraint for dragging elements
    const canvasEl = document.createElement('canvas');
    canvasEl.id = 'matter-canvas';
    canvasEl.width = w;
    canvasEl.height = h;
    canvasEl.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99;pointer-events:auto;cursor:grab;background:transparent;';
    document.body.appendChild(canvasEl);

    const mouse = Mouse.create(canvasEl);
    // Fix for high-DPI screens
    mouse.pixelRatio = window.devicePixelRatio || 1;

    mouseConstraint = MouseConstraint.create(matterEngine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });
    World.add(matterEngine.world, mouseConstraint);

    // Track which element is being dragged for glow effect
    Events.on(mouseConstraint, 'startdrag', (e) => {
        const body = e.body;
        const pair = matterBodies.find(p => p.body === body);
        if (pair) pair.element.classList.add('dragging');
    });
    Events.on(mouseConstraint, 'enddrag', (e) => {
        const body = e.body;
        const pair = matterBodies.find(p => p.body === body);
        if (pair) pair.element.classList.remove('dragging');
    });

    // Collision event — play chime sound
    Events.on(matterEngine, 'collisionStart', (e) => {
        e.pairs.forEach(pair => {
            // Only play sound for element-element or element-wall collisions
            const relVel = Math.abs(pair.collision.depth);
            if (relVel > 0.5) {
                playChime();
            }
        });
    });

    // Start the engine
    Runner.run(matterRunner, matterEngine);

    // Render loop — update DOM positions from physics bodies
    function renderGravity() {
        if (!gravityActive) return;

        matterBodies.forEach(({ element, body }) => {
            const bw = parseFloat(element.dataset.origWidth);
            const bh = parseFloat(element.dataset.origHeight);
            element.style.left = (body.position.x - bw / 2) + 'px';
            element.style.top = (body.position.y - bh / 2) + 'px';
            element.style.transform = `rotate(${body.angle}rad)`;
        });

        requestAnimationFrame(renderGravity);
    }
    renderGravity();
}

/** Destroy Matter.js world and restore all element positions */
function destroyGravity() {
    if (matterRunner) Matter.Runner.stop(matterRunner);
    if (matterEngine) Matter.Engine.clear(matterEngine);
    matterEngine = null;
    matterRunner = null;

    // Remove the interaction canvas
    const matterCanvas = document.getElementById('matter-canvas');
    if (matterCanvas) matterCanvas.remove();

    // Restore all elements to their original state
    matterBodies.forEach(({ element }) => {
        element.style.position = '';
        element.style.left = '';
        element.style.top = '';
        element.style.width = '';
        element.style.height = '';
        element.style.margin = '';
        element.style.zIndex = '';
        element.style.transform = '';
        element.style.transition = '';
        element.style.animation = '';
        element.classList.remove('dragging');
    });

    matterBodies = [];
}

// ============================================================
// 12. GRAVITY TOGGLE BUTTON HANDLER
// ============================================================
gravityToggle.addEventListener('click', () => {
    gravityActive = !gravityActive;
    document.body.classList.toggle('gravity-active', gravityActive);
    gravityToggle.classList.toggle('active', gravityActive);

    if (gravityActive) {
        gravityToggle.querySelector('.gravity-text').textContent = 'Deactivate Gravity';
        gravityToggle.querySelector('.gravity-icon').textContent = '✨';
        // Scroll to top before activating so all elements are visible
        window.scrollTo({ top: 0, behavior: 'instant' });
        // Small delay so layout settles after scroll
        setTimeout(() => initGravity(), 100);
    } else {
        gravityToggle.querySelector('.gravity-text').textContent = 'Activate Royal Gravity';
        gravityToggle.querySelector('.gravity-icon').textContent = '🌌';
        destroyGravity();
    }
});

// ============================================================
// 13. PRODUCT CARD SHIMMER EFFECT ON HOVER
// ============================================================
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Move the glow to follow the cursor
        const glow = card.querySelector('.card-glow');
        if (glow) {
            glow.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(212,168,83,0.25), transparent 60%)`;
        }
    });
});

// ============================================================
// 14. SMOOTH SCROLL for anchor links
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

console.log('%c✦ Royal Spark — Where Elegance Meets Eternity ✦', 'color: #d4a853; font-size: 16px; font-family: serif; font-weight: bold;');
