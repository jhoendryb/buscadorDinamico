const Navigation = {
    sidebar: null,
    overlay: null,
    menuBtn: null,
    isOpen: false,
    mediaQuery: null,

    init() {
        this.sidebar = document.getElementById('doc-sidebar');
        this.overlay = document.getElementById('sidebar-overlay');
        this.menuBtn = document.getElementById('menu-toggle');

        if (!this.sidebar || !this.overlay || !this.menuBtn) return;

        this.mediaQuery = window.matchMedia('(max-width: 768px)');

        this.bindEvents();
        this.handleMediaChange();

        this.mediaQuery.addEventListener('change', () => this.handleMediaChange());
    },

    bindEvents() {
        this.menuBtn.addEventListener('click', () => this.toggle());

        this.overlay.addEventListener('click', () => this.close());

        this.sidebar.querySelectorAll('.doc-sidebar__link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (this.mediaQuery.matches) {
                    this.close();
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    handleMediaChange() {
        if (!this.mediaQuery.matches) {
            this.close();
            this.sidebar.classList.remove('open');
            this.overlay.classList.remove('visible');
            document.body.style.overflow = '';
        }
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        if (this.isOpen) return;
        this.isOpen = true;

        this.sidebar.classList.add('open');
        this.overlay.classList.add('visible');
        this.menuBtn.classList.add('active');
        document.body.style.overflow = 'hidden';

        this.menuBtn.setAttribute('aria-expanded', 'true');
        this.sidebar.setAttribute('aria-hidden', 'false');
    },

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;

        this.sidebar.classList.remove('open');
        this.overlay.classList.remove('visible');
        this.menuBtn.classList.remove('active');
        document.body.style.overflow = '';

        this.menuBtn.setAttribute('aria-expanded', 'false');
        this.sidebar.setAttribute('aria-hidden', 'true');
    },

    setActive(sectionName) {
        this.sidebar.querySelectorAll('.doc-sidebar__link').forEach(link => {
            const isActive = link.dataset.section === sectionName;
            link.classList.toggle('active', isActive);

            if (isActive && this.mediaQuery?.matches) {
                link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        });
    }
};

export default Navigation;
