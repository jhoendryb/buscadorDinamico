const Theme = {
    STORAGE_KEY: 'docs-theme',

    init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved || (prefersDark ? 'dark' : 'light');
        this.apply(theme);

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                this.apply(e.matches ? 'dark' : 'light');
            }
        });

        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.addEventListener('click', () => this.toggle());
        });
    },

    apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.STORAGE_KEY, theme);
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        this.apply(current === 'dark' ? 'light' : 'dark');
    },

    get current() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
};
