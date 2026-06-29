export const configuracion = Object.assign(function() {
    return `
        <div class="hero">
            <span class="badge badge--primary hero__badge">Guía</span>
            <h1 class="hero__title">Configuración</h1>
            <p class="hero__desc">Todos los parámetros disponibles para personalizar el componente Search.</p>
        </div>

        <div class="doc">
            <h2 id="parametros">Parámetros del Constructor</h2>

            ${codeBlock('typescript', `const search = new Search({
    // Requerido
    element: '.app-search',

    // Tema
    theme: 'default',

    // Datos y búsqueda
    data: [],
    procesServer: false,
    searchTerm: '',

    // Paginación
    itemsPerPage: 10,

    // Performance
    debounceTime: 500,

    // Caché
    cacheEnabled: false,
    cacheMaxSize: 50,
    cacheTtlSeconds: 300,

    // Ordenamiento
    sortBy: null,
    sortOrder: 'asc',

    // UI/UX
    keyboardEnabled: false,
    zIndex: 1000,
    dom: 'scip',
    template: null,
    translation: {},

    // Desarrollo
    developmentMode: true,

    // Fetch API (modo servidor)
    fetch: {
        url: '',
        method: 'POST',
        headers: {},
        body: {},
        timeout: 30000,
        success: () => {},
        error: () => {}
    }
});`)}

            <h2 id="param-table">Tabla de Parámetros</h2>

            <table class="doc-table">
                <thead>
                    <tr><th>Parámetro</th><th>Tipo</th><th>Default</th><th>Descripción</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>element</code></td><td>String</td><td>—</td><td>Selector CSS del contenedor <span class="badge badge--warning">Requerido</span></td></tr>
                    <tr><td><code>theme</code></td><td>String</td><td><code>"default"</code></td><td>Tema CSS: <code>default</code>, <code>clean-white</code>, <code>blue-black</code>, <code>onyx-black</code>, <code>forest-green</code></td></tr>
                    <tr><td><code>data</code></td><td>Array</td><td><code>[]</code></td><td>Array de objetos para búsqueda local</td></tr>
                    <tr><td><code>procesServer</code></td><td>Boolean</td><td><code>false</code></td><td>Habilita búsqueda por servidor (AJAX)</td></tr>
                    <tr><td><code>searchTerm</code></td><td>String</td><td><code>""</code></td><td>Término de búsqueda inicial</td></tr>
                    <tr><td><code>itemsPerPage</code></td><td>Number</td><td><code>10</code></td><td>Cantidad de items por página</td></tr>
                    <tr><td><code>debounceTime</code></td><td>Number</td><td><code>500</code></td><td>Tiempo de debounce en ms</td></tr>
                    <tr><td><code>cacheEnabled</code></td><td>Boolean</td><td><code>false</code></td><td>Habilita caché LRU</td></tr>
                    <tr><td><code>cacheMaxSize</code></td><td>Number</td><td><code>50</code></td><td>Tamaño máximo del caché</td></tr>
                    <tr><td><code>cacheTtlSeconds</code></td><td>Number</td><td><code>300</code></td><td>TTL del caché en segundos</td></tr>
                    <tr><td><code>keyboardEnabled</code></td><td>Boolean</td><td><code>false</code></td><td>Habilita navegación por teclado</td></tr>
                    <tr><td><code>sortBy</code></td><td>String</td><td><code>null</code></td><td>Campo para ordenamiento</td></tr>
                    <tr><td><code>sortOrder</code></td><td>String</td><td><code>"asc"</code></td><td>Orden: <code>asc</code> o <code>desc</code></td></tr>
                    <tr><td><code>zIndex</code></td><td>Number</td><td><code>1000</code></td><td>z-index del componente</td></tr>
                    <tr><td><code>dom</code></td><td>String</td><td><code>"scip"</code></td><td>Orden de renderizado (s=search, c=content, i=items, p=pagination)</td></tr>
                    <tr><td><code>template</code></td><td>String/Function</td><td><code>null</code></td><td>Template personalizado para items</td></tr>
                    <tr><td><code>translation</code></td><td>Object</td><td><code>{}</code></td><td>Traducciones personalizadas</td></tr>
                    <tr><td><code>developmentMode</code></td><td>Boolean</td><td><code>true</code></td><td>Modo desarrollo con logs detallados</td></tr>
                    <tr><td><code>fetch</code></td><td>Object</td><td><code>{}</code></td><td>Configuración Fetch API (solo si <code>procesServer: true</code>)</td></tr>
                </tbody>
            </table>

            <h2 id="fetch">Configuración del Objeto <code>fetch</code></h2>

            ${codeBlock('typescript', `fetch: {
    url: "./src/php/responseAjax.php",  // URL del endpoint (requerido)
    method: "POST",                      // GET, POST, PUT, DELETE, PATCH
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: {
        page: 1,
        searchTerm: "",
        itemsPerPage: 10
    },
    timeout: 30000,                      // Timeout en ms (default: 30s)
    success: (resp, instance) => {
        console.log('Respuesta:', resp);
    },
    error: (err) => {
        console.error('Error:', err);
    }
}`)}

            <h3>Content-Type Soportados</h3>

            <table class="doc-table">
                <thead>
                    <tr><th>Tipo</th><th>Formato del body</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>application/json</code></td><td><code>JSON.stringify(data)</code></td></tr>
                    <tr><td><code>application/x-www-form-urlencoded</code></td><td><code>{ key: value }</code> (objeto)</td></tr>
                    <tr><td><code>multipart/form-data</code></td><td><code>FormData</code></td></tr>
                </tbody>
            </table>

            <h2 id="dom-order">Código de Orden DOM</h2>

            <p>El parámetro <code>dom</code> controla el orden de renderizado de los elementos:</p>

            <table class="doc-table">
                <thead>
                    <tr><th>Código</th><th>Elemento</th><th>Descripción</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>s</code></td><td>Search</td><td>Contenedor del input de búsqueda</td></tr>
                    <tr><td><code>c</code></td><td>Content</td><td>Wrapper de items + paginación</td></tr>
                    <tr><td><code>i</code></td><td>Items</td><td>Lista <code>&lt;ul&gt;</code> de resultados</td></tr>
                    <tr><td><code>p</code></td><td>Pagination</td><td>Contador de paginación</td></tr>
                </tbody>
            </table>

            <p>Ejemplo: <code>'scip'</code> renderiza search + content como hermanos, items + pagination como hijos dentro de content.</p>

            <div class="page-nav">
                <a href="#instalacion" class="page-nav__link">
                    <span class="page-nav__label">&larr; Anterior</span>
                    <span class="page-nav__title">Instalación</span>
                </a>
                <a href="#estructura-html" class="page-nav__link page-nav__link--next">
                    <span class="page-nav__label">Siguiente &rarr;</span>
                    <span class="page-nav__title">Estructura HTML</span>
                </a>
            </div>
        </div>
    `;
}, {
    _nav: { id: 'configuracion', title: 'Configuración', icon: '&#9881;', group: 'Guía' }
});
