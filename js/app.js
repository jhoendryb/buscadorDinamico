import Router from './router.js';
import Navigation from './navigation.js';
import Theme from './theme.js';
import SearchIntegration from './search.js';

const App = {
    async init() {
        Theme.init();
        Navigation.init();
        Router.init();
        await SearchIntegration.init();

        this.setupThemeSync();
        this.setupNavigationSync();
        this.setupPreload();

        console.log('%c🔍 Buscador Dinámico Docs', 'font-size: 14px; font-weight: bold; color: #6366f1;');
        console.log('%cDocumentación v1.0.0', 'font-size: 11px; color: #878d9e;');
    },

    setupThemeSync() {
        window.addEventListener('themechange', () => {
            SearchIntegration.updateTheme();
        });
    },

    setupNavigationSync() {
        const originalUpdateActiveLink = Router.updateActiveLink.bind(Router);
        Router.updateActiveLink = (section) => {
            originalUpdateActiveLink(section);
            Navigation.setActive(section);
        };
    },

    setupPreload() {
        const links = document.querySelectorAll('.doc-sidebar__link');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const section = link.dataset.section;
                if (section) {
                    Router.preloadSection(section);
                }
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
