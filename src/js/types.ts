/**
 * @typedef {Object} SearchParams
 * @property {string} element - Selector CSS del contenedor (requerido)
 * @property {Array} [data] - Array de datos para búsqueda local
 * @property {boolean} [procesServer=false] - Habilita búsqueda por servidor
 * @property {number} [itemsPerPage=10] - Items por página
 * @property {number} [debounceTime=500] - Tiempo de debounce en ms
 * @property {number} [cacheMaxSize=50] - Tamaño máximo del caché
 * @property {number} [cacheTtlSeconds=60] - Tiempo de vida del caché en segundos
 * @property {boolean} [cacheEnabled=false] - Habilita caché
 * @property {Object} [fetch] - Configuración AJAX
 * @property {string} [sortBy] - Campo para ordenamiento
 * @property {'asc'|'desc'} [sortOrder='asc'] - Orden de ordenamiento
 * @property {boolean} [keyboardEnabled=false] - Habilita navegación por teclado
 * @property {string} [dom='sip'] - Orden de renderizado (s=search, i=items, p=pagination)
 * @property {string|Function} [template] - Template personalizado
 * @property {Object} [translation] - Traducciones personalizadas
 */
export interface SearchParams {
    element: string;
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
}

/**
 * @typedef {Object} FetchConfig
 * @property {string} url - URL del endpoint (requerido)
 * @property {'GET'|'POST'|'PUT'|'PATCH'} [method='POST'] - Método HTTP
 * @property {Object} [body] - Cuerpo de la petición
 * @property {Object} [header] - Headers adicionales
 * @property {Function} [sucess] - Callback de éxito
 * @property {Function} [error] - Callback de error
 */

export interface FetchConfig {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: Record<string, any>;
    timeout?: number;
    sucess?: (resp: any, instance: any) => void;
    error?: (err: any) => void;
}

/**
 * @typedef {Object} TranslationConfig
 * @property {string} [searchPlaceholder] - Placeholder del input
 * @property {string} [noResults] - Mensaje sin resultados
 * @property {string} [loading] - Mensaje de carga
 */
export interface TranslationCache {
    searchPlaceholder?: string;
    loading?: string;
    noResults?: string;
    [key: string]: string | undefined;
}

/**
 * @typedef {Object} PaginationConfig
 * @property {number} page - Página actual
 * @property {number} countPage - Total de items
 * @property {Function} next - Función para obtener items de página actual
 */

/**
 * @typedef {Object} BodyConfig
 * @property {HTMLElement} content - Contenedor principal
 * @property {HTMLElement} [contentSearch] - Contenedor de búsqueda
 * @property {HTMLElement} [inputSearch] - Input de búsqueda
 * @property {HTMLElement} [renderItems] - Contenedor de items
 * @property {HTMLElement} [paginationItems] - Contenedor de paginación
 */
export interface BodyConfig {
    content: HTMLElement;
    contentSearch?: HTMLElement;
    inputSearch?: HTMLElement;
    renderItems?: HTMLElement;
    paginationItems?: HTMLElement;
    contentPaginationItems?: HTMLElement;
}

/**
 * @typedef {Object} CacheItem
 * @property {*} data - Datos almacenados
 * @property {number} timestamp - Timestamp de almacenamiento
 */

/**
 * @typedef {Object} EventCallback
 * @property {Function} callback - Función callback
 * @property {number} [id] - ID del listener
 */

/**
 * @typedef {Object} SearchResult
 * @property {Array} data - Datos de resultados
 * @property {string} searchTerm - Término de búsqueda
 * @property {number} page - Página actual
 * @property {number} totalPages - Total de páginas
 */

/**
 * @typedef {Object} AjaxResponse
 * @property {boolean} success - Si la petición fue exitosa
 * @property {Array} data - Datos de respuesta
 * @property {number} countPage - Total de items
 * @property {number} page - Página actual
 */

export interface RenderSearchOptions {
    onInput: (searchTerm: string, isEvent: boolean) => void;
    debounceTime: number;
    placeholder?: string;
    ariaLabel?: string;
}

export interface RenderByDomOptions {
    zIndex?: number;
    search?: RenderSearchOptions;
}

// Tipos de eventos
export interface SearchEventInit {
    searchTerm: string;
    itemsPerPage: number;
    procesServer: boolean;
}

export interface PageChangeEventData {
    page: number;
    totalPages: number;
    itemsOnPage: number;
    totalLoaded: number;
}

export interface SortChangeEventData {
    field: string;
    order: 'asc' | 'desc';
}

export interface ItemSelectedEventData {
    item: HTMLElement;
    index: number;
}

export interface ItemHighlightedEventData {
    item: HTMLElement;
    index: number;
}

export interface DestroyEventData {
    timestamp: string;
}

export interface RenderItemsEventData {
    items: any[];
    content: HTMLElement;
}

export interface AppendItemsEventData {
    items: any[];
    content: HTMLElement;
}

export interface SearchEventData {
    searchTerm: string;
    results: Record<string, any>;
    totalResults: number;
    timestamp: string;
}

export interface CreateElementConfig {
    element: string | HTMLElement;
    dataset?: Record<string, string>;
    children?: CreateElementConfig[];
    child?: HTMLElement;
    event?: Record<string, (e: any) => void>;
    attributes?: Record<string, string>;
    [key: string]: any;
}