export const ejemplos = Object.assign(function() {
    return `
        <div class="hero">
            <span class="badge badge--primary hero__badge">Guía</span>
            <h1 class="hero__title">Ejemplos Completos</h1>
            <p class="hero__desc">Ejemplos prácticos para diferentes casos de uso del componente.</p>
        </div>

        <div class="doc">
            <h2 id="local-simple">1. Búsqueda Local Simple</h2>

            ${codeBlock('html', `<div class="app-search"></div>

<script type="module">
import { Search } from './src/js/main';

const search = new Search({
    element: '.app-search',
    data: [
        { country: 'VE', name: 'Venezuela', descripcion: 'El país más rico en petróleo.' },
        { country: 'CO', name: 'Colombia', descripcion: 'El país más rico en café.' },
        { country: 'MX', name: 'México', descripcion: 'El país más rico en tacos.' }
    ]
});

search.init();
</script>`)}

            <h2 id="local-dom">2. Búsqueda Local con DOM</h2>

            ${codeBlock('html', `<div class="app-search app-search1">
    <div class="content-pagination-items">
        <ul class="items-search scroll-personalize">
            <li class="items" data-country="VE" data-name="Venezuela"
                data-descripcion="El país más rico en petróleo."></li>
            <li class="items" data-country="CO" data-name="Colombia"
                data-descripcion="Gran riqueza cultural."></li>
        </ul>
    </div>
</div>

<script type="module">
import { Search } from './src/js/main';

const search = new Search({
    element: '.app-search1'
});

search.init();
</script>`)}

            <h2 id="server">3. Búsqueda por Servidor</h2>

            ${codeBlock('javascript', `const search = new Search({
    element: '.app-search',
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: {
            page: 1,
            searchTerm: ""
        }
    }
});

search.init();`)}

            <h2 id="multiple">4. Múltiples Instancias</h2>

            ${codeBlock('javascript', `const search1 = new Search({
    element: '.app-search1',
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: { page: 1, searchTerm: "" }
    }
});

const search2 = new Search({
    element: '.app-search2'
});

const search3 = new Search({
    element: '.app-search3',
    data: [{ name: 'Item 1', descripcion: 'Descripción 1' }]
});

search1.init();
search2.init();
search3.init();`)}

            <h2 id="events">5. Con Eventos</h2>

            ${codeBlock('javascript', `const search = new Search({
    element: '.app-search',
    data: [/* datos */]
});

search.on('init', (data) => console.log('Inicializado:', data));
search.on('search', (data) => console.log('Búsqueda:', data.searchTerm));
search.on('pageChange', (data) => console.log('Página:', data.page));
search.on('itemSelected', (data) => console.log('Seleccionado:', data.item));

search.init();`)}

            <h2 id="keyboard">6. Con Navegación por Teclado</h2>

            ${codeBlock('javascript', `const search = new Search({
    element: '.app-search',
    keyboardEnabled: true,
    data: [
        { name: 'Venezuela' },
        { name: 'Colombia' },
        { name: 'México' }
    ]
});

search.on('itemHighlighted', (data) => console.log('Destacado:', data.item));
search.on('itemSelected', (data) => console.log('Seleccionado:', data.item));

search.init();`)}

            <h2 id="cache-example">7. Con Caché Habilitado</h2>

            ${codeBlock('javascript', `const search = new Search({
    element: '.app-search',
    cacheEnabled: true,
    cacheMaxSize: 100,
    cacheTtlSeconds: 300,
    procesServer: true,
    fetch: {
        url: "./src/php/responseAjax.php",
        method: "POST",
        body: { page: 1, searchTerm: "" }
    }
});

search.init();`)}

            <div class="page-nav">
                <a href="#css-themes" class="page-nav__link">
                    <span class="page-nav__label">&larr; Anterior</span>
                    <span class="page-nav__title">CSS y Themes</span>
                </a>
                <a href="#typescript" class="page-nav__link page-nav__link--next">
                    <span class="page-nav__label">Siguiente &rarr;</span>
                    <span class="page-nav__title">TypeScript</span>
                </a>
            </div>
        </div>
    `;
}, {
    _nav: { id: 'ejemplos', title: 'Ejemplos', icon: '&#128196;', group: 'Guía' }
});
