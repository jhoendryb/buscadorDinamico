export const typescript = Object.assign(function() {
    return `
        <div class="hero">
            <span class="badge badge--primary hero__badge">Avanzado</span>
            <h1 class="hero__title">TypeScript</h1>
            <p class="hero__desc">Interfaces TypeScript completas para type safety en tu proyecto.</p>
        </div>

        <div class="doc">
            <h2 id="search-params">SearchParams</h2>

            ${codeBlock('typescript', `interface SearchParams {
    element: string;
    theme?: string;
    searchTerm?: string;
    data?: Object[];
    procesServer?: boolean;
    keyboardEnabled?: boolean;
    cacheEnabled?: boolean;
    template?: string | ((item: any) => string);
    sortBy?: string;
    zIndex?: number;
    sortOrder?: 'asc' | 'desc';
    itemsPerPage?: number;
    debounceTime?: number;
    cacheMaxSize?: number;
    cacheTtlSeconds?: number;
    dom?: string;
    fetch?: FetchConfig;
    translation?: TranslationCache;
    developmentMode?: boolean;
}`)}

            <h2 id="fetch-config">FetchConfig</h2>

            ${codeBlock('typescript', `interface FetchConfig {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: Record<string, any>;
    timeout?: number;
    success?: (resp: any, instance: any) => void;
    error?: (err: any) => void;
}`)}

            <h2 id="translation">TranslationCache</h2>

            ${codeBlock('typescript', `interface TranslationCache {
    searchLabel?: string;
    searchPlaceholder?: string;
    loading?: string;
    noResults?: string;
    [key: string]: string | undefined;
}`)}

            <h2 id="events-types">Tipos de Eventos</h2>

            ${codeBlock('typescript', `interface SearchEventInit {
    searchTerm: string;
    itemsPerPage: number;
    procesServer: boolean;
}

interface PageChangeEventData {
    page: number;
    totalPages: number;
    itemsOnPage: number;
    totalLoaded: number;
}

interface SortChangeEventData {
    field: string;
    order: string;
}

interface ItemSelectedEventData {
    item: HTMLElement;
    index: number;
}

interface DestroyEventData {
    timestamp: string;
}`)}

            <h2 id="usage">Uso con TypeScript</h2>

            ${codeBlock('typescript', `import { Search, SearchParams, FetchConfig } from './src/js/main';

const config: SearchParams = {
    element: '.app-search',
    procesServer: true,
    cacheEnabled: true,
    keyboardEnabled: true,
    developmentMode: true,
    template: \`<div>{{name}} - {{id_ciudad}}</div>\`,
    translation: {
        searchPlaceholder: 'Escribe la busqueda aqui.'
    },
    fetch: {
        url: "/api/search",
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: {
            page: 1,
            searchTerm: ""
        }
    } as FetchConfig
};

const search = new Search(config);

search.on('appendItems', (data: any) => {
    const { content } = data;
    console.log('Items renderizados:', content.children.length);
});

search.on('itemSelected', (data: any) => {
    console.log('Item seleccionado:', data.item);
});

search.init();`)}

            <h2 id="benefits">Beneficios</h2>

            <ul>
                <li>Autocompletado de métodos y propiedades en el IDE</li>
                <li>Type checking en tiempo de compilación</li>
                <li>Documentación inline en el IDE</li>
                <li>Refactorización segura</li>
                <li>Detección de errores antes de ejecutar</li>
            </ul>

            <div class="page-nav">
                <a href="#ejemplos" class="page-nav__link">
                    <span class="page-nav__label">&larr; Anterior</span>
                    <span class="page-nav__title">Ejemplos</span>
                </a>
                <a href="#changelog" class="page-nav__link page-nav__link--next">
                    <span class="page-nav__label">Siguiente &rarr;</span>
                    <span class="page-nav__title">Changelog</span>
                </a>
            </div>
        </div>
    `;
}, {
    _nav: { id: 'typescript', title: 'TypeScript', icon: '&#128309;', group: 'Avanzado' }
});
