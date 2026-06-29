const Navigation = {
    sections: [],
    currentSection: null,

    init(sections) {
        this.sections = sections;
        this.renderSidebar();
        this.setupMobileMenu();
        this.setupScrollSpy();
    },

    renderSidebar() {
        const sidebar = document.getElementById('sidebar-nav');
        if (!sidebar) return;

        const groups = {};
        this.sections.forEach(s => {
            const group = s.group || 'General';
            if (!groups[group]) groups[group] = [];
            groups[group].push(s);
        });

        sidebar.innerHTML = Object.entries(groups).map(([group, items]) => `
            <div class="sidebar__section">
                <div class="sidebar__heading">${group}</div>
                <nav class="sidebar__nav">
                    ${items.map(item => `
                        <a href="#${item.id}" class="sidebar__link" data-section="${item.id}">
                            ${item.icon ? `<span class="sidebar__link-icon">${item.icon}</span>` : ''}
                            ${item.title}
                        </a>
                        ${item.subsections ? `
                            <div class="sidebar__subnav">
                                ${item.subsections.map(sub => `
                                    <a href="#${sub.id}" class="sidebar__sublink" data-section="${sub.id}">${sub.title}</a>
                                `).join('')}
                            </div>
                        ` : ''}
                    `).join('')}
                </nav>
            </div>
        `).join('');

        sidebar.querySelectorAll('.sidebar__link, .sidebar__sublink').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    // this.closeMobileMenu();
                }
            });
        });
    },

    setupMobileMenu() {
        const toggle = document.querySelector('.navbar__menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.overlay');
        const isMobile = () => window.innerWidth <= 1024;

        if (toggle) {
            toggle.addEventListener('click', (e) => {
                console.log("Que fue");
                const isOpen = sidebar.classList.toggle('open');
                if (isMobile()) {
                    overlay.classList.toggle('visible', isOpen);
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (!e.target.closest('.sidebar')) {
                    console.log("mira marico me di click");
                    this.closeMobileMenu();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeMobileMenu();
        });
    },

    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.overlay');

        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
    },

    setupScrollSpy() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActive(entry.target.id);
                }
            });
        }, {
            rootMargin: '-80px 0px -70% 0px',
            threshold: 0
        });

        document.querySelectorAll('[data-section-id]').forEach(el => {
            observer.observe(el);
        });
    },

    setActive(sectionId) {
        if (this.currentSection === sectionId) return;
        this.currentSection = sectionId;

        document.querySelectorAll('.sidebar__link, .sidebar__sublink').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
        });

        const activeLink = document.querySelector(`.sidebar__link[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    },

    scrollToSection(id) {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
};
