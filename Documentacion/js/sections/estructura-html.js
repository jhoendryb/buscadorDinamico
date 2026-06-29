export const estructuraHtml = Object.assign(function() {
    return `
        <div class="hero">
            <span class="badge badge--primary hero__badge">Guía</span>
            <h1 class="hero__title">Estructura HTML</h1>
            <p class="hero__desc">Cómo configurar el contenedor HTML para el componente Search.</p>
        </div>

        <div class="doc">
            <h2 id="basico">Contenedor Básico</h2>

            <p>La clase Search requiere un contenedor con una clase CSS:</p>

            ${codeBlock('html', `<div class="app-search">
    <!-- La clase generará automáticamente:
         - Input de búsqueda
         - Contenedor de resultados
         - Paginación -->
</div>`)}

            <h2 id="con-datos">Con Datos Preexistentes en HTML</h2>

            <p>Si tienes datos ya en el HTML, puedes incluir elementos con data attributes:</p>

            ${codeBlock('html', `<div class="app-search app-search1">
    <search class="input-search">
        <input type="text" name="filterSearch"
            class="filter-search form-control input-sm"
            placeholder="Ingrese palabra clave...">
    </search>
    <div class="content-pagination-items">
        <ul class="items-search scroll-personalize">
            <li class="items" data-country="VE" data-name="Venezuela"
                data-descripcion="El país más rico en petróleo.">
            </li>
            <li class="items" data-country="CO" data-name="Colombia"
                data-descripcion="Un país con gran riqueza cultural.">
            </li>
        </ul>
        <div class="pagination-items">
            <div class="items-counter">20 de 498</div>
        </div>
    </div>
</div>`)}

            <p>La clase extraerá automáticamente los datos de los atributos <code>data-*</code> de los elementos <code>.items</code>.</p>

            <h2 id="auto-generada">Estructura Generada Automáticamente</h2>

            <p>Si el contenedor está vacío, la clase Search generará automáticamente:</p>

            ${codeBlock('html', `<div class="app-search">
    <search class="input-search">
        <input type="text" name="filterSearch"
            class="filter-search form-control input-lg"
            placeholder="Ingrese palabra clave..."
            aria-label="Campo de búsqueda">
    </search>
    <div class="content-pagination-items">
        <ul class="items-search scroll-personalize" role="listbox">
            <!-- Aquí se renderizan los resultados -->
        </ul>
        <div class="pagination-items" role="status" aria-live="polite">
            <div class="items-counter">0 de 0</div>
        </div>
    </div>
</div>`)}

            <h2 id="clases-unicas">Clases CSS Únicas</h2>

            <p>La clase genera automáticamente clases CSS únicas para múltiples instancias:</p>

            ${codeBlock('javascript', `// Para '.app-search1': input-search-app-search1, items-search-app-search1
// Para '.app-search2': input-search-app-search2, items-search-app-search2`)}

            <p>Esto evita conflictos de estilos entre múltiples instancias en la misma página.</p>

            <h2 id="accesibilidad">ARIA Attributes y Accesibilidad</h2>

            <p>El componente incluye atributos ARIA automáticamente:</p>

            ${codeBlock('html', `<input type="text"
    aria-label="Campo de búsqueda"
    placeholder="Ingrese palabra clave..."
    role="searchbox">`)}

            <div class="callout callout--info">
                <span class="callout__icon">&#8505;</span>
                <div class="callout__content">
                    <p>El componente incluye <code>role="listbox"</code> en la lista de resultados y <code>role="option"</code> en cada item para soporte de screen readers.</p>
                </div>
            </div>

            <div class="page-nav">
                <a href="#configuracion" class="page-nav__link">
                    <span class="page-nav__label">&larr; Anterior</span>
                    <span class="page-nav__title">Configuración</span>
                </a>
                <a href="#api" class="page-nav__link page-nav__link--next">
                    <span class="page-nav__label">Siguiente &rarr;</span>
                    <span class="page-nav__title">API y Métodos</span>
                </a>
            </div>
        </div>
    `;
}, {
    _nav: { id: 'estructura-html', title: 'Estructura HTML', icon: '&#128195;', group: 'Guía' }
});
