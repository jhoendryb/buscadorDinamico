export const i18n = Object.assign(function() {
    return `
        <div class="hero">
            <span class="badge badge--primary hero__badge">Personalización</span>
            <h1 class="hero__title">Internacionalización (i18n)</h1>
            <p class="hero__desc">Configura textos personalizados en diferentes idiomas.</p>
        </div>

        <div class="doc">
            <h2 id="available">Traducciones Disponibles</h2>

            <table class="doc-table">
                <thead>
                    <tr><th>Clave</th><th>Default</th><th>Descripción</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>searchPlaceholder</code></td><td>"Ingrese palabra clave..."</td><td>Placeholder del input</td></tr>
                    <tr><td><code>searchLabel</code></td><td>"Filtrar por Búsqueda"</td><td>Label del input (aria-label)</td></tr>
                    <tr><td><code>noResults</code></td><td>"No se encontraron resultados"</td><td>Mensaje sin resultados</td></tr>
                    <tr><td><code>loading</code></td><td>"Buscando..."</td><td>Mensaje de carga</td></tr>
                </tbody>
            </table>

            <h2 id="custom">Traducciones Personalizadas</h2>

            ${codeBlock('javascript', `const search = new Search({
    element: '.app-search',
    translation: {
        searchPlaceholder: 'Escribe la búsqueda aquí...',
        searchLabel: 'Buscar',
        noResults: 'No hay resultados',
        loading: 'Cargando datos...'
    },
    data: [/* datos */]
});`)}

            <h2 id="defaults">Traducciones por Defecto</h2>

            ${codeBlock('typescript', `static #defaultTranslations = {
    searchLabel: "Filtrar por Búsqueda",
    searchPlaceholder: "Ingrese palabra clave...",
    noResults: "No se encontraron resultados",
    loading: "Buscando..."
};`)}

            <h2 id="example">Ejemplo Completo</h2>

            ${codeBlock('javascript', `const search = new Search({
    element: '.app-search',
    translation: {
        searchPlaceholder: 'Escribe la busqueda aqui.'
    },
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: { page: 1, searchTerm: "" }
    }
});`)}

            <div class="callout callout--info">
                <span class="callout__icon">&#8505;</span>
                <div class="callout__content">
                    <p>La interfaz <code>TranslationCache</code> permite agregar traducciones adicionales via index signature, así que puedes personalizar cualquier texto interno.</p>
                </div>
            </div>

            <div class="page-nav">
                <a href="#templates" class="page-nav__link">
                    <span class="page-nav__label">&larr; Anterior</span>
                    <span class="page-nav__title">Templates</span>
                </a>
                <a href="#cache" class="page-nav__link page-nav__link--next">
                    <span class="page-nav__label">Siguiente &rarr;</span>
                    <span class="page-nav__title">Caché</span>
                </a>
            </div>
        </div>
    `;
}, {
    _nav: { id: 'i18n', title: 'Internacionalización', icon: '&#127760;', group: 'Personalización' }
});
