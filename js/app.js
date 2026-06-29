document.addEventListener('DOMContentLoaded', () => {
    Theme.init();

    import('./sections/index.js')
        .then(mod => {
            const allSections = mod.default || mod;

            Object.entries(allSections).forEach(([id, renderFn]) => {
                Router.register(id, renderFn);
            });

            const navData = Object.keys(allSections).map(id => {
                const section = allSections[id];
                return section._nav || { id, title: id, group: 'General' };
            });

            Navigation.init(navData);
            Router.init();
            SearchDocs.init();
        })
        .catch(err => {
            console.error('Failed to load sections:', err);
        });
});

window.codeBlock = function codeBlock(lang, code) {
    const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return `
        <div class="code-block">
            <div class="code-block__header">
                <span class="code-block__lang">${lang}</span>
                <button class="code-block__copy" onclick="copyCode(this)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    Copiar
                </button>
            </div>
            <pre><code class="language-${lang}">${escaped}</code></pre>
        </div>
    `;
}

window.copyCode = function copyCode(btn) {
    const code = btn.closest('.code-block').querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Copiado
        `;
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                Copiar
            `;
        }, 2000);
    });
}
