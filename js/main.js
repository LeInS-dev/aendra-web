/* ========================================
   AENDRA — Interior Mood by Alejandra Vasquezz
   Main JS — GSAP Animations v1.0
   ======================================== */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ========== WHATSAPP FUNCTIONS ========== */
function openWhatsApp(product, price) {
    const msg = 'Hola Alejandra, me interesa ' + product + ' (' + price + '). Quisiera mas informacion.';
    window.open('https://wa.me/51965104352?text=' + encodeURIComponent(msg), '_blank');
}
function orderKit(btn) {
    const card = btn.closest('.kit-card');
    const name = card.dataset.kit;
    const price = card.dataset.price;
    openWhatsApp(name, price);
}

if (!prefersReducedMotion) {

/* ========== CUSTOM CURSOR (desktop only) ========== */
if (window.innerWidth > 768) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
    gsap.to([dot, ring], { opacity: 1, duration: 0.5, delay: 0.5 });

    window.addEventListener('mousemove', (e) => {
        gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
        gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.3, ease: 'power2.out' });
    });

    document.querySelectorAll('a, button, .product-card, .gallery-item').forEach(el => {
        el.addEventListener('mouseenter', () => gsap.to(ring, { scale: 1.8, opacity: 0.5, duration: 0.3 }));
        el.addEventListener('mouseleave', () => gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3 }));
    });
}

/* ========== HERO PARTICLES ========== */
const particlesContainer = document.getElementById('particles');
for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.width = (Math.random() * 3 + 1) + 'px';
    p.style.height = p.style.width;
    particlesContainer.appendChild(p);
    gsap.to(p, {
        opacity: Math.random() * 0.4 + 0.1,
        y: (Math.random() - 0.5) * 80,
        x: (Math.random() - 0.5) * 40,
        duration: Math.random() * 4 + 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 3
    });
}

/* ========== NAVBAR ========== */
ScrollTrigger.create({
    trigger: '.hero',
    start: 'bottom top',
    onEnter: () => document.querySelector('.navbar').classList.add('scrolled'),
    onLeaveBack: () => document.querySelector('.navbar').classList.remove('scrolled')
});

gsap.from('.navbar', { yPercent: -100, duration: 0.8, ease: 'power3.out', delay: 0.2 });

/* Smooth scroll for nav links */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            gsap.to(window, { scrollTo: { y: target, offsetY: 60 }, duration: 1, ease: 'power3.inOut' });
            const mm = document.querySelector('.mobile-menu');
            const hb = document.querySelector('.hamburger');
            if (mm.classList.contains('open')) {
                mm.classList.remove('open');
                hb.classList.remove('open');
                document.body.style.overflow = '';
            }
        }
    });
});

/* Hamburger */
document.querySelector('.hamburger').addEventListener('click', function() {
    this.classList.toggle('open');
    const menu = document.querySelector('.mobile-menu');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    if (menu.classList.contains('open')) {
        gsap.from('.mobile-menu a', { opacity: 0, y: 20, stagger: 0.08, duration: 0.5, ease: 'power2.out', delay: 0.1 });
    }
});

/* ========== HERO TIMELINE ========== */
const heroTl = gsap.timeline({ delay: 0.3 });
heroTl
    .from('.hero-badge', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' })
    .from('.hero h1', { opacity: 0, y: 50, duration: 1, ease: 'power4.out' }, '-=0.2')
    .from('.hero .tagline', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, '-=0.4')
    .from('.hero .subtitle', { opacity: 0, duration: 0.7, ease: 'power2.out' }, '-=0.3')
    .from('.hero-ctas', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, '-=0.2')
    .from('.hero-scroll-indicator', { opacity: 0, y: -10, duration: 0.5 }, '-=0.1');

/* Hero parallax */
gsap.to('.hero-glow-1', { y: 100, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }});
gsap.to('.hero-glow-2', { y: -80, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }});

/* Scroll indicator pulse */
gsap.to('.scroll-line', { scaleY: 0.5, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: 'top' });

/* ========== ABOUT ========== */
gsap.from('.about-image-wrap', {
    x: -80, opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { once: true, trigger: '.about', start: 'top 70%' }
});
gsap.from('.about-image-accent', {
    scale: 0, opacity: 0, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { once: true, trigger: '.about', start: 'top 65%' }
});
gsap.from('.about-text h2, .about-text p, .about-text .founder-sig', {
    y: 30, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'power2.out',
    scrollTrigger: { once: true, trigger: '.about-text', start: 'top 75%' }
});

/* ========== GALLERY ========== */
gsap.from('.gallery-item', {
    scale: 0.85, opacity: 0, duration: 0.6, ease: 'power2.out',
    stagger: { amount: 0.6, from: 'random' },
    scrollTrigger: { once: true, trigger: '.gallery-grid', start: 'top 75%' }
});

