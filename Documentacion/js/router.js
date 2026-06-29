const Router = {
    sections: new Map(),

    register(id, renderFn) {
        this.sections.set(id, renderFn);
    },

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'inicio';
        const [sectionId, anchor] = hash.split('/');
        this.render(sectionId, anchor);
    },

    render(sectionId, anchor) {
        const content = document.getElementById('doc-content');
        if (!content) return;

        const renderFn = this.sections.get(sectionId);
        if (renderFn) {
            content.innerHTML = renderFn();
            content.classList.remove('doc-content--fade-in');
            void content.offsetWidth;
            content.classList.add('doc-content--fade-in');
            Navigation.setActive(sectionId);
            this.highlightCode(content);

            if (anchor) {
                setTimeout(() => {
                    const target = document.getElementById(anchor);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }, 50);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            content.innerHTML = this.render404(sectionId);
        }
    },

    highlightCode(container) {
        container.querySelectorAll('pre code').forEach(block => {
            if (block.dataset.highlighted) return;
            block.dataset.highlighted = 'true';
            const text = block.textContent;
            const lang = block.className.match(/language-(\w+)/)?.[1] || '';
            block.innerHTML = this.syntaxHighlight(text, lang);
        });
    },

    syntaxHighlight(code, lang) {
        let s = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        const PH = [];
        let pi = 0;
        function save(cls, text) {
            const id = pi++;
            PH[id] = '<span class="' + cls + '">' + text + '</span>';
            return '\uFFFD' + String.fromCharCode(0x250 + id);
        }

        if (lang === 'html') {
            s = s.replace(/(<!--[\s\S]*?-->)/gm, function(m) { return save('token comment', m); });
            s = s.replace(/(&lt;\/?)([\w-]+)/g, function(m, br, tag) { return br + save('token tag', tag); });
            s = s.replace(/([\w-]+)(?==)/g, function(m) { return save('token attr-name', m); });
            s = s.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, function(m) { return save('token string', m); });
        } else if (lang === 'css') {
            s = s.replace(/(\/\*[\s\S]*?\*\/)/gm, function(m) { return save('token comment', m); });
            s = s.replace(/([\.\#][\w-]+)(?=\s*\{)/g, function(m) { return save('token selector', m); });
            s = s.replace(/([\w-]+)(?=\s*:)/g, function(m) { return save('token property', m); });
            s = s.replace(/(#[0-9a-fA-F]{3,8})\b/g, function(m) { return save('token number', m); });
        } else if (lang === 'json') {
            s = s.replace(/"((?:[^"\\]|\\.)*)"\s*:/g, function(m, k) { return save('token property', '"' + k + '"') + ':'; });
            s = s.replace(/:\s*"((?:[^"\\]|\\.)*)"/g, function(m, v) { return ': ' + save('token string', '"' + v + '"'); });
            s = s.replace(/\b(true|false|null)\b/g, function(m) { return save('token boolean', m); });
            s = s.replace(/\b(\d+\.?\d*)\b/g, function(m) { return save('token number', m); });
        } else if (lang === 'php') {
            s = s.replace(/(\/\/.*$|#.*$)/gm, function(m) { return save('token comment', m); });
            s = s.replace(/(\/\*[\s\S]*?\*\/)/gm, function(m) { return save('token comment', m); });
            s = s.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g, function(m) { return save('token string', m); });
            s = s.replace(/\b(if|else|elseif|while|for|foreach|return|require|require_once|include|include_once|echo|array|function|class|new|public|private|protected|static)\b/g, function(m) { return save('token keyword', m); });
            s = s.replace(/(\$[\w]+)/g, function(m) { return save('token variable', m); });
            s = s.replace(/(\w+)(?=\s*\()/g, function(m) { return save('token function', m); });
        } else if (lang === 'bash') {
            s = s.replace(/(#.*$)/gm, function(m) { return save('token comment', m); });
            s = s.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g, function(m) { return save('token string', m); });
            s = s.replace(/\b(npm|pnpm|yarn|git|cd|mkdir|install|run|build|test|node|npx)\b/g, function(m) { return save('token keyword', m); });
        } else if (lang === 'text') {
            // no highlighting
        } else {
            // javascript / typescript / default
            s = s.replace(/(\/\/.*$)/gm, function(m) { return save('token comment', m); });
            s = s.replace(/(\/\*[\s\S]*?\*\/)/gm, function(m) { return save('token comment', m); });
            s = s.replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g, function(m) { return save('token string', m); });
            var kw = 'const|let|var|function|async|await|return|if|else|new|import|from|export|default|class|extends|this|try|catch|throw|typeof|instanceof|of|in|interface|type|string|number|boolean|void|any|as|Record|Partial|Required';
            s = s.replace(new RegExp('\\b(' + kw + ')\\b', 'g'), function(m) { return save('token keyword', m); });
            s = s.replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, function(m) { return save('token boolean', m); });
            s = s.replace(/\b(\d+\.?\d*)\b/g, function(m) { return save('token number', m); });
            s = s.replace(/(=&gt;|===|!==|==|!=|&&|\|\||\.\.\.|=>|\.\.)/g, function(m) { return save('token operator', m); });
            s = s.replace(/(\w+)(?=\s*\()/g, function(m) { return save('token function', m); });
        }

        for (var i = 0; i < PH.length; i++) {
            if (PH[i]) {
                s = s.replace('\uFFFD' + String.fromCharCode(0x250 + i), PH[i]);
            }
        }

        return s;
    },

    render404(sectionId) {
        return `
            <div class="hero">
                <h1 class="hero__title">404</h1>
                <p class="hero__desc">La sección "${sectionId}" no fue encontrada.</p>
                <a href="#inicio" style="margin-top: var(--space-4); display: inline-flex;">Volver al inicio</a>
            </div>
        `;
    }
};
