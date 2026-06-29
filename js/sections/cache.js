export const cache = Object.assign(function() {
    return `
        <div class="hero">
            <span class="badge badge--primary hero__badge">Personalización</span>
            <h1 class="hero__title">Sistema de Caché</h1>
            <p class="hero__desc">Caché LRU con TTL para optimizar el rendimiento de búsquedas repetidas.</p>
        </div>

        <div class="doc">
            <h2 id="how-works">Cómo Funciona</h2>

            <ul>
                <li><strong>LRU (Least Recently Used)</strong>: Elimina los items menos usados cuando se llena</li>
                <li><strong>TTL (Time To Live)</strong>: Expira items después de un tiempo configurable</li>
                <li><strong>Claves únicas</strong>: Cada búsqueda tiene una clave basada en término y página</li>
            </ul>

            <h2 id="config">Configuración</h2>

            ${codeBlock('javascript', `const search = new Search({
    element: '.app-search',
    cacheEnabled: true,
    cacheMaxSize: 50,       // Máximo 50 items en caché
    cacheTtlSeconds: 300,   // Expirar después de 300 segundos (5 min)
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: { page: 1, searchTerm: "" }
    }
});`)}

            <h2 id="methods">Métodos de Caché</h2>

            ${codeBlock('javascript', `// Generar clave única
const key = search.getCacheKey('venezuela', 1);
// Retorna: 'venezuela_1'

// Limpiar caché por prefijo
search.cache.clearCacheByPrefix('venezuela');`)}

            <h2 id="invalidation">Invalidación</h2>

            <p>El caché se invalida automáticamente cuando:</p>

            <ul>
                <li>Se llama a <code>clearSort()</code></li>
                <li>Expira el TTL</li>
                <li>Se llena el caché (política LRU)</li>
                <li>Manualmente con <code>cache.clearCacheByPrefix()</code></li>
            </ul>

            <h2 id="example">Ejemplo Completo</h2>

            ${codeBlock('javascript', `const search = new Search({
    element: '.app-search',
    cacheEnabled: true,
    cacheMaxSize: 100,
    cacheTtlSeconds: 300,  // 5 minutos
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: { page: 1, searchTerm: "" }
    }
});

// La primera búsqueda hace petición al servidor
await search.draw('venezuela');

// La segunda búsqueda con el mismo término usa caché
await search.draw('venezuela');

// Limpiar caché manualmente
search.cache.clearCacheByPrefix('venezuela');`)}

            <div class="page-nav">
                <a href="#i18n" class="page-nav__link">
                    <span class="page-nav__label">&larr; Anterior</span>
                    <span class="page-nav__title">Internacionalización</span>
                </a>
                <a href="#errores" class="page-nav__link page-nav__link--next">
                    <span class="page-nav__label">Siguiente &rarr;</span>
                    <span class="page-nav__title">Gestión de Errores</span>
                </a>
            </div>
        </div>
    `;
}, {
    _nav: { id: 'cache', title: 'Caché', icon: '&#9889;', group: 'Personalización' }
});
