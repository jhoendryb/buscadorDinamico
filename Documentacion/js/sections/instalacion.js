export const instalacion = Object.assign(function() {
    return `
        <div class="hero">
            <span class="badge badge--primary hero__badge">Guía</span>
            <h1 class="hero__title">Instalación</h1>
            <p class="hero__desc">Múltiples formas de instalar y configurar el componente Search en tu proyecto.</p>
        </div>

        <div class="doc">
            <h2 id="npm">Instalación con npm/pnpm</h2>

            ${codeBlock('bash', `npm install buscador-dinamico
# o
pnpm install buscador-dinamico`)}

            <h2 id="manual">Instalación Manual</h2>

            <p>Descarga los archivos del proyecto e importa la clase Search:</p>

            ${codeBlock('html', `<script type="module">
    import { Search } from './src/js/main';
</script>`)}

            <div class="callout callout--info">
                <span class="callout__icon">&#8505;</span>
                <div class="callout__content">
                    <p>El proyecto usa TypeScript pero compila a JavaScript. El entry point es <code>main.ts</code> que re-exporta desde <code>index.ts</code>.</p>
                </div>
            </div>

            <h2 id="cdn">Uso con UMD (script tag)</h2>

            <p>Incluye el archivo UMD directamente en tu HTML:</p>

            ${codeBlock('html', `<link rel="stylesheet" href="./assets/buscador-dinamico.css">
<script src="./assets/buscador-dinamico.umd.js"></script>
<script>
    const search = new BuscadorDinamico.Search({
        element: '.app-search',
        data: [{ name: 'Venezuela' }]
    });
    search.init();
</script>`)}

            <h2 id="dependencies">Dependencias</h2>

            <h3>Requeridas</h3>
            <ul>
                <li>Ninguna (Vanilla JavaScript + TypeScript)</li>
            </ul>

            <h3>Opcionales</h3>
            <ul>
                <li>Bootstrap CSS y JS</li>
                <li>Popper.js (para componentes de Bootstrap)</li>
            </ul>

            <h2 id="dev-setup">Configuración de Desarrollo</h2>

            ${codeBlock('bash', `# Instalar dependencias
pnpm install

# Desarrollo con hot reload
pnpm dev

# Build de producción
pnpm build

# Ejecutar tests
pnpm test

# Verificar tipos TypeScript
pnpm type-check`)}

            <h2 id="build-output">Salida del Build</h2>

            <p>El build genera tres archivos en <code>dist/</code>:</p>

            <table class="doc-table">
                <thead>
                    <tr><th>Archivo</th><th>Formato</th><th>Uso</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>buscador-dinamico.es.js</code></td><td>ES Module</td><td>Para bundlers (Vite, Webpack, Rollup)</td></tr>
                    <tr><td><code>buscador-dinamico.umd.js</code></td><td>UMD</td><td>Para script tags, exporta <code>window.BuscadorDinamico</code></td></tr>
                    <tr><td><code>css/buscador-dinamico.*.css</code></td><td>CSS</td><td>CSS bundle con hash</td></tr>
                </tbody>
            </table>

            <h2 id="structure">Estructura de Archivos</h2>

            ${codeBlock('text', `buscadorDinamico/
├── src/
│   ├── js/
│   │   ├── main.ts              # Entry point del build
│   │   ├── index.ts             # Barrel export
│   │   ├── app.ts               # Clase principal Search
│   │   ├── types.ts             # Interfaces TypeScript
│   │   ├── constants.ts         # Constantes y defaults
│   │   ├── renderElement.ts     # Helper createElement
│   │   ├── searching/           # Lógica de búsqueda
│   │   ├── error-handler/       # Sistema de errores
│   │   ├── cache/               # Caché LRU
│   │   ├── events/              # EventEmitter
│   │   ├── pagination/          # Paginación
│   │   └── renderer/            # Renderizado DOM
│   ├── css/
│   │   ├── core/                # CSS obligatorio
│   │   ├── theme/               # Variables CSS
│   │   └── themes/              # Temas predefinidos
│   └── tests/
├── dist/                        # Build de producción
└── Documentacion/               # Esta documentación`)}

            <div class="page-nav">
                <a href="#inicio" class="page-nav__link">
                    <span class="page-nav__label">&larr; Anterior</span>
                    <span class="page-nav__title">Inicio</span>
                </a>
                <a href="#configuracion" class="page-nav__link page-nav__link--next">
                    <span class="page-nav__label">Siguiente &rarr;</span>
                    <span class="page-nav__title">Configuración</span>
                </a>
            </div>
        </div>
    `;
}, {
    _nav: { id: 'instalacion', title: 'Instalación', icon: '&#128229;', group: 'Principal' }
});
