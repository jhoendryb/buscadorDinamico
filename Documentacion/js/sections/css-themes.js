export const cssThemes = Object.assign(function() {
    return `
        <div class="hero">
            <span class="badge badge--primary hero__badge">Personalización</span>
            <h1 class="hero__title">CSS y Themes</h1>
            <p class="hero__desc">6 temas predefinidos y 30+ variables CSS personalizables.</p>
        </div>

        <div class="doc">
            <h2 id="predefined">Temas Predefinidos</h2>

            <table class="doc-table">
                <thead>
                    <tr><th>Tema</th><th>Descripción</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>default</code></td><td>Tema por defecto con colores neutros</td></tr>
                    <tr><td><code>clean-white</code></td><td>Blanco limpio, bordes sutiles, azul para selección</td></tr>
                    <tr><td><code>blue-black</code></td><td>Azul oscuro (#21213e), hover azul intenso</td></tr>
                    <tr><td><code>onyx-black</code></td><td>Negro puro (#121212), azul brillante para selección</td></tr>
                    <tr><td><code>forest-green</code></td><td>Verde bosque (#2c3e2e), verde oliva para hover</td></tr>
                    <tr><td><code>adaptative</code></td><td>Se adapta automáticamente al tema claro/oscuro del documento via <code>[data-theme]</code></td></tr>
                </tbody>
            </table>

            <h3>Uso via JavaScript</h3>
            ${codeBlock('javascript', `const search = new Search({
    element: '.app-search',
    theme: 'clean-white',
    data: [/* datos */}
]);`)}

            <h3>Uso via CSS</h3>
            ${codeBlock('html', `<link rel="stylesheet" href="./src/css/index.css">
<link rel="stylesheet" href="./src/css/themes/clean-white.css">`)}

            <h2 id="adaptative">Tema Adaptative</h2>

            <p>El tema <code>adaptative</code> detecta automáticamente el atributo <code>data-theme</code> en el elemento <code>&lt;html&gt;</code> y cambia los colores del buscador sin necesidad de intervención manual.</p>

            <p>Esto es útil cuando tu aplicación ya tiene un sistema de temas claro/oscuro:</p>

            ${codeBlock('html', `<!-- HTML -->
<html data-theme="light">
<head>
    <link rel="stylesheet" href="./src/css/index.css">
    <link rel="stylesheet" href="./src/css/themes/adaptative.css">
</head>
<body>
    <div class="app-search"></div>
</body>
</html>`)}

            ${codeBlock('javascript', `// Cambiar tema dinámicamente
document.documentElement.setAttribute('data-theme', 'dark');
// El buscador se adapta automáticamente`)}

            <div class="callout callout--info">
                <span class="callout__icon">ℹ️</span>
                <div class="callout__content">
                    <p>El tema <code>adaptative</code> usa selectores <code>[data-theme="light"]</code> y <code>[data-theme="dark"]</code> para aplicar diferentes valores de variables CSS según el tema actual.</p>
                </div>
            </div>

            <h2 id="variables">Variables CSS Personalizables</h2>

            ${codeBlock('css', `:root {
    /* Dimensiones */
    --search-width: 280px;
    --search-max-height: 400px;
    --search-padding: 10px;
    --search-gap: 10px;
    --search-item-padding: 10px;
    --search-font-size: 15px;
    --search-counter-font-size: 0.9em;
    --search-counter-text-align: center;
    --search-icon-size: 1.2em;

    /* Colores principales */
    --search-bg-color: #ffffff;
    --search-border-color: #d0d0d0;
    --search-text-color: #333333;
    --search-text-color-items: #444444;
    --search-light-text-color: #666666;
    --search-placeholder-color: #888888;

    /* Colores del input */
    --search-input-bg-color: #ffffff;
    --search-input-border-color: #cccccc;

    /* Colores de items */
    --search-item-bg-color: #f5f5f5;
    --search-item-hover-bg-color: #e8e8e8;
    --search-selected-bg-color: #d4edff;
    --search-selected-border-color: #0066cc;

    /* Colores del contador */
    --search-counter-color: #666666;
    --search-counter-bg-color: #f8f8f8;

    /* Bordes */
    --search-border-radius: 8px;
    --search-border-radius-open: 8px 8px 0 0;

    /* Sombras e iconos */
    --shadow-color: rgba(0,0,0,0.1);
    --search-icon-color: #666666;

    /* Scrollbar */
    --scrollbar-thumb-color: #cccccc;

    /* Spinner de carga */
    --spinner-border-color: #e0e0e0;
    --spinner-top-color: #0066cc;
}`)}

            <h2 id="custom-theme">Crear Tema Personalizado</h2>

            ${codeBlock('css', `/* tema-oscuro.css */
:root {
    --search-bg-color: #1a1a1a;
    --search-selected-bg-color: #333;
    --search-text-color: #fff;
}`)}

            ${codeBlock('html', `<link rel="stylesheet" href="./src/css/index.css">
<link rel="stylesheet" href="./tema-oscuro.css">`)}

            <h2 id="structure">Estructura CSS</h2>

            <p>El CSS está organizado en 3 capas:</p>

            <table class="doc-table">
                <thead>
                    <tr><th>Capa</th><th>Directorio</th><th>Descripción</th></tr>
                </thead>
                <tbody>
                    <tr><td><strong>Core</strong></td><td><code>css/core/</code></td><td>Layout, visibilidad, animaciones, estados, scrollbar</td></tr>
                    <tr><td><strong>Theme</strong></td><td><code>css/theme/</code></td><td>Variables CSS, colores, dimensiones, bordes, tipografía</td></tr>
                    <tr><td><strong>Themes</strong></td><td><code>css/themes/</code></td><td>Temas predefinidos (clean-white, blue-black, adaptative, etc.)</td></tr>
                </tbody>
            </table>

            <div class="page-nav">
                <a href="#errores" class="page-nav__link">
                    <span class="page-nav__label">&larr; Anterior</span>
                    <span class="page-nav__title">Gestión de Errores</span>
                </a>
                <a href="#ejemplos" class="page-nav__link page-nav__link--next">
                    <span class="page-nav__label">Siguiente &rarr;</span>
                    <span class="page-nav__title">Ejemplos</span>
                </a>
            </div>
        </div>
    `;
}, {
    _nav: { id: 'css-themes', title: 'CSS y Themes', icon: '&#127912;', group: 'Personalización' }
});
