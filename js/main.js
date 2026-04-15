/* ========================================
   AENDRA — Interior Mood by Alejandra Vasquez
   Main JS v3.0 — GSAP ScrollTrigger + Premium Motion
   ======================================== */

/* ========== WHATSAPP FUNCTIONS ========== */
function openWhatsApp(product, price) {
    const msg = 'Hola Alejandra, me interesa ' + product + ' (' + price + '). Quisiera más información.';
    window.open('https://wa.me/51965104352?text=' + encodeURIComponent(msg), '_blank');
}
function orderKit(btn) {
    const card = btn.closest('.kit-card');
    const name = card.dataset.kit;
    const price = card.dataset.price;
    openWhatsApp(name, price);
}

/* ========== REDUCED MOTION — DYNAMIC LISTENER ========== */
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = motionQuery.matches;
motionQuery.addEventListener('change', () => {
    prefersReducedMotion = motionQuery.matches;
    if (prefersReducedMotion && animId) {
        cancelAnimationFrame(animId);
        animId = null;
    }
});

/* ========== NAVBAR SCROLL BEHAVIOR ========== */
const navbar = document.getElementById('navbar') || document.querySelector('nav');
if (navbar) {
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
        const sy = window.scrollY;
        navbar.classList.toggle('scrolled', sy > 80);
        lastScrollY = sy;
    }, { passive: true });
}

/* ========== SMOOTH ANCHOR SCROLL ========== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });

            const mm = document.querySelector('.mobile-menu');
            const hb = document.querySelector('.hamburger');
            if (mm && mm.classList.contains('open')) {
                mm.classList.remove('open');
                if (hb) hb.classList.remove('open');
                document.body.style.overflow = '';
            }
        }
    });
});

/* ========== HAMBURGER MENU TOGGLE ========== */
const hamburger = document.querySelector('.hamburger');
if (hamburger) {
    hamburger.addEventListener('click', function () {
        this.classList.toggle('open');
        const menu = document.querySelector('.mobile-menu');
        if (menu) {
            menu.classList.toggle('open');
            document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
        }
    });
}

/* ========== HERO CANVAS ANIMATION — FPS CAPPED ========== */
const canvas = document.getElementById('heroCanvas');
let animId = null;

if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let W, H, lines = [];
    const TARGET_FPS = 30;
    const FRAME_MS = 1000 / TARGET_FPS;
    let lastFrame = 0;

    function initCanvas() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
        lines = [];
        for (let i = 0; i < 8; i++) {
            lines.push({
                x: Math.random() * W, y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.3,
                len: Math.random() * 200 + 100,
                alpha: Math.random() * 0.3 + 0.05
            });
        }
    }

    function drawLines(timestamp) {
        if (prefersReducedMotion) return;
        animId = requestAnimationFrame(drawLines);
        if (timestamp - lastFrame < FRAME_MS) return;
        lastFrame = timestamp;

        ctx.clearRect(0, 0, W, H);
        lines.forEach(l => {
            l.x += l.vx; l.y += l.vy;
            if (l.x < -l.len) l.x = W + l.len;
            if (l.x > W + l.len) l.x = -l.len;
            if (l.y < 0) l.y = H;
            if (l.y > H) l.y = 0;
            const grad = ctx.createLinearGradient(l.x - l.len, l.y, l.x + l.len, l.y + 20);
            grad.addColorStop(0, 'rgba(184,147,90,0)');
            grad.addColorStop(0.5, `rgba(184,147,90,${l.alpha})`);
            grad.addColorStop(1, 'rgba(184,147,90,0)');
            ctx.beginPath();
            ctx.moveTo(l.x - l.len, l.y);
            ctx.bezierCurveTo(l.x - l.len / 2, l.y - 30, l.x + l.len / 2, l.y + 30, l.x + l.len, l.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }

    window.addEventListener('resize', () => {
        if (animId) cancelAnimationFrame(animId);
        initCanvas();
        drawLines(0);
    });
    initCanvas();
    drawLines(0);
}

/* ========== CUSTOM GOLD CURSOR (desktop + hover device only) ========== */
const canHover = window.matchMedia('(hover: hover)').matches;
if (window.innerWidth > 768 && !prefersReducedMotion && canHover) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (dot && ring) {
        let mouseX = 0, mouseY = 0;
        let dotX = 0, dotY = 0, ringX = 0, ringY = 0;

        window.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        setTimeout(() => {
            dot.style.opacity = '1';
            ring.style.opacity = '1';
        }, 500);

        function updateCursor() {
            if (prefersReducedMotion) return;
            dotX += (mouseX - dotX) * 0.2;
            dotY += (mouseY - dotY) * 0.2;
            ringX += (mouseX - ringX) * 0.1;
            ringY += (mouseY - ringY) * 0.1;
            dot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;
            ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
            requestAnimationFrame(updateCursor);
        }
        updateCursor();

        document.querySelectorAll('a, button, .kit-card, .funda-card, .product-card, .mood-card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                ring.style.width = '60px';
                ring.style.height = '60px';
                ring.style.opacity = '0.5';
            });
            el.addEventListener('mouseleave', () => {
                ring.style.width = '40px';
                ring.style.height = '40px';
                ring.style.opacity = '1';
            });
        });
    }
}

