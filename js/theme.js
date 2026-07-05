const Theme = {
    STORAGE_KEY: 'doc-theme',
    toggleBtn: null,
    mediaQuery: null,

    init() {
        this.toggleBtn = document.getElementById('theme-toggle');
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const saved = this.getSavedTheme();
        this.apply(saved);

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }

        this.mediaQuery.addEventListener('change', (e) => {
            if (!this.getSavedTheme() || this.getSavedTheme() === 'auto') {
                this.apply('auto');
            }
        });
    },

    getSavedTheme() {
        try {
            return localStorage.getItem(this.STORAGE_KEY) || 'auto';
        } catch {
            return 'auto';
        }
    },

    saveTheme(theme) {
        try {
            localStorage.setItem(this.STORAGE_KEY, theme);
        } catch {}
    },

    apply(theme) {
        if (theme === 'auto') {
            const prefersDark = this.mediaQuery.matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        this.saveTheme(next);
        this.apply(next);

        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
    },

    getCurrent() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
};

export default Theme;
