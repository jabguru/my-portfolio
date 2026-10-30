// ---------------------------------------------------------------------------
// Entrances: each section's parts rise in once, staggered by 70ms
// ---------------------------------------------------------------------------
const revealItems = document.querySelectorAll('[data-reveal]');

if ('IntersectionObserver' in window) {
    // Stagger siblings that share a section
    document.querySelectorAll('section').forEach((section) => {
        section.querySelectorAll('[data-reveal]').forEach((el, i) => {
            el.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 70}ms`);
        });
    });

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                revealObserver.unobserve(entry.target);
            });
        },
        { rootMargin: '0px 0px -10% 0px' }
    );

    revealItems.forEach((el) => revealObserver.observe(el));
} else {
    revealItems.forEach((el) => el.classList.add('is-in'));
}

// ---------------------------------------------------------------------------
// Side projects: one open at a time, and the picture follows the open one
// ---------------------------------------------------------------------------
const projects = document.querySelectorAll('.projects-list details');
const media = document.querySelectorAll('.projects-media [data-media]');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

function showProject(details) {
    projects.forEach((d) => {
        if (d !== details) d.open = false;
    });
    details.open = true;
    media.forEach((m) => m.classList.toggle('is-active', m.dataset.media === details.dataset.project));
}

projects.forEach((details) => {
    details.addEventListener('toggle', () => {
        if (details.open) showProject(details);
    });

    // On desktop, pointing at a project is enough to bring it forward
    details.querySelector('summary').addEventListener('mouseenter', () => {
        if (canHover.matches && !details.open) showProject(details);
    });
});

// The Ghibli recording loads only once the list is on screen, and plays only while it's the open project
const projectVideos = document.querySelectorAll('.projects-media video[data-src]');

function syncVideos() {
    projectVideos.forEach((v) => {
        if (v.classList.contains('is-active')) {
            if (!v.src) v.src = v.dataset.src;
            v.play().catch(() => {});
        } else {
            v.pause();
        }
    });
}

if (projectVideos.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) syncVideos();
            else projectVideos.forEach((v) => v.pause());
        });
    });
    videoObserver.observe(document.querySelector('.projects-media'));
    projects.forEach((details) => details.addEventListener('toggle', syncVideos));
}
