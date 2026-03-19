const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
const themeToggle = document.getElementById('theme-toggle');
const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
const THEME_PREFERENCE_KEY = 'theme-preference';

const getSystemTheme = () => (themeMediaQuery.matches ? 'dark' : 'light');
const getStoredPreference = () => localStorage.getItem(THEME_PREFERENCE_KEY);

const setTheme = (mode) => {
    const effectiveTheme = mode === 'dark' || mode === 'light' ? mode : getSystemTheme();
    const isDark = effectiveTheme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);

    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
};

if (themeToggle) {
    const initialPreference = getStoredPreference() ?? 'system';
    setTheme(initialPreference);

    themeToggle.addEventListener('click', () => {
        const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem(THEME_PREFERENCE_KEY, nextTheme);
    });

    themeMediaQuery.addEventListener('change', () => {
        if (!getStoredPreference()) {
            setTheme('system');
        }
    });
}

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.toggle('hidden');
        mobileMenuButton.setAttribute('aria-expanded', String(!isHidden));
    });

    mobileMenuLinks.forEach((link) => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
        });
    });
}

const siteNav = document.getElementById('site-nav');

if (siteNav) {
    const toggleNavScrolledState = () => {
        siteNav.classList.toggle('is-scrolled', window.scrollY > 12);
    };

    toggleNavScrolledState();
    window.addEventListener('scroll', toggleNavScrolledState, { passive: true });
}

const contributionGrid = document.getElementById('contribution-grid');

if (contributionGrid) {
    for (let i = 0; i < 84; i++) {
        const cell = document.createElement('div');
        const intensity = Math.floor(Math.random() * 4);
        const colors = ['bg-slate-700', 'bg-emerald-900', 'bg-emerald-700', 'bg-emerald-500', 'bg-emerald-400'];
        cell.className = `w-full aspect-square rounded-sm ${colors[intensity]}`;
        contributionGrid.appendChild(cell);
    }
}

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
            formStatus.classList.remove('text-emerald-600');
            formStatus.classList.add('text-rose-600');
            formStatus.textContent = 'Please fill in all fields before sending your message.';
            return;
        }

        const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        window.location.href = `mailto:hello@juliusalibrown.com?subject=${subject}&body=${body}`;

        formStatus.classList.remove('hidden');
        formStatus.classList.remove('text-rose-600');
        formStatus.classList.add('text-emerald-600');
        formStatus.textContent = 'Opening your email client to send the message.';
    });
}
