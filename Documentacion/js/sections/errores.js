export const errores = Object.assign(function() {
    return `
        <div class="hero">
            <span class="badge badge--primary hero__badge">Referencia</span>
            <h1 class="hero__title">Gestión de Errores</h1>
            <p class="hero__desc">ErrorHandler centralizado con códigos estandarizados y guías de solución.</p>
        </div>

        <div class="doc">
            <h2 id="error-codes">Códigos de Error</h2>

            <table class="doc-table">
                <thead>
                    <tr><th>Código</th><th>Descripción</th><th>Solución</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>SEARCH_001</code></td><td>El parámetro 'element' es requerido</td><td>Proporciona el selector CSS del contenedor</td></tr>
                    <tr><td><code>SEARCH_002</code></td><td>El parámetro 'element' debe ser un string</td><td>Usa un selector CSS válido</td></tr>
                    <tr><td><code>SEARCH_003</code></td><td>El parámetro 'fetch.url' es requerido</td><td>Configura la URL del endpoint</td></tr>
                    <tr><td><code>SEARCH_004</code></td><td>itemsPerPage debe ser un número</td><td>Configura itemsPerPage con un número</td></tr>
                    <tr><td><code>SEARCH_005</code></td><td>itemsPerPage debe ser mayor a 0</td><td>Configura itemsPerPage con un valor positivo</td></tr>
                    <tr><td><code>SEARCH_010</code></td><td>No existe el contenedor especificado</td><td>Verifica el selector CSS</td></tr>
                    <tr><td><code>SEARCH_011</code></td><td>No existe el contenedor de resultados</td><td>Verifica la estructura DOM</td></tr>
                    <tr><td><code>SEARCH_020</code></td><td>Error de conexión al servidor</td><td>Verifica tu conexión a internet</td></tr>
                    <tr><td><code>SEARCH_021</code></td><td>Error en la petición Fetch</td><td>Verifica URL, método HTTP y servidor</td></tr>
                    <tr><td><code>SEARCH_030</code></td><td>Formato de datos inválido</td><td>Verifica el formato de los datos</td></tr>
                    <tr><td><code>SEARCH_031</code></td><td>Respuesta vacía del servidor</td><td>Verifica que el servidor retorne datos</td></tr>
                    <tr><td><code>SEARCH_040</code></td><td>Error al inicializar</td><td>Revisa la configuración y el DOM</td></tr>
                    <tr><td><code>SEARCH_041</code></td><td>Error al renderizar</td><td>Verifica templates y DOM</td></tr>
                </tbody>
            </table>

            <h2 id="event-handling">Manejo con Eventos</h2>

            ${codeBlock('javascript', `search.on('error', (data) => {
    console.error('Código:', data.code);
    console.error('Mensaje:', data.message);
    console.error('Solución:', data.solution);
});`)}

            <h2 id="dev-mode">Modo Development vs Production</h2>

            ${codeBlock('javascript', `// Modo development: logs detallados
const search = new Search({
    element: '.app-search',
    developmentMode: true,
    data: [/* datos */]
});

// Modo production: sin logs
const search = new Search({
    element: '.app-search',
    developmentMode: false,
    data: [/* datos */]
});`)}

            <h2 id="try-catch">Manejo con try/catch</h2>

            ${codeBlock('javascript', `try {
    search.init();
} catch (error) {
    console.error('Error al inicializar:', error);
}`)}

            <div class="page-nav">
                <a href="#cache" class="page-nav__link">
                    <span class="page-nav__label">&larr; Anterior</span>
                    <span class="page-nav__title">Caché</span>
                </a>
                <a href="#css-themes" class="page-nav__link page-nav__link--next">
                    <span class="page-nav__label">Siguiente &rarr;</span>
                    <span class="page-nav__title">CSS y Themes</span>
                </a>
            </div>
        </div>
    `;
}, {
    _nav: { id: 'errores', title: 'Gestión de Errores', icon: '&#128737;', group: 'Referencia' }
});
