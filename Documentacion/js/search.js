const SearchDocs = {
    instance: null,
    sectionsData: [],

    init() {
        if (typeof BuscadorDinamico === 'undefined') {
            console.warn('BuscadorDinamico not loaded');
            return;
        }

        this.sectionsData = this.buildSearchData();

        this.instance = new BuscadorDinamico.Search({
            element: '.doc-search',
            data: this.sectionsData,
            template: (item) => {
                return `<div data-section="${item.section}" data-anchor="${item.anchor || ''}" style="padding: 10px 14px; cursor: pointer; border-bottom: 1px solid var(--border-secondary, #f3f4f6);">
                    <div style="font-weight: 600; font-size: 0.875rem;">${item.title}</div>
                    <div style="font-size: 0.75rem; opacity: 0.6; margin-top: 2px;">${item.group}${item.sub ? ' › ' + item.sub : ''}</div>
                </div>`;
            },
            keyboardEnabled: true,
            itemsPerPage: 8,
            debounceTime: 200,
            translation: {
                searchPlaceholder: 'Buscar en la documentación...',
                noResults: 'No se encontraron resultados',
                loading: 'Buscando...'
            }
        });

        this.instance.on('itemSelected', (data) => {
            if (!data.item) return;

            data.close();

            const el = data.item;
            const section = el.getAttribute('data-section')
                || el.querySelector?.('[data-section]')?.getAttribute('data-section');
            const anchor = el.getAttribute('data-anchor')
                || el.querySelector?.('[data-anchor]')?.getAttribute('data-anchor');

            if (section) {
                const hash = anchor ? `${section}/${anchor}` : section;
                window.location.hash = hash;

                if (anchor) {
                    setTimeout(() => {
                        const target = document.getElementById(anchor);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 100);
                }
            }
        });

        this.instance.init();
    },

    buildSearchData() {
        const data = [];

        const sections = [
            { title: 'Inicio', section: 'inicio', group: 'Principal' },
            { title: 'Instalación', section: 'instalacion', group: 'Principal' },
            { title: 'Configuración', section: 'configuracion', group: 'Guía' },
            { title: 'Parámetros del Constructor', section: 'configuracion', group: 'Guía', anchor: 'parametros' },
            { title: 'Configuración de Fetch', section: 'configuracion', group: 'Guía', anchor: 'fetch' },
            { title: 'Estructura HTML', section: 'estructura-html', group: 'Guía' },
            { title: 'Contenedor Básico', section: 'estructura-html', group: 'Guía', anchor: 'basico' },
            { title: 'ARIA y Accesibilidad', section: 'estructura-html', group: 'Guía', anchor: 'accesibilidad' },
            { title: 'API y Métodos', section: 'api', group: 'Referencia' },
            { title: 'init()', section: 'api', group: 'Referencia', anchor: 'init' },
            { title: 'draw()', section: 'api', group: 'Referencia', anchor: 'draw' },
            { title: 'sort()', section: 'api', group: 'Referencia', anchor: 'sort' },
            { title: 'clearSort()', section: 'api', group: 'Referencia', anchor: 'clearSort' },
            { title: 'on()', section: 'api', group: 'Referencia', anchor: 'on' },
            { title: 'showLoading()', section: 'api', group: 'Referencia', anchor: 'showLoading' },
            { title: 'getCacheKey()', section: 'api', group: 'Referencia', anchor: 'getCacheKey' },
            { title: 'cache.clearCacheByPrefix()', section: 'api', group: 'Referencia', anchor: 'clearCacheByPrefix' },
            { title: 'setupKeyboardNavigation()', section: 'api', group: 'Referencia', anchor: 'setupKeyboard' },
            { title: 'destroy()', section: 'api', group: 'Referencia', anchor: 'destroy' },
            { title: 'Métodos de Paginación', section: 'api', group: 'Referencia', anchor: 'pagination-methods' },
            { title: 'Eventos', section: 'eventos', group: 'Referencia' },
            { title: 'Uso de Eventos', section: 'eventos', group: 'Referencia', anchor: 'usage' },
            { title: 'Remover Listeners', section: 'eventos', group: 'Referencia', anchor: 'remove' },
            { title: 'Listener de Una Sola Vez', section: 'eventos', group: 'Referencia', anchor: 'once' },
            { title: 'Templates', section: 'templates', group: 'Personalización' },
            { title: 'Sintaxis de Variables', section: 'templates', group: 'Personalización', anchor: 'syntax' },
            { title: 'Ejemplos de Templates', section: 'templates', group: 'Personalización', anchor: 'examples' },
            { title: 'Internacionalización (i18n)', section: 'i18n', group: 'Personalización' },
            { title: 'Traducciones Disponibles', section: 'i18n', group: 'Personalización', anchor: 'available' },
            { title: 'Traducciones Personalizadas', section: 'i18n', group: 'Personalización', anchor: 'custom' },
            { title: 'Caché', section: 'cache', group: 'Personalización' },
            { title: 'Configuración de Caché', section: 'cache', group: 'Personalización', anchor: 'config' },
            { title: 'Métodos de Caché', section: 'cache', group: 'Personalización', anchor: 'methods' },
            { title: 'Invalidación', section: 'cache', group: 'Personalización', anchor: 'invalidation' },
            { title: 'Gestión de Errores', section: 'errores', group: 'Referencia' },
            { title: 'CSS y Themes', section: 'css-themes', group: 'Personalización' },
            { title: 'Temas Predefinidos', section: 'css-themes', group: 'Personalización', anchor: 'predefined' },
            { title: 'Variables CSS', section: 'css-themes', group: 'Personalización', anchor: 'variables' },
            { title: 'Estructura CSS', section: 'css-themes', group: 'Personalización', anchor: 'structure' },
            { title: 'Ejemplos', section: 'ejemplos', group: 'Guía' },
            { title: 'Búsqueda por Servidor', section: 'ejemplos', group: 'Guía', anchor: 'server' },
            { title: 'Múltiples Instancias', section: 'ejemplos', group: 'Guía', anchor: 'multiple' },
            { title: 'Ejemplo con Eventos', section: 'ejemplos', group: 'Guía', anchor: 'events' },
            { title: 'Ejemplo con Teclado', section: 'ejemplos', group: 'Guía', anchor: 'keyboard' },
            { title: 'TypeScript', section: 'typescript', group: 'Avanzado' },
            { title: 'Uso con TypeScript', section: 'typescript', group: 'Avanzado', anchor: 'usage' },
            { title: 'Changelog', section: 'changelog', group: 'General' },
        ];

        const shortcuts = [
            // Accesos directos - Navegación
            { title: 'Guía rápida', group: 'Acceso rápido', section: 'inicio' },
            { title: 'Cómo empezar', group: 'Acceso rápido', section: 'inicio' },
            { title: 'Introducción', group: 'Acceso rápido', section: 'inicio' },
            { title: 'Características', group: 'Acceso rápido', section: 'inicio', anchor: 'features' },
            { title: 'Compatibilidad', group: 'Acceso rápido', section: 'inicio' },

            // Instalación
            { title: 'Instalar con npm', group: 'Instalación', section: 'instalacion', anchor: 'npm' },
            { title: 'Script tag', group: 'Instalación', section: 'instalacion', anchor: 'cdn' },
            { title: 'UMD', group: 'Instalación', section: 'instalacion', anchor: 'cdn' },
            { title: 'CDN', group: 'Instalación', section: 'instalacion', anchor: 'cdn' },
            { title: 'Dependencias', group: 'Instalación', section: 'instalacion', anchor: 'dependencies' },
            { title: 'Estructura de archivos', group: 'Instalación', section: 'instalacion', anchor: 'structure' },
            { title: 'Vite', group: 'Instalación', section: 'instalacion' },
            { title: 'Instalación Manual', group: 'Instalación', section: 'instalacion', anchor: 'manual' },

            // Configuración
            { title: 'Parámetros del constructor', group: 'Configuración', section: 'configuracion', anchor: 'parametros' },
            { title: 'Configurar Fetch API', group: 'Configuración', section: 'configuracion', anchor: 'fetch' },
            { title: 'Debounce time', group: 'Configuración', section: 'configuracion', anchor: 'parametros' },
            { title: 'Scroll infinito', group: 'Configuración', section: 'configuracion', anchor: 'parametros' },
            { title: 'Ordenamiento', group: 'Configuración', section: 'configuracion', anchor: 'parametros' },
            { title: 'DOM order', group: 'Configuración', section: 'configuracion', anchor: 'parametros' },
            { title: 'Z-index', group: 'Configuración', section: 'configuracion', anchor: 'parametros' },
            { title: 'Modo desarrollo', group: 'Configuración', section: 'configuracion', anchor: 'parametros' },
            { title: 'Método HTTP', group: 'Configuración', section: 'configuracion', anchor: 'fetch' },
            { title: 'Headers', group: 'Configuración', section: 'configuracion', anchor: 'fetch' },
            { title: 'Timeout', group: 'Configuración', section: 'configuracion', anchor: 'fetch' },

            // Estructura HTML
            { title: 'Clases CSS', group: 'HTML', section: 'estructura-html', anchor: 'basico' },
            { title: 'Data attributes', group: 'HTML', section: 'estructura-html', anchor: 'basico' },
            { title: 'Accesibilidad', group: 'HTML', section: 'estructura-html', anchor: 'accesibilidad' },
            { title: 'ARIA', group: 'HTML', section: 'estructura-html', anchor: 'accesibilidad' },
            { title: 'Múltiples instancias', group: 'HTML', section: 'estructura-html', anchor: 'basico' },
            { title: 'Screen reader', group: 'HTML', section: 'estructura-html', anchor: 'accesibilidad' },

            // API
            { title: 'Método init', group: 'API', section: 'api', anchor: 'init' },
            { title: 'Método draw', group: 'API', section: 'api', anchor: 'draw' },
            { title: 'Método sort', group: 'API', section: 'api', anchor: 'sort' },
            { title: 'Método destroy', group: 'API', section: 'api', anchor: 'destroy' },
            { title: 'Método clearSort', group: 'API', section: 'api', anchor: 'clearSort' },
            { title: 'Método on', group: 'API', section: 'api', anchor: 'on' },
            { title: 'Método showLoading', group: 'API', section: 'api', anchor: 'showLoading' },
            { title: 'Método getCacheKey', group: 'API', section: 'api', anchor: 'getCacheKey' },
            { title: 'Paginación', group: 'API', section: 'api', anchor: 'pagination-methods' },
            { title: 'Teclado', group: 'API', section: 'api', anchor: 'setupKeyboard' },
            { title: 'Loading', group: 'API', section: 'api', anchor: 'showLoading' },
            { title: 'Promesa', group: 'API', section: 'api', anchor: 'draw' },
            { title: 'Encadenamiento', group: 'API', section: 'api', anchor: 'init' },

            // Eventos
            { title: 'Eventos disponibles', group: 'Eventos', section: 'eventos', anchor: 'usage' },
            { title: 'itemSelected', group: 'Eventos', section: 'eventos', anchor: 'usage' },
            { title: 'search event', group: 'Eventos', section: 'eventos', anchor: 'usage' },
            { title: 'pageChange', group: 'Eventos', section: 'eventos', anchor: 'usage' },
            { title: 'Callback', group: 'Eventos', section: 'eventos', anchor: 'usage' },
            { title: 'Emitter', group: 'Eventos', section: 'eventos', anchor: 'usage' },
            { title: 'Remover listeners', group: 'Eventos', section: 'eventos', anchor: 'remove' },
            { title: 'Once', group: 'Eventos', section: 'eventos', anchor: 'once' },

            // Templates
            { title: 'Template personalizado', group: 'Templates', section: 'templates', anchor: 'syntax' },
            { title: 'Variable template', group: 'Templates', section: 'templates', anchor: 'syntax' },
            { title: 'Renderizado custom', group: 'Templates', section: 'templates', anchor: 'examples' },
            { title: 'HTML dinámico', group: 'Templates', section: 'templates', anchor: 'examples' },

            // i18n
            { title: 'Internacionalización', group: 'i18n', section: 'i18n', anchor: 'available' },
            { title: 'Traducciones', group: 'i18n', section: 'i18n', anchor: 'available' },
            { title: 'Idioma', group: 'i18n', section: 'i18n', anchor: 'available' },
            { title: 'Placeholder', group: 'i18n', section: 'i18n', anchor: 'available' },
            { title: 'Localización', group: 'i18n', section: 'i18n', anchor: 'custom' },

            // Cache
            { title: 'Caché LRU', group: 'Caché', section: 'cache', anchor: 'config' },
            { title: 'TTL', group: 'Caché', section: 'cache', anchor: 'config' },
            { title: 'Rendimiento', group: 'Caché', section: 'cache', anchor: 'config' },
            { title: 'Performance', group: 'Caché', section: 'cache', anchor: 'config' },
            { title: 'Limpiar caché', group: 'Caché', section: 'cache', anchor: 'methods' },
            { title: 'Optimización', group: 'Caché', section: 'cache', anchor: 'invalidation' },

            // Errores
            { title: 'Códigos de error', group: 'Errores', section: 'errores' },
            { title: 'SEARCH_001', group: 'Errores', section: 'errores' },
            { title: 'Debug', group: 'Errores', section: 'errores' },
            { title: 'Try catch', group: 'Errores', section: 'errores' },
            { title: 'Troubleshooting', group: 'Errores', section: 'errores' },
            { title: 'Conexión', group: 'Errores', section: 'errores' },
            { title: 'Validación', group: 'Errores', section: 'errores' },

            // CSS y Themes
            { title: 'Dark mode', group: 'CSS', section: 'css-themes', anchor: 'predefined' },
            { title: 'Variables CSS', group: 'CSS', section: 'css-themes', anchor: 'variables' },
            { title: 'Personalizar colores', group: 'CSS', section: 'css-themes', anchor: 'variables' },
            { title: 'Custom theme', group: 'CSS', section: 'css-themes', anchor: 'variables' },
            { title: 'Onyx black', group: 'CSS', section: 'css-themes', anchor: 'predefined' },
            { title: 'Blue black', group: 'CSS', section: 'css-themes', anchor: 'predefined' },
            { title: 'Forest green', group: 'CSS', section: 'css-themes', anchor: 'predefined' },
            { title: 'Clean white', group: 'CSS', section: 'css-themes', anchor: 'predefined' },
            { title: 'Spinner', group: 'CSS', section: 'css-themes', anchor: 'variables' },
            { title: 'Scrollbar', group: 'CSS', section: 'css-themes', anchor: 'variables' },
            { title: 'Border radius', group: 'CSS', section: 'css-themes', anchor: 'variables' },
            { title: 'Estructura CSS', group: 'CSS', section: 'css-themes', anchor: 'structure' },

            // Ejemplos
            { title: 'Ejemplos completos', group: 'Ejemplos', section: 'ejemplos' },
            { title: 'Tutorial', group: 'Ejemplos', section: 'ejemplos' },
            { title: 'Ejemplo básico', group: 'Ejemplos', section: 'ejemplos' },
            { title: 'Ejemplo servidor', group: 'Ejemplos', section: 'ejemplos', anchor: 'server' },
            { title: 'Ejemplo múltiples instancias', group: 'Ejemplos', section: 'ejemplos', anchor: 'multiple' },
            { title: 'Casos de uso', group: 'Ejemplos', section: 'ejemplos' },
            { title: 'AJAX', group: 'Ejemplos', section: 'ejemplos', anchor: 'server' },
            { title: 'Ejemplo con eventos', group: 'Ejemplos', section: 'ejemplos', anchor: 'events' },
            { title: 'Ejemplo con teclado', group: 'Ejemplos', section: 'ejemplos', anchor: 'keyboard' },

            // TypeScript
            { title: 'TypeScript', group: 'Avanzado', section: 'typescript', anchor: 'usage' },
            { title: 'Types', group: 'Avanzado', section: 'typescript', anchor: 'usage' },
            { title: 'Interfaces', group: 'Avanzado', section: 'typescript', anchor: 'usage' },
            { title: 'Beneficios', group: 'Avanzado', section: 'typescript', anchor: 'benefits' },

            // Changelog
            { title: 'Changelog', group: 'General', section: 'changelog' },
            { title: 'Versión', group: 'General', section: 'changelog' },
            { title: 'Novedades', group: 'General', section: 'changelog' },
            { title: 'Actualizaciones', group: 'General', section: 'changelog' },
        ];

        sections.forEach(item => data.push(item));

        const seen = new Set(data.map(d => d.title.toLowerCase()));
        shortcuts.forEach(item => {
            if (!seen.has(item.title.toLowerCase())) {
                seen.add(item.title.toLowerCase());
                data.push(item);
            }
        });

        return data;
    }
};
