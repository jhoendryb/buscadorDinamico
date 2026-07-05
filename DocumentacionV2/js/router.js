const Router = {
    sections: {},
    currentSection: null,
    contentEl: null,
    baseUrl: '',
    cache: new Map(),

    init() {
        this.contentEl = document.getElementById('doc-view');
        this.baseUrl = this.getBaseUrl();

        this.registerSections([
            'introduction', 'installation', 'configuration',
            'api', 'events', 'templates', 'i18n', 'cache',
            'errors', 'css-themes', 'examples', 'typescript', 'changelog'
        ]);

        window.addEventListener('hashchange', () => this.handleRoute());

        if (!window.location.hash || window.location.hash === '#/') {
            window.location.hash = '#/introduction';
        } else {
            this.handleRoute();
        }
    },

    getBaseUrl() {
        const path = window.location.pathname;
        const base = path.endsWith('/') ? path : path.substring(0, path.lastIndexOf('/') + 1);
        return base;
    },

    registerSections(names) {
        names.forEach(name => {
            this.sections[name] = {
                loaded: false,
                content: null
            };
        });
    },

    async handleRoute() {
        const hash = window.location.hash.replace('#/', '') || 'introduction';
        const section = hash.split('?')[0];

        if (!this.sections[section]) {
            this.renderNotFound(section);
            return;
        }

        if (this.currentSection === section) return;

        this.currentSection = section;
        await this.loadSection(section);
        this.updateActiveLink(section);
        this.updateDocumentTitle(section);
        this.scrollToTop();
    },

    async loadSection(name) {
        const section = this.sections[name];

        if (section.loaded && section.content) {
            this.renderContent(section.content);
            return;
        }

        this.renderLoading();

        try {
            const content = await this.fetchSection(name);
            section.content = content;
            section.loaded = true;
            this.renderContent(content);
        } catch (error) {
            console.error(`Error loading section: ${name}`, error);
            this.renderError(name, error);
        }
    },

    async fetchSection(name) {
        if (this.cache.has(name)) {
            return this.cache.get(name);
        }

        const url = `${this.baseUrl}sections/${name}.html`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        this.cache.set(name, html);
        return html;
    },

    renderContent(html) {
        if (!this.contentEl) return;
        this.contentEl.innerHTML = `<div class="doc-content__inner">${html}</div>`;
        this.processCodeBlocks();
        this.processCopyButtons();
        this.processAnchors();
    },

    renderLoading() {
        if (!this.contentEl) return;
        this.contentEl.innerHTML = `
            <div class="doc-loading">
                <div class="doc-spinner"></div>
                <p>Cargando sección...</p>
            </div>
        `;
    },

    renderNotFound(section) {
        if (!this.contentEl) return;
        this.contentEl.innerHTML = `
            <div class="doc-content__inner">
                <h1>404</h1>
                <p>La sección "<code>${section}</code>" no fue encontrada.</p>
                <a href="#/introduction">Volver al inicio</a>
            </div>
        `;
    },

    renderError(section, error) {
        if (!this.contentEl) return;
        this.contentEl.innerHTML = `
            <div class="doc-content__inner">
                <h1>Error al cargar</h1>
                <p>No se pudo cargar la sección "<code>${section}</code>".</p>
                <p><small>${error.message}</small></p>
                <a href="#/introduction">Volver al inicio</a>
            </div>
        `;
    },

    updateActiveLink(section) {
        document.querySelectorAll('.doc-sidebar__link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === section);
        });
    },

    updateDocumentTitle(section) {
        const titles = {
            introduction: 'Introducción',
            installation: 'Instalación',
            configuration: 'Configuración',
            api: 'API',
            events: 'Eventos',
            templates: 'Plantillas',
            i18n: 'Internacionalización',
            cache: 'Caché',
            errors: 'Errores',
            'css-themes': 'Temas CSS',
            examples: 'Ejemplos',
            typescript: 'TypeScript',
            changelog: 'Changelog'
        };
        const title = titles[section] || section;
        document.title = `${title} - Buscador Dinámico`;
    },

    scrollToTop() {
        const contentArea = document.querySelector('.doc-content');
        if (contentArea) {
            contentArea.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    processCodeBlocks() {
        document.querySelectorAll('.doc-content pre code').forEach(block => {
            block.innerHTML = this.highlightSyntax(block.textContent);
        });
    },

    highlightSyntax(code) {
        const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const KEYWORDS = /^(?:const|let|var|function|return|if|else|new|class|extends|import|export|from|default|async|await|try|catch|throw|this|typeof|instanceof|switch|case|break|continue|for|of|in|while|do|null|undefined|true|false|void|static|get|set|interface|type|enum|implements|abstract|private|protected|public|readonly|as|is|keyof|infer|declare|module|namespace|abstract|satisfies|using|asserts|override|accessor|out|in|readonly)$/;

        const tokens = [];
        let i = 0;

        while (i < code.length) {
            if (code[i] === '/' && code[i + 1] === '/') {
                let end = code.indexOf('\n', i);
                if (end === -1) end = code.length;
                tokens.push({ type: 'comment', value: code.slice(i, end) });
                i = end;
            } else if (code[i] === '/' && code[i + 1] === '*') {
                let end = code.indexOf('*/', i + 2);
                if (end === -1) end = code.length; else end += 2;
                tokens.push({ type: 'comment', value: code.slice(i, end) });
                i = end;
            } else if (code[i] === "'" || code[i] === '"' || code[i] === '`') {
                const q = code[i];
                let j = i + 1;
                while (j < code.length && code[j] !== q) {
                    if (code[j] === '\\') j++;
                    j++;
                }
                j = Math.min(j + 1, code.length);
                tokens.push({ type: 'string', value: code.slice(i, j) });
                i = j;
            } else if (/[a-zA-Z_$]/.test(code[i])) {
                let j = i;
                while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
                const word = code.slice(i, j);
                if (KEYWORDS.test(word)) {
                    tokens.push({ type: 'keyword', value: word });
                } else if (/^[A-Z]/.test(word)) {
                    tokens.push({ type: 'class-name', value: word });
                } else {
                    tokens.push({ type: 'plain', value: word });
                }
                i = j;
            } else if (/\d/.test(code[i])) {
                let j = i;
                while (j < code.length && /[\d.]/.test(code[j])) j++;
                tokens.push({ type: 'number', value: code.slice(i, j) });
                i = j;
            } else if (code[i] === '@') {
                let j = i + 1;
                while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
                tokens.push({ type: 'decorator', value: code.slice(i, j) });
                i = j;
            } else {
                tokens.push({ type: 'plain', value: code[i] });
                i++;
            }
        }

        return tokens.map(t => {
            const v = esc(t.value);
            if (t.type === 'plain') return v;
            return `<span class="${t.type}">${v}</span>`;
        }).join('');
    },

    processCopyButtons() {
        document.querySelectorAll('.doc-content pre').forEach(pre => {
            if (pre.querySelector('.copy-btn')) return;

            const btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.textContent = 'Copiar';
            btn.setAttribute('aria-label', 'Copiar código');

            btn.addEventListener('click', async () => {
                const code = pre.querySelector('code');
                const text = code ? code.textContent : pre.textContent;

                try {
                    await navigator.clipboard.writeText(text);
                    btn.textContent = '¡Copiado!';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.textContent = 'Copiar';
                        btn.classList.remove('copied');
                    }, 2000);
                } catch {
                    btn.textContent = 'Error';
                    setTimeout(() => { btn.textContent = 'Copiar'; }, 2000);
                }
            });

            pre.style.position = 'relative';
            pre.appendChild(btn);
        });
    },

    processAnchors() {
        document.querySelectorAll('.doc-content a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href.startsWith('#/')) {
                    return;
                }
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    },

    preloadSection(name) {
        if (this.sections[name] && !this.sections[name].loaded) {
            this.fetchSection(name).catch(() => {});
        }
    }
};

export default Router;
