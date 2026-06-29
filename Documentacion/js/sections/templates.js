export const templates = Object.assign(function() {
    return `
        <div class="hero">
            <span class="badge badge--primary hero__badge">Personalización</span>
            <h1 class="hero__title">Templates Personalizados</h1>
            <p class="hero__desc">Personaliza cómo se renderiza cada item en los resultados.</p>
        </div>

        <div class="doc">
            <h2 id="string-templates">Templates con Strings</h2>

            <p>Usa la sintaxis <code>{{variable}}</code> para insertar propiedades del objeto de datos:</p>

            ${codeBlock('javascript', `const search = new Search({
    element: '.app-search',
    data: [
        { name: 'Venezuela', id: 1 },
        { name: 'Colombia', id: 2 }
    ],
    template: \`<div>{{name}} - {{id}}</div>\`
});`)}

            <h2 id="function-templates">Templates con Funciones</h2>

            <p>Para mayor control, usa una función que recibe el item y retorna HTML:</p>

            ${codeBlock('javascript', `const search = new Search({
    element: '.app-search',
    data: [
        { name: 'Venezuela', id: 1 },
        { name: 'Colombia', id: 2 }
    ],
    template: (item) => {
        return \`<div class="custom-item">
            <strong>\${item.name}</strong>
            <span>ID: \${item.id}</span>
        </div>\`;
    }
});`)}

            <h2 id="syntax">Sintaxis de Variables</h2>

            <ul>
                <li>Usar <code>{{variable}}</code> para templates con strings</li>
                <li>La variable debe coincidir con una propiedad del objeto de datos</li>
                <li>Se pueden usar múltiples variables en un template</li>
            </ul>

            <h2 id="examples">Ejemplos</h2>

            ${codeBlock('javascript', `// Template simple
template: \`<div>{{name}}</div>\`

// Múltiples variables
template: \`<div>{{name}} - {{country}}</div>\`

// Template con función (HTML complejo)
template: (item) => {
    return \`<div class="item">
        <h3>\${item.name}</h3>
        <p>\${item.descripcion}</p>
        <span class="badge">\${item.country}</span>
    </div>\`;
}`)}

            <div class="callout callout--info">
                <span class="callout__icon">&#8505;</span>
                <div class="callout__content">
                    <p>Los templates con función son ideales cuando necesitas lógica condicional o formateo avanzado en tus resultados.</p>
                </div>
            </div>

            <div class="page-nav">
                <a href="#eventos" class="page-nav__link">
                    <span class="page-nav__label">&larr; Anterior</span>
                    <span class="page-nav__title">Eventos</span>
                </a>
                <a href="#i18n" class="page-nav__link page-nav__link--next">
                    <span class="page-nav__label">Siguiente &rarr;</span>
                    <span class="page-nav__title">Internacionalización</span>
                </a>
            </div>
        </div>
    `;
}, {
    _nav: { id: 'templates', title: 'Templates', icon: '&#127912;', group: 'Personalización' }
});
