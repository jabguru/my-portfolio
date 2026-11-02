// ---------------------------------------------------------------------------
// Hero: the size tag reports the photo's real rendered size, as debug paint does
// ---------------------------------------------------------------------------
const sizeTag = document.querySelector('[data-size]');
const photo = document.querySelector('.inspect-photo');
if (sizeTag && photo && 'ResizeObserver' in window) {
    new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        sizeTag.textContent = `${Math.round(width)} × ${Math.round(height)}`;
    }).observe(photo);
}

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
const lagos = document.querySelector('[data-lagos]');
if (clock || lagos) {
    const lagosTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' });
    const tick = () => {
        const now = lagosTime.format(new Date());
        if (clock) clock.textContent = `It’s ${now} now.`;
        if (lagos) lagos.textContent = `Lagos, ${now} now`;
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
