import DocSearch from './search.js';

const Navigation = {
    sidebar: null,
    overlay: null,
    menuBtn: null,
    searchBtn: null,
    searchContainer: null,
    isOpen: false,
    isSearchOpen: false,
    mediaQuery: null,

    init() {
        this.sidebar = document.getElementById('doc-sidebar');
        this.overlay = document.getElementById('sidebar-overlay');
        this.menuBtn = document.getElementById('menu-toggle');
        this.searchBtn = document.getElementById('search-toggle');
        this.searchContainer = document.getElementById('doc-search-container');

        if (!this.sidebar || !this.overlay || !this.menuBtn) return;

        if (this.searchBtn && this.searchContainer) {
            this.bindSearchEvents();
        }

        this.mediaQuery = window.matchMedia('(max-width: 768px)');

        this.bindEvents();
        this.handleMediaChange();

        this.mediaQuery.addEventListener('change', () => this.handleMediaChange());
    },

    bindEvents() {
        this.menuBtn.addEventListener('click', () => this.toggle());

        this.overlay.addEventListener('click', () => {
            this.close();
            if (this.isSearchOpen) {
                this.closeSearch();
            }
        });

        // Cerrar búsqueda al hacer clic fuera del header
        document.addEventListener('click', (e) => {
            if (!this.isSearchOpen) return;
            const header = document.querySelector('.doc-header');
            if (header && !header.contains(e.target)) {
                this.closeSearch();
            }
        });

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
            if (e.key === 'Escape' && this.isSearchOpen) {
                this.closeSearch();
            }
        });
    },

    bindSearchEvents() {
        this.searchBtn.addEventListener('click', () => {
            if (this.isSearchOpen) {
                this.closeSearch();
            } else {
                this.openSearch();
            }
        });

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (this.isSearchOpen) {
                    this.closeSearch();
                } else {
                    this.openSearch();
                }
            }
        });
    },

    openSearch() {
        this.isSearchOpen = true;
        this.searchBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        this.searchBtn.classList.add('active');

        // Add search-open class to parent container
        const headerCenter = this.searchContainer?.parentElement;
        if (headerCenter) {
            headerCenter.classList.add('search-open');
        }

        // Initialize search component when container becomes visible
        DocSearch.ensureInitialized();

        this.focusSearchInput();

        // Close sidebar if open
        if (this.isOpen) {
            this.close();
        }
    },

    closeSearch() {
        this.isSearchOpen = false;
        this.searchBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        this.searchBtn.classList.remove('active');

        // Remove search-open class from parent container
        const headerCenter = this.searchContainer?.parentElement;
        if (headerCenter) {
            headerCenter.classList.remove('search-open');
        }

        this.clearFocus();

        // Close any open search results
        if (this.searchContainer) {
            const results = this.searchContainer.querySelector('.app-search .content-pagination-items');
            if (results) {
                results.classList.remove('content-pagination-visible');
            }
        }
    },

    focusSearchInput() {
        setTimeout(() => {
            const input = this.searchContainer?.querySelector('.app-search input');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);
    },

    clearFocus() {
        setTimeout(() => {
            const activeEl = document.activeElement;
            if (activeEl && activeEl.blur) {
                activeEl.blur();
            }
        }, 0);
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
