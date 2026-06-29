export const changelog = Object.assign(function() {
    return `
        <div class="hero">
            <span class="badge badge--primary hero__badge">General</span>
            <h1 class="hero__title">Changelog</h1>
            <p class="hero__desc">Historial de versiones y cambios del componente.</p>
        </div>

        <div class="doc">
            <h2 id="v210">v2.1.0 <span class="badge badge--success">Actual</span></h2>

            <h3>Nuevas características</h3>
            <ul>
                <li>Temas CSS predefinidos (clean-white, blue-black, onyx-black, forest-green)</li>
                <li>Propiedad <code>theme</code> para seleccionar tema desde configuración</li>
                <li>30+ variables CSS personalizables</li>
                <li>Métodos de paginación: <code>prevPage()</code>, <code>goToPage()</code>, <code>firstPage()</code>, <code>lastPage()</code>, <code>getCurrentPage()</code>, <code>getPageItems()</code>, <code>setItemsPerPage()</code></li>
                <li>Métodos de EventEmitter: <code>once()</code>, <code>removeAllListeners()</code>, <code>listenerCount()</code>, <code>eventNames()</code></li>
                <li>Build con Vite (ES Module + UMD)</li>
                <li>Tests unitarios con Jest</li>
                <li>Función helper <code>createElement</code></li>
                <li>Soporte para métodos HTTP: GET, POST, PUT, DELETE, PATCH</li>
                <li>Validación de Content-Type automática</li>
                <li>Soporte para <code>prefers-reduced-motion</code></li>
            </ul>

            <h3>Cambios</h3>
            <ul>
                <li><code>developmentMode</code> ahora es <code>true</code> por defecto</li>
                <li><code>cacheTtlSeconds</code> ahora es <code>300</code> segundos por defecto</li>
                <li>Códigos de error actualizados (SEARCH_001 a SEARCH_041)</li>
                <li>Estructura de archivos reorganizada con barrel exports</li>
                <li>CSS separado en 3 capas: core, theme, themes</li>
            </ul>

            <hr>

            <h2 id="v200">v2.0.0</h2>

            <h3>Nuevas características</h3>
            <ul>
                <li>Migración a TypeScript</li>
                <li>Migración de XMLHttpRequest a Fetch API</li>
                <li>Sistema de gestión de errores centralizado (ErrorHandler)</li>
                <li>Clases SearchingLocal y SearchingServer</li>
                <li>Scroll infinito con Intersection Observer</li>
                <li>Navegación por teclado</li>
                <li>Templates personalizados</li>
                <li>Internacionalización (i18n)</li>
                <li>Sistema de caché LRU con TTL</li>
                <li>Sistema de eventos mejorado</li>
                <li>Timeout configurable con AbortController</li>
            </ul>

            <h3>Breaking changes</h3>
            <ul>
                <li>Requiere TypeScript o transpilación</li>
                <li>XMLHttpRequest reemplazado por Fetch API</li>
                <li>Mixins reemplazados por clases</li>
                <li>Nueva estructura de archivos</li>
            </ul>

            <hr>

            <h2 id="v100">v1.0.0</h2>

            <h3>Características iniciales</h3>
            <ul>
                <li>Búsqueda local y por servidor</li>
                <li>Paginación</li>
                <li>XMLHttpRequest para AJAX</li>
                <li>Mixins para lógica de búsqueda</li>
                <li>Sistema de eventos básico</li>
            </ul>

            <div class="page-nav">
                <a href="#typescript" class="page-nav__link">
                    <span class="page-nav__label">&larr; Anterior</span>
                    <span class="page-nav__title">TypeScript</span>
                </a>
                <a href="#inicio" class="page-nav__link page-nav__link--next">
                    <span class="page-nav__label">Volver al inicio</span>
                    <span class="page-nav__title">Inicio</span>
                </a>
            </div>
        </div>
    `;
}, {
    _nav: { id: 'changelog', title: 'Changelog', icon: '&#128220;', group: 'General' }
});
