const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Simulator: the tabs swap the phone screen and the inspector beside it
// ---------------------------------------------------------------------------
const simApps = {
    spendory: {
        name: 'Spendory',
        screen: 'images/apps/sp-home.webp',
        alt: 'Spendory home screen',
        what: 'An expense tracker that fills itself in.',
        role: 'My product. I built the Flutter app and the email parser behind it on Supabase.',
        status: 'Coming soon',
        live: false,
    },
    ajocard: {
        name: 'AjoCard',
        screen: 'images/apps/aj-home.webp',
        alt: 'AjoCard home screen',
        what: 'A banking app for personal bankers who serve customers face to face.',
        role: 'Mobile engineer at AjoCard Limited.',
        status: 'Coming soon',
        live: false,
    },
    savesimple: {
        name: 'Save Simple',
        screen: 'images/apps/ss-home.webp',
        alt: 'Save Simple home screen',
        what: 'Lending for personal bankers, from onboarding to repayment.',
        role: 'Mobile engineer at AjoCard Limited.',
        status: 'Coming soon',
        live: false,
    },
    contree: {
        name: 'Contree',
        screen: 'images/apps/contree-1.webp',
        alt: 'Contree group screen',
        what: 'Group contributions with a clear record for everyone in the group.',
        role: 'Founding mobile engineer. I built the whole app, from the first commit to both stores.',
        status: 'Live',
        live: true,
    },
    tellerone: {
        name: 'TellerOne',
        screen: 'images/apps/tellerone-1.webp',
        alt: 'TellerOne home screen',
        what: 'A multi-currency digital bank with cards, savings goals and overdrafts.',
        role: 'Flutter developer. I built transfers, onboarding and transaction history.',
        status: 'Live',
        live: true,
    },
    ijot: {
        name: 'iJot',
        screen: 'images/apps/ijot-1.webp',
        alt: 'iJot notes list',
        what: 'Notes that work offline and sync the moment you’re back online.',
        role: 'My product.',
        status: 'Live',
        live: true,
    },
};

const tabs = [...document.querySelectorAll('.sim-tabs [role="tab"]')];
const simPanel = document.getElementById('sim-panel');
const sim = Object.fromEntries([...document.querySelectorAll('[data-sim]')].map((el) => [el.dataset.sim, el]));

// Warm the cache so switching apps never waits on the network
window.addEventListener('load', () => {
    Object.values(simApps).forEach((app) => {
        const img = new Image();
        img.src = app.screen;
    });
});

function selectApp(tab) {
    const app = simApps[tab.dataset.app];
    tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
    });
    simPanel.setAttribute('aria-labelledby', tab.id);

    sim.name.textContent = app.name;
    sim.what.textContent = app.what;
    sim.role.textContent = app.role;
    sim.status.textContent = app.status;
    sim.status.classList.toggle('status-live', app.live);

    const screen = sim.screen;
    if (reducedMotion) {
        screen.src = app.screen;
        screen.alt = app.alt;
        return;
    }
    // Crossfade: fade out, swap once the new screen has loaded, fade back in
    screen.classList.add('is-swapping');
    setTimeout(() => {
        screen.onload = () => screen.classList.remove('is-swapping');
        screen.src = app.screen;
        screen.alt = app.alt;
        if (screen.complete) screen.classList.remove('is-swapping');
    }, 200);
}

// Fade the tab row's edge while more tabs sit off-screen
const tabList = document.querySelector('.sim-tabs');
const markMore = () => {
    tabList.classList.toggle('has-more', tabList.scrollLeft + tabList.clientWidth < tabList.scrollWidth - 4);
};
tabList.addEventListener('scroll', markMore, { passive: true });
window.addEventListener('resize', markMore);
markMore();

tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectApp(tab));
    // Arrow keys move between tabs, as in any tab list
    tab.addEventListener('keydown', (e) => {
        const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        let next;
        if (step) next = tabs[(i + step + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        next.focus();
        next.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        selectApp(next);
    });
});

// ---------------------------------------------------------------------------
// Release board: one row open at a time, Spendory first
// ---------------------------------------------------------------------------
const releases = [...document.querySelectorAll('.release')];

function setOpen(release, open) {
    const toggle = release.querySelector('.release-toggle');
    const detail = document.getElementById(toggle.getAttribute('aria-controls'));
    toggle.setAttribute('aria-expanded', String(open));
    detail.hidden = !open;
    release.classList.toggle('is-open', open);
}

releases.forEach((release, i) => {
    setOpen(release, i === 0);
    release.querySelector('.release-toggle').addEventListener('click', () => {
        const opening = !release.classList.contains('is-open');
        releases.forEach((r) => setOpen(r, r === release && opening));
    });
});

// ---------------------------------------------------------------------------
// Contact: the time in Lagos, and an email address you can copy
// ---------------------------------------------------------------------------
const clock = document.querySelector('[data-clock]');
if (clock) {
    const lagosTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });
    const tick = () => {
        clock.textContent = `It’s ${lagosTime.format(new Date())} now.`;
    };
    tick();
    setInterval(tick, 15000);
}

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
        reset = setTimeout(() => {
            copyButton.textContent = 'Copy email';
        }, 2000);
    });
}
