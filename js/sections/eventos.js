export const eventos = Object.assign(function() {
    return `
        <div class="hero">
            <span class="badge badge--primary hero__badge">Referencia</span>
            <h1 class="hero__title">Eventos</h1>
            <p class="hero__desc">Sistema de eventos personalizado para interactuar con el componente.</p>
        </div>

        <div class="doc">
            <h2 id="events-list">Lista de Eventos</h2>

            <table class="doc-table">
                <thead>
                    <tr><th>Evento</th><th>Cuándo se emite</th><th>Datos</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>init</code></td><td>Al inicializar el componente</td><td><code>{ searchTerm, itemsPerPage, procesServer }</code></td></tr>
                    <tr><td><code>search</code></td><td>Al realizar una búsqueda</td><td><code>{ searchTerm, results, totalResults, timestamp }</code></td></tr>
                    <tr><td><code>pageChange</code></td><td>Al cambiar de página</td><td><code>{ page, totalPages, itemsOnPage, totalLoaded }</code></td></tr>
                    <tr><td><code>sortChange</code></td><td>Al cambiar el ordenamiento</td><td><code>{ field, order }</code></td></tr>
                    <tr><td><code>itemSelected</code></td><td>Al seleccionar un item</td><td><code>{ item, index }</code></td></tr>
                    <tr><td><code>itemHighlighted</code></td><td>Al destacar item con teclado</td><td><code>{ item, index }</code></td></tr>
                    <tr><td><code>appendItems</code></td><td>Al añadir items al DOM</td><td><code>{ items, content }</code></td></tr>
                    <tr><td><code>destroy</code></td><td>Al destruir la instancia</td><td><code>{ timestamp }</code></td></tr>
                    <tr><td><code>error</code></td><td>Al ocurrir un error</td><td><code>{ code, message, solution }</code></td></tr>
                </tbody>
            </table>

            <h2 id="usage">Uso de Eventos</h2>

            ${codeBlock('javascript', `const search = new Search({
    element: '.app-search',
    data: [/* datos */]
});

search.on('init', (data) => {
    console.log('Componente inicializado:', data);
});

search.on('search', (data) => {
    console.log('Búsqueda:', data.searchTerm);
    console.log('Resultados:', data.totalResults);
});

search.on('pageChange', (data) => {
    console.log('Página:', data.page, 'de', data.totalPages);
});

search.on('itemSelected', (data) => {
    console.log('Seleccionado:', data.item);
});

search.on('error', (data) => {
    console.error('Error:', data.code, data.message);
});

search.init();`)}

            <h2 id="remove">Remover Listeners</h2>

            ${codeBlock('javascript', `// Con el objeto retornado por on()
const listener = search.on('search', (data) => {
    console.log('Búsqueda:', data);
});
listener.off();  // Remover este listener

// Remover todos los listeners de un evento
search.events.removeAllListeners('search');

// Remover todos los listeners
search.events.removeAllListeners();`)}

            <h2 id="once">Listener de Una Sola Vez</h2>

            ${codeBlock('javascript', `search.events.once('init', (data) => {
    console.log('Solo se ejecuta una vez:', data);
});`)}

            <h2 id="info">Información de Listeners</h2>

            ${codeBlock('javascript', `// Cantidad de listeners de un evento
const count = search.events.listenerCount('search');

// Nombres de todos los eventos registrados
const names = search.events.eventNames();`)}

            <div class="page-nav">
                <a href="#api" class="page-nav__link">
                    <span class="page-nav__label">&larr; Anterior</span>
                    <span class="page-nav__title">API y Métodos</span>
                </a>
                <a href="#templates" class="page-nav__link page-nav__link--next">
                    <span class="page-nav__label">Siguiente &rarr;</span>
                    <span class="page-nav__title">Templates</span>
                </a>
            </div>
        </div>
    `;
}, {
    _nav: { id: 'eventos', title: 'Eventos', icon: '&#128227;', group: 'Referencia' },
    subsections: [
        { id: 'events-list', title: 'Lista de Eventos' },
        { id: 'usage', title: 'Uso' },
        { id: 'remove', title: 'Remover Listeners' },
    ]
});
