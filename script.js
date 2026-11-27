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
// the names and arrows jump to an app. It moves on by itself every few
// seconds (the current name's line fills up as the timer), and holds still
// while the pointer is over it, something in it has focus, it's off screen,
// or the visitor pressed pause. Reduced motion: no slideshow.
// ---------------------------------------------------------------------------
const track = document.querySelector('.app-track');
const appNav = document.querySelector('[data-app-nav]');
if (track) {
    const DWELL = 6000;
    const section = track.closest('section');
    const slides = [...track.querySelectorAll('.app')];
    const tabs = appNav ? [...appNav.querySelectorAll('[data-go]')] : [];
    const tabBox = appNav?.querySelector('.app-tabs');
    const pauseBtn = appNav?.querySelector('[data-pause]');
    let current = 0;
    let inView = false;

    const go = (i) => {
        const n = slides.length;
        const target = ((i % n) + n) % n;
        const left = Math.min(slides[target].offsetLeft - slides[0].offsetLeft, track.scrollWidth - track.clientWidth);
        track.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
    };
    const show = (i) => {
        current = i;
        slides.forEach((s, n) => s.classList.toggle('current', n === i));
        tabs.forEach((t, n) => t.setAttribute('aria-current', String(n === i)));
        // keep the current name visible when the names scroll sideways (phones)
        const tab = tabs[i];
        if (tab && tabBox && tabBox.scrollWidth > tabBox.clientWidth) {
            tabBox.scrollTo({ left: tab.offsetLeft - tabBox.offsetLeft - 8, behavior: reducedMotion ? 'auto' : 'smooth' });
        }
        if (inView) slides[i].classList.add('in');
    };
    slides[0].classList.add('current');

    // --- slideshow ---------------------------------------------------------
    const autoplay = !reducedMotion && appNav;
    const hold = { hover: false, focus: false, user: false };
    const sync = () => {
        if (!autoplay) return;
        const paused = hold.hover || hold.focus || hold.user || !inView || document.hidden;
        appNav.classList.toggle('paused', paused);
    };
    // start the current name's timer again from zero
    const restart = () => {
        if (!autoplay) return;
        appNav.classList.remove('autoplay');
        void appNav.offsetWidth;
        appNav.classList.add('autoplay');
    };
    if (autoplay) {
        appNav.style.setProperty('--dwell', `${DWELL}ms`);
        appNav.classList.add('autoplay');
        appNav.addEventListener('animationend', (e) => {
            if (e.animationName === 'dwell') go(current + 1);
        });
        section.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hold.hover = true; sync(); } });
        section.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hold.hover = false; sync(); } });
        section.addEventListener('focusin', () => { hold.focus = true; sync(); });
        section.addEventListener('focusout', (e) => { if (!section.contains(e.relatedTarget)) { hold.focus = false; sync(); } });
        document.addEventListener('visibilitychange', sync);
        // a finger on the slider resets the timer so it never moves mid-swipe
        track.addEventListener('touchstart', restart, { passive: true });
        if (pauseBtn) {
            pauseBtn.hidden = false;
            pauseBtn.addEventListener('click', () => {
                hold.user = !hold.user;
                pauseBtn.classList.toggle('is-paused', hold.user);
                pauseBtn.setAttribute('aria-label', hold.user ? 'Play the slideshow' : 'Pause the slideshow');
                sync();
            });
        }
    }

    // --- controls ----------------------------------------------------------
    if (appNav) {
        appNav.hidden = false;
        tabs.forEach((t) => t.addEventListener('click', () => go(Number(t.dataset.go))));
        appNav.querySelector('[data-prev]')?.addEventListener('click', () => go(current - 1));
        appNav.querySelector('[data-next]')?.addEventListener('click', () => go(current + 1));
    }
    [track, appNav].forEach((el) => el?.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        go(current + (e.key === 'ArrowRight' ? 1 : -1));
    }));
    // tapping the app that peeks in at the edge brings it forward
    track.addEventListener('click', (e) => {
        const slide = e.target.closest('.app');
        if (slide && !slide.classList.contains('current') && !e.target.closest('a')) go(slides.indexOf(slide));
    });

    if ('IntersectionObserver' in window) {
        const seen = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) show(slides.indexOf(entry.target));
            });
        }, { root: track, threshold: 0.6 });
        slides.forEach((s) => seen.observe(s));
        // screens animate, and the slideshow runs, only while the slider is on screen
        new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            if (inView) slides[current].classList.add('in');
            sync();
        }, { threshold: 0.25 }).observe(track);
    } else {
        slides.forEach((s) => s.classList.add('in'));
    }
    if (reducedMotion) slides.forEach((s) => s.classList.add('in'));
    sync();
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
