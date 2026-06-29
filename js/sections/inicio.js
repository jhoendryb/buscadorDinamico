export const inicio = Object.assign(function() {
    return `
        <div class="hero">
            <span class="badge badge--primary hero__badge">v2.1.0</span>
            <h1 class="hero__title">Search Component</h1>
            <p class="hero__desc">
                Una clase TypeScript flexible y moderna para crear buscadores dinámicos con soporte para paginación,
                scroll infinito, búsqueda en tiempo real, navegación por teclado y gestión de errores centralizada.
            </p>
        </div>

        <div class="doc">
            <h2 id="features">Características Principales</h2>

            <div class="card-grid">
                <a href="#instalacion" class="card">
                    <div class="card__icon">&#9889;</div>
                    <div class="card__title">Instalación Rápida</div>
                    <div class="card__desc">Compatible con npm, pnpm o instalación manual. Sin dependencias requeridas.</div>
                </a>
                <a href="#configuracion" class="card">
                    <div class="card__icon">&#9881;</div>
                    <div class="card__title">Configurable</div>
                    <div class="card__desc">Modo local y servidor, caché LRU, debounce, paginación, scroll infinito.</div>
                </a>
                <a href="#api" class="card">
                    <div class="card__icon">&#128218;</div>
                    <div class="card__title">API Completa</div>
                    <div class="card__desc">Métodos públicos, eventos personalizados, TypeScript con type safety.</div>
                </a>
                <a href="#css-themes" class="card">
                    <div class="card__icon">&#127912;</div>
                    <div class="card__title">Temas CSS</div>
                    <div class="card__desc">4 temas predefinidos y 30+ variables CSS personalizables.</div>
                </a>
                <a href="#eventos" class="card">
                    <div class="card__icon">&#128227;</div>
                    <div class="card__title">Sistema de Eventos</div>
                    <div class="card__desc">Eventos personalizados, listeners, una sola vez, encadenamiento.</div>
                </a>
                <a href="#errores" class="card">
                    <div class="card__icon">&#128737;</div>
                    <div class="card__title">Gestión de Errores</div>
                    <div class="card__desc">ErrorHandler centralizado con códigos estandarizados y guías de solución.</div>
                </a>
            </div>

            <h2 id="quick-example">Ejemplo Rápido</h2>

            ${codeBlock('javascript', `import { Search } from './src/js/main';

const search = new Search({
    element: '.app-search',
    data: [
        { name: 'Venezuela', country: 'VE' },
        { name: 'Colombia', country: 'CO' },
        { name: 'México', country: 'MX' }
    ]
});

search.init();`)}

            <h2 id="browser-support">Compatibilidad</h2>

            <table class="doc-table">
                <thead>
                    <tr><th>Navegador</th><th>Versión Mínima</th></tr>
                </thead>
                <tbody>
                    <tr><td>Chrome</td><td>42+</td></tr>
                    <tr><td>Firefox</td><td>39+</td></tr>
                    <tr><td>Safari</td><td>10.1+</td></tr>
                    <tr><td>Edge</td><td>14+</td></tr>
                </tbody>
            </table>

            <div class="callout callout--info">
                <span class="callout__icon">&#8505;</span>
                <div class="callout__content">
                    <p>El componente usa <strong>Fetch API</strong> e <strong>IntersectionObserver</strong>. Para navegadores antiguos, usa un polyfill.</p>
                </div>
            </div>
        </div>
    `;
}, {
    _nav: { id: 'inicio', title: 'Inicio', icon: '&#127968;', group: 'Principal' }
});