/* ========== KITS ========== */
gsap.from('.kit-card', {
    y: 60, opacity: 0, stagger: 0.1, duration: 0.7, ease: 'power2.out',
    scrollTrigger: { once: true, trigger: '.kits-grid', start: 'top 75%' }
});

/* Kit hover */
document.querySelectorAll('.kit-card').forEach(card => {
    const tl = gsap.timeline({ paused: true });
    tl.to(card, { y: -8, boxShadow: '0 16px 40px rgba(61,31,13,0.2)', duration: 0.3, ease: 'power2.out' });
    card.addEventListener('mouseenter', () => tl.play());
    card.addEventListener('mouseleave', () => tl.reverse());
});

/* ========== PRODUCTS ========== */
document.querySelectorAll('.product-card').forEach(card => {
    const tl = gsap.timeline({ paused: true });
    tl.to(card, { y: -6, background: 'white', boxShadow: '0 12px 30px rgba(61,31,13,0.12)', duration: 0.3 });
    card.addEventListener('mouseenter', () => tl.play());
    card.addEventListener('mouseleave', () => tl.reverse());
});

/* ========== SERVICES ========== */
gsap.from('.service-card', {
    y: 50, opacity: 0, stagger: 0.15, duration: 0.7, ease: 'power2.out',
    scrollTrigger: { once: true, trigger: '.servicios-grid', start: 'top 75%' }
});

/* Service icon pulse */
gsap.to('.service-icon', {
    scale: 1.1, duration: 2, repeat: -1, yoyo: true, ease: 'power1.inOut',
    stagger: 0.4
});

/* ========== HOW IT WORKS ========== */
gsap.from('.step', {
    y: 40, opacity: 0, stagger: 0.2, duration: 0.7, ease: 'power2.out',
    scrollTrigger: { once: true, trigger: '.steps-container', start: 'top 75%' }
});

/* Progress line */
gsap.to('.steps-line-fill', {
    width: '100%', duration: 1,
    scrollTrigger: { trigger: '.steps-container', start: 'top 65%', end: 'bottom 60%', scrub: 1 }
});

/* ========== TESTIMONIALS ========== */
gsap.from('.testimonial', {
    x: -50, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { once: true, trigger: '.testimonios-grid', start: 'top 75%' }
});
gsap.from('.testimonial-quote', {
    scale: 0, rotation: -20, opacity: 0, stagger: 0.15, duration: 0.6, ease: 'back.out(1.7)',
    scrollTrigger: { once: true, trigger: '.testimonios-grid', start: 'top 75%' }
});

/* ========== CONTACT ========== */
gsap.from('.contacto-heading', {
    y: 30, opacity: 0, duration: 0.8, ease: 'power2.out',
    scrollTrigger: { once: true, trigger: '.contacto', start: 'top 70%' }
});
gsap.from('.contact-btn', {
    scale: 0.8, opacity: 0, stagger: 0.12, duration: 0.6, ease: 'back.out(1.7)',
    scrollTrigger: { once: true, trigger: '.contact-btns', start: 'top 80%' }
});

/* WhatsApp button pulse */
gsap.to('.btn-whatsapp', {
    scale: 1.03, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut'
});

/* ========== FLOATING WHATSAPP ========== */
ScrollTrigger.create({
    trigger: '.hero',
    start: 'bottom 80%',
    onEnter: () => gsap.to('.floating-wa', { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }),
    onLeaveBack: () => gsap.to('.floating-wa', { opacity: 0, scale: 0, duration: 0.3 })
});

/* ========== SECTION LABELS & TITLES REVEAL ========== */
document.querySelectorAll('.section-label, .section-title, .section-subtitle, .divider').forEach(el => {
    gsap.from(el, {
        y: 20, opacity: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { once: true, trigger: el, start: 'top 85%' }
    });
});

/* ========== FOOTER ========== */
gsap.from('footer', {
    opacity: 0, duration: 0.6,
    scrollTrigger: { once: true, trigger: 'footer', start: 'top 95%' }
});

/* ========== ACTIVE NAV LINK ========== */
document.querySelectorAll('main section[id]').forEach(section => {
    ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveNav(section.id),
        onEnterBack: () => setActiveNav(section.id)
    });
});

function setActiveNav(id) {
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
}

/* Force-complete any scroll animations already past their trigger on load */
window.addEventListener('load', () => ScrollTrigger.refresh());

} /* end if !prefersReducedMotion */

/* ========================================
   PRODUCT IMAGE GALLERY / CAROUSEL
   ======================================== */
function initGalleries() {
    document.querySelectorAll('.card-gallery').forEach(gallery => {
        const slides = gallery.querySelectorAll('.gallery-slide');
        if (slides.length <= 1) return; // nothing to carousel

        const track  = gallery.querySelector('.gallery-slides');
        const dots   = gallery.querySelectorAll('.gallery-dot');
        let current  = 0;
        let timer    = null;

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
