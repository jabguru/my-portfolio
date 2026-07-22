const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Top bar + scroll progress ---------- */

const topbar = document.getElementById('topbar');
const progressBar = document.getElementById('scroll-progress');

let progressTicking = false;
const updateScrollChrome = () => {
    progressTicking = false;
    if (topbar) topbar.classList.toggle('is-scrolled', window.scrollY > 24);
    if (progressBar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    }
};
window.addEventListener('scroll', () => {
    if (!progressTicking) {
        progressTicking = true;
        requestAnimationFrame(updateScrollChrome);
    }
}, { passive: true });
updateScrollChrome();

/* ---------- Lagos clock ---------- */

const clock = document.getElementById('local-time');
if (clock) {
    const formatter = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos',
    });
    const tick = () => { clock.textContent = `Lagos · ${formatter.format(new Date())} GMT+1`; };
    tick();
    setInterval(tick, 30_000);
}

/* ---------- Reveal on scroll ---------- */

const revealEls = document.querySelectorAll('[data-reveal]');
revealEls.forEach((el) => {
    const delay = el.getAttribute('data-reveal-delay');
    if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`);
});
if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
} else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* Process connector line keys off the grid's own visibility */
const processGrid = document.getElementById('process-grid');
if (processGrid) {
    if (!reducedMotion && 'IntersectionObserver' in window) {
        const lineObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    processGrid.classList.add('is-visible');
                    lineObserver.disconnect();
                }
            });
        }, { threshold: 0.3 });
        lineObserver.observe(processGrid);
    } else {
        processGrid.classList.add('is-visible');
    }
}

/* ---------- Count-up stats ---------- */

const counters = document.querySelectorAll('[data-count]');
const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.countSuffix || '';
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = Math.round(target * eased);
        el.textContent = `${value.toLocaleString('en-US')}${suffix}`;
        if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
};
if (counters.length) {
    if (!reducedMotion && 'IntersectionObserver' in window) {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    runCounter(entry.target);
                    countObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        counters.forEach((el) => countObserver.observe(el));
    } else {
        counters.forEach((el) => {
            el.textContent = `${parseFloat(el.dataset.count).toLocaleString('en-US')}${el.dataset.countSuffix || ''}`;
        });
    }
}

/* ---------- Hero: crossfade + cursor tilt ---------- */

const heroShots = document.querySelectorAll('.hero-shot');
if (heroShots.length > 1 && !reducedMotion) {
    let shotIndex = 0;
    setInterval(() => {
        heroShots[shotIndex].classList.remove('is-active');
        shotIndex = (shotIndex + 1) % heroShots.length;
        heroShots[shotIndex].classList.add('is-active');
    }, 4200);
}

const heroStage = document.getElementById('hero-stage');
const heroSection = document.getElementById('top');
if (heroStage && heroSection && !reducedMotion && matchMedia('(pointer: fine)').matches) {
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0, tiltRaf = null;
    const lerpTilt = () => {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        heroStage.style.transform = `perspective(1100px) rotateY(${currentX}deg) rotateX(${currentY}deg)`;
        if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
            tiltRaf = requestAnimationFrame(lerpTilt);
        } else {
            tiltRaf = null;
        }
    };
    const kickTilt = () => { if (!tiltRaf) tiltRaf = requestAnimationFrame(lerpTilt); };
    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroStage.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
        targetX = Math.max(-1, Math.min(1, dx)) * 7;
        targetY = Math.max(-1, Math.min(1, -dy)) * 5;
        kickTilt();
    });
    heroSection.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        kickTilt();
    });
}

/* ---------- Apps showcase: pin and swap ---------- */

const showcaseWrap = document.getElementById('apps');
const showcasePanels = showcaseWrap ? [...showcaseWrap.querySelectorAll('.showcase-panel')] : [];
const showcaseDots = showcaseWrap ? [...showcaseWrap.querySelectorAll('.showcase-dot')] : [];
const showcaseCounter = document.getElementById('showcase-counter');
const desktopQuery = window.matchMedia('(min-width: 1024px)');

if (showcaseWrap && showcasePanels.length) {
    let activeIndex = 0;
    const setActive = (index) => {
        if (index === activeIndex) return;
        activeIndex = index;
        showcasePanels.forEach((panel, i) => {
            panel.classList.toggle('is-active', i === index);
            panel.classList.toggle('is-passed', i < index);
        });
        showcaseDots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
        if (showcaseCounter) showcaseCounter.textContent = `0${index + 1} / 0${showcasePanels.length}`;
    };

    let showcaseTicking = false;
    const onShowcaseScroll = () => {
        showcaseTicking = false;
        if (!desktopQuery.matches) return;
        const rect = showcaseWrap.getBoundingClientRect();
        const range = showcaseWrap.offsetHeight - window.innerHeight;
        if (range <= 0) return;
        const progress = Math.min(Math.max(-rect.top / range, 0), 0.999);
        setActive(Math.floor(progress * showcasePanels.length));
    };
    window.addEventListener('scroll', () => {
        if (!showcaseTicking) {
            showcaseTicking = true;
            requestAnimationFrame(onShowcaseScroll);
        }
    }, { passive: true });

    const applyMode = () => {
        if (desktopQuery.matches) {
            onShowcaseScroll();
        } else {
            showcasePanels.forEach((panel) => panel.classList.remove('is-passed'));
            showcasePanels.forEach((panel) => panel.classList.add('is-active'));
        }
    };
    desktopQuery.addEventListener('change', applyMode);
    applyMode();
}

/* ---------- Experience timeline fill ---------- */

const timeline = document.getElementById('timeline');
const timelineFill = document.getElementById('timeline-fill');
if (timeline && timelineFill) {
    let timelineTicking = false;
    const updateFill = () => {
        timelineTicking = false;
        const rect = timeline.getBoundingClientRect();
        const progress = Math.min(Math.max((window.innerHeight * 0.72 - rect.top) / rect.height, 0), 1);
        timelineFill.style.height = `${progress * 100}%`;
    };
    window.addEventListener('scroll', () => {
        if (!timelineTicking) {
            timelineTicking = true;
            requestAnimationFrame(updateFill);
        }
    }, { passive: true });
    updateFill();
}

/* ---------- Dock: scrollspy + sliding indicator ---------- */

const dock = document.getElementById('dock');
const dockIndicator = document.getElementById('dock-indicator');
const dockItems = dock ? [...dock.querySelectorAll('.dock-item')] : [];
const spySections = [...document.querySelectorAll('[data-spy]')];

const moveIndicator = (item) => {
    if (!dockIndicator || !item) return;
    dockIndicator.style.left = `${item.offsetLeft}px`;
    dockIndicator.style.width = `${item.offsetWidth}px`;
};

const activateDock = (name) => {
    const item = dockItems.find((el) => el.dataset.dock === name);
    if (!item || item.classList.contains('is-active')) return;
    dockItems.forEach((el) => el.classList.toggle('is-active', el === item));
    moveIndicator(item);
};

if (dock && dockItems.length && spySections.length) {
    requestAnimationFrame(() => moveIndicator(dockItems.find((el) => el.classList.contains('is-active'))));
    window.addEventListener('resize', () => {
        moveIndicator(dockItems.find((el) => el.classList.contains('is-active')));
    });

    if ('IntersectionObserver' in window) {
        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) activateDock(entry.target.dataset.spy);
            });
        }, { rootMargin: '-42% 0px -50% 0px' });
        spySections.forEach((section) => spyObserver.observe(section));
    }

    dockItems.forEach((item) => {
        item.addEventListener('click', () => activateDock(item.dataset.dock));
    });
}

/* ---------- Side projects: drag to scroll ---------- */

const carousel = document.getElementById('carousel');
if (carousel && matchMedia('(pointer: fine)').matches) {
    let isDown = false, startX = 0, startScroll = 0, moved = false;
    carousel.addEventListener('pointerdown', (e) => {
        isDown = true;
        moved = false;
        startX = e.clientX;
        startScroll = carousel.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 6 && !moved) {
            moved = true;
            carousel.classList.add('is-dragging');
        }
        if (moved) carousel.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', () => {
        isDown = false;
        carousel.classList.remove('is-dragging');
    });
}

/* ---------- Magnetic buttons ---------- */

if (!reducedMotion && matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
            const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
            el.style.transform = `translate(${dx * 6}px, ${dy * 6}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
}

/* ---------- Contact form ---------- */

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const message = document.getElementById('message')?.value.trim();

        if (!name || !email || !message) {
            formStatus.classList.remove('hidden');
            formStatus.classList.remove('text-mint');
            formStatus.classList.add('text-coral');
            formStatus.textContent = 'Fill in your name, email and message to send.';
            return;
        }

        const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        window.location.href = `mailto:brownjulius980@gmail.com?subject=${subject}&body=${body}`;

        formStatus.classList.remove('hidden');
        formStatus.classList.remove('text-coral');
        formStatus.classList.add('text-mint');
        formStatus.textContent = 'Opening your email client to send the message.';
    });
}
