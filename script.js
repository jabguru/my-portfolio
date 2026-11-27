const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Hero: the pieces around the name lean toward the pointer, each by its own
// depth, so the nearer ones move more. Touch screens just get the slow drift.
// ---------------------------------------------------------------------------
const drift = document.querySelector('[data-drift]');
if (drift && !reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const hero = drift.closest('.hero');
    hero.addEventListener('pointermove', (e) => {
        const r = drift.getBoundingClientRect();
        const clamp = (v) => Math.max(-1, Math.min(1, v));
        drift.style.setProperty('--px', clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2)).toFixed(3));
        drift.style.setProperty('--py', clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2)).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => {
        drift.style.setProperty('--px', '0');
        drift.style.setProperty('--py', '0');
    });
}

// The time in the phone's corner is the real time in Lagos
const clocks = document.querySelectorAll('[data-lagos-time]');
if (clocks.length) {
    const lagos = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });
    const tick = () => {
        const now = lagos.format(new Date());
        clocks.forEach((c) => { c.textContent = now; });
    };
    tick();
    setInterval(tick, 15000);
}

// ---------------------------------------------------------------------------
// Apps: a sideways slider. Swiping and trackpads scroll the track natively;
// the names and arrows jump to an app, and the screens slide up the first
// time each app is shown.
// ---------------------------------------------------------------------------
const track = document.querySelector('.app-track');
const appNav = document.querySelector('[data-app-nav]');
if (track) {
    const slides = [...track.querySelectorAll('.app')];
    const tabs = appNav ? [...appNav.querySelectorAll('[data-go]')] : [];
    const prev = appNav?.querySelector('[data-prev]');
    const next = appNav?.querySelector('[data-next]');
    const tabBox = appNav?.querySelector('.app-tabs');
    let current = 0;
    let inView = false;

    const go = (i) => {
        const target = Math.max(0, Math.min(slides.length - 1, i));
        track.scrollTo({ left: target * track.clientWidth, behavior: reducedMotion ? 'auto' : 'smooth' });
    };
    const show = (i) => {
        current = i;
        tabs.forEach((t, n) => t.setAttribute('aria-current', String(n === i)));
        // keep the current name visible when the names scroll sideways (phones)
        const tab = tabs[i];
        if (tab && tabBox && tabBox.scrollWidth > tabBox.clientWidth) {
            tabBox.scrollTo({ left: tab.offsetLeft - tabBox.offsetLeft - 8, behavior: reducedMotion ? 'auto' : 'smooth' });
        }
        if (prev) prev.disabled = i === 0;
        if (next) next.disabled = i === slides.length - 1;
        if (inView) slides[i].classList.add('in');
    };

    if (appNav) {
        appNav.hidden = false;
        tabs.forEach((t) => t.addEventListener('click', () => go(Number(t.dataset.go))));
        prev?.addEventListener('click', () => go(current - 1));
        next?.addEventListener('click', () => go(current + 1));
    }
    [track, appNav].forEach((el) => el?.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        go(current + (e.key === 'ArrowRight' ? 1 : -1));
    }));

    if ('IntersectionObserver' in window) {
        const seen = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) show(slides.indexOf(entry.target));
            });
        }, { root: track, threshold: 0.6 });
        slides.forEach((s) => seen.observe(s));
        // screens only animate once the slider itself is on screen
        new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            if (inView) slides[current].classList.add('in');
        }, { threshold: 0.25 }).observe(track);
    } else {
        slides.forEach((s) => s.classList.add('in'));
    }
    if (reducedMotion) slides.forEach((s) => s.classList.add('in'));
}

// ---------------------------------------------------------------------------
// Header menu on small screens
// ---------------------------------------------------------------------------
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');
if (menuToggle && nav) {
    const setMenu = (open) => {
        nav.classList.toggle('open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
    };
    menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
}

// ---------------------------------------------------------------------------
// Contact: copy the email address
// ---------------------------------------------------------------------------
const copyButton = document.querySelector('[data-copy]');
if (copyButton && navigator.clipboard) {
    copyButton.hidden = false;
    let reset;
    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(copyButton.dataset.copy);
            copyButton.textContent = 'Copied';
        } catch {
            copyButton.textContent = 'Couldn’t copy';
        }
        clearTimeout(reset);
        reset = setTimeout(() => { copyButton.textContent = 'Copy email'; }, 2000);
    });
}
