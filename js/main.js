/* ========================================
   AENDRA — Interior Mood by Alejandra Vasquez
   Main JS — Vanilla (no GSAP) v2.0
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

/* ========== REDUCED MOTION CHECK ========== */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ========== NAVBAR SCROLL BEHAVIOR ========== */
const navbar = document.getElementById('navbar') || document.querySelector('nav');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
    });
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

            // Close mobile menu if open
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

/* ========== HERO CANVAS ANIMATION ========== */
const canvas = document.getElementById('heroCanvas');
if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let W, H, lines = [], animId;

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

    function drawLines() {
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
        animId = requestAnimationFrame(drawLines);
    }

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animId);
        initCanvas();
        drawLines();
    });
    initCanvas();
    drawLines();
}

/* ========== CUSTOM CURSOR — REMOVED ==========
   Removed per accessibility/performance guidelines.
   Custom cursors degrade UX on touch devices and
   interfere with system accessibility settings.
   =============================================== */

/* ========== INTERSECTION OBSERVER — .reveal ELEMENTS ========== */
if (!prefersReducedMotion) {
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                revealObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(r => revealObserver.observe(r));
} else {
    document.querySelectorAll('.reveal').forEach(r => r.classList.add('visible'));
}

/* ========== FLOATING WHATSAPP BUTTON ========== */
const floatingWa = document.querySelector('.floating-wa');
if (floatingWa) {
    window.addEventListener('scroll', () => {
        floatingWa.classList.toggle('visible', window.scrollY > window.innerHeight * 0.8);
    });
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
   PRODUCT IMAGE GALLERY / CAROUSEL
   ======================================== */
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
            timer = setInterval(() => goTo(current + 1), 3800);
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

        // Touch / swipe support
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
