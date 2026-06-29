export const api = Object.assign(function() {
    return `
        <div class="hero">
            <span class="badge badge--primary hero__badge">Referencia</span>
            <h1 class="hero__title">API y Métodos</h1>
            <p class="hero__desc">Referencia completa de todos los métodos públicos del componente Search.</p>
        </div>

        <div class="doc">
            <h2 id="init">init()</h2>
            <p>Inicializa el buscador y configura los elementos necesarios.</p>
            ${codeBlock('javascript', `search.init();`)}
            <p><strong>Retorna:</strong> Instancia de Search para encadenamiento.</p>
            <p><strong>Funcionamiento:</strong></p>
            <ul>
                <li>Valida que el contenedor exista en el DOM</li>
                <li>Extrae datos del DOM si es modo local</li>
                <li>Renderiza la estructura del DOM</li>
                <li>Aplica el tema CSS configurado</li>
                <li>Configura navegación por teclado si está habilitada</li>
                <li>Ejecuta búsqueda inicial</li>
                <li>Emite evento <code>init</code></li>
            </ul>

            <h2 id="draw">draw(searchTerm, isEvent)</h2>
            <p>Ejecuta una búsqueda y renderiza los resultados.</p>
            ${codeBlock('javascript', `await search.draw('venezuela', true);`)}
            <p><strong>Parámetros:</strong></p>
            <ul>
                <li><code>searchTerm</code> (string): Término de búsqueda (opcional)</li>
                <li><code>isEvent</code> (boolean): Si fue iniciado por evento del usuario (default: false)</li>
            </ul>
            <p><strong>Retorna:</strong> Promise&lt;Search&gt; para encadenamiento.</p>

            <h2 id="sort">sort(field, order)</h2>
            <p>Ordena los datos por un campo específico.</p>
            ${codeBlock('javascript', `search.sort('name', 'asc');`)}
            <p><strong>Parámetros:</strong></p>
            <ul>
                <li><code>field</code> (string): Campo por el cual ordenar</li>
                <li><code>order</code> (string): <code>'asc'</code> o <code>'desc'</code> (default: <code>'asc'</code>)</li>
            </ul>
            <p><strong>Retorna:</strong> Instancia de Search para encadenamiento.</p>

            <h2 id="clearSort">clearSort()</h2>
            <p>Elimina el orden actual y reinicia a orden natural.</p>
            ${codeBlock('javascript', `search.clearSort();`)}
            <p>Reinicia <code>sortBy</code> a null, <code>sortOrder</code> a 'asc', y limpia el caché.</p>

            <h2 id="on">on(eventName, callback)</h2>
            <p>Registra un listener para un evento.</p>
            ${codeBlock('javascript', `search.on('search', (data) => {
    console.log('Búsqueda:', data);
});`)}
            <p><strong>Retorna:</strong> Objeto con método <code>off()</code> para remover el listener.</p>

            <h2 id="showLoading">showLoading()</h2>
            <p>Muestra el indicador de carga en el contenedor de resultados.</p>
            ${codeBlock('javascript', `search.showLoading();`)}

            <h2 id="getCacheKey">getCacheKey(searchTerm, page)</h2>
            <p>Genera una clave única para el caché.</p>
            ${codeBlock('javascript', `const key = search.getCacheKey('venezuela', 1);
// Retorna: 'venezuela_1'`)}

            <h2 id="clearCacheByPrefix">cache.clearCacheByPrefix(prefix)</h2>
            <p>Limpia el caché por prefijo de búsqueda.</p>
            ${codeBlock('javascript', `search.cache.clearCacheByPrefix('venezuela');`)}

            <h2 id="setupKeyboard">setupKeyboardNavigation()</h2>
            <p>Configura la navegación por teclado (ArrowUp, ArrowDown, Enter).</p>
            ${codeBlock('javascript', `search.setupKeyboardNavigation();`)}

            <h2 id="destroy">destroy()</h2>
            <p>Destruye la instancia, limpiando recursos y event listeners.</p>
            ${codeBlock('javascript', `search.destroy();`)}
            <p><strong>Funcionamiento:</strong></p>
            <ul>
                <li>Emite evento <code>destroy</code></li>
                <li>Limpia IntersectionObserver</li>
                <li>Limpia timeouts de animación</li>
                <li>Remueve event listeners del input</li>
                <li>No elimina el HTML del DOM</li>
            </ul>

            <hr>

            <h2 id="pagination-methods">Métodos de Paginación</h2>

            <table class="doc-table">
                <thead>
                    <tr><th>Método</th><th>Retorna</th><th>Descripción</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>pagination.prevPage()</code></td><td>number</td><td>Retrocede una página</td></tr>
                    <tr><td><code>pagination.goToPage(page)</code></td><td>number</td><td>Ve a una página específica</td></tr>
                    <tr><td><code>pagination.firstPage()</code></td><td>number</td><td>Ve a la primera página</td></tr>
                    <tr><td><code>pagination.lastPage()</code></td><td>number</td><td>Ve a la última página</td></tr>
                    <tr><td><code>pagination.getCurrentPage()</code></td><td>number</td><td>Retorna la página actual</td></tr>
                    <tr><td><code>pagination.getPageItems(data?)</code></td><td>Array</td><td>Items de la página actual</td></tr>
                    <tr><td><code>pagination.setItemsPerPage(n)</code></td><td>void</td><td>Cambia items por página</td></tr>
                </tbody>
            </table>

            <div class="page-nav">
                <a href="#estructura-html" class="page-nav__link">
                    <span class="page-nav__label">&larr; Anterior</span>
                    <span class="page-nav__title">Estructura HTML</span>
                </a>
                <a href="#eventos" class="page-nav__link page-nav__link--next">
                    <span class="page-nav__label">Siguiente &rarr;</span>
                    <span class="page-nav__title">Eventos</span>
                </a>
            </div>
        </div>
    `;
}, {
    _nav: { id: 'api', title: 'API y Métodos', icon: '&#128218;', group: 'Referencia' }
});