/* ========== INTERSECTION OBSERVER — .reveal ELEMENTS ========== */
if (!prefersReducedMotion) {
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    reveals.forEach(r => revealObserver.observe(r));
}

/* ========== FLOATING WHATSAPP BUTTON ========== */
const floatingWa = document.querySelector('.floating-wa');
if (floatingWa) {
    window.addEventListener('scroll', () => {
        floatingWa.classList.toggle('visible', window.scrollY > window.innerHeight * 0.8);
    }, { passive: true });
}

/* ========== ACTIVE NAV LINK HIGHLIGHT ========== */
const navSections = document.querySelectorAll('main section[id]');
if (navSections.length > 0) {
    const navObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                document.querySelectorAll('.nav-links a').forEach(a => {
                    a.classList.toggle('active', a.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { rootMargin: '-40% 0px -60% 0px' });
    navSections.forEach(sec => navObserver.observe(sec));
}

/* ========================================
   GSAP SCROLL TRIGGERS — Premium Motion
   ======================================== */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    /* Parallax orbs on scroll */
    document.querySelectorAll('.orb').forEach((orb, i) => {
        const speed = [0.15, 0.1, 0.2][i] || 0.1;
        gsap.to(orb, {
            yPercent: -30 * speed * 100,
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5
            }
        });
    });

    /* Hero content parallax fade */
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        gsap.to(heroContent, {
            y: -60,
            opacity: 0.3,
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: '80% top',
                scrub: 1
            }
        });
    }

    /* Progress line scrub in "Como Funciona" */
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        gsap.to(progressFill, {
            width: '100%',
            scrollTrigger: {
                trigger: '.progress-line',
                start: 'top 80%',
                end: 'top 30%',
                scrub: 0.5
            }
        });
    }

    /* Staggered reveals for kit cards */
    gsap.utils.toArray('.kit-card').forEach((card, i) => {
        gsap.from(card, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.1,
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    /* Staggered reveals for product cards */
    gsap.utils.toArray('.funda-card').forEach((card, i) => {
        gsap.from(card, {
            y: 30,
            opacity: 0,
            duration: 0.7,
            delay: (i % 3) * 0.12,
            scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                toggleActions: 'play none none none'
            }
        });
    });

    /* Marquee speed boost on scroll velocity */
    const marqueeTrack = document.getElementById('marquee');
    if (marqueeTrack) {
        ScrollTrigger.create({
            trigger: '.marquee-section',
            start: 'top bottom',
            end: 'bottom top',
            onUpdate: (self) => {
                const velocity = Math.abs(self.getVelocity()) / 1000;
                const speed = Math.min(velocity * 0.5, 3);
                marqueeTrack.style.animationDuration = Math.max(8, 20 - speed * 4) + 's';
            }
        });
    }
}

/* ========================================
   PRODUCT IMAGE GALLERY / CAROUSEL
   ======================================== */
const CAROUSEL_INTERVAL = 3800;

function initGalleries() {
    document.querySelectorAll('.card-gallery').forEach(gallery => {
        const slides = gallery.querySelectorAll('.gallery-slide');
        if (slides.length <= 1) return;

        const track = gallery.querySelector('.gallery-slides');
        const dots = gallery.querySelectorAll('.gallery-dot');
        let current = 0;
        let timer = null;

        function goTo(n) {
            current = ((n % slides.length) + slides.length) % slides.length;
            track.style.transform = `translateX(-${current * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        }

        function startAuto() {
            timer = setInterval(() => goTo(current + 1), CAROUSEL_INTERVAL);
        }
        function stopAuto() {
            clearInterval(timer);
        }

        gallery.querySelector('.gallery-arrow.prev')
            ?.addEventListener('click', e => { e.stopPropagation(); stopAuto(); goTo(current - 1); startAuto(); });
        gallery.querySelector('.gallery-arrow.next')
            ?.addEventListener('click', e => { e.stopPropagation(); stopAuto(); goTo(current + 1); startAuto(); });
        dots.forEach((dot, i) =>
            dot.addEventListener('click', e => { e.stopPropagation(); stopAuto(); goTo(i); startAuto(); }));

        let touchStartX = 0;
        gallery.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        gallery.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) { stopAuto(); goTo(current + (diff > 0 ? 1 : -1)); startAuto(); }
        });

        gallery.addEventListener('mouseenter', stopAuto);
        gallery.addEventListener('mouseleave', startAuto);

        startAuto();
    });
}

document.addEventListener('DOMContentLoaded', initGalleries);
