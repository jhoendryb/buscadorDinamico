/**
 * @license MIT
 * Copyright (c) 2026 JhoendryB
 */
import { LRUCache, EventEmitter, Pagination, SearchRenderer, VisibilityManager, Types } from './index';
declare class Search {
    #private;
    element: string;
    theme: string;
    searchTerm: string;
    data: Record<string, any>[];
    _data: Record<string, any>[] | null;
    procesServer: boolean;
    keyboardEnabled: boolean;
    cacheEnabled: boolean;
    template: string | Function | null;
    sortBy: string | null;
    zIndex: number;
    sortOrder: 'asc' | 'desc';
    itemsPerPage: number;
    debounceTime: number;
    cacheMaxSize: number;
    cacheTtlSeconds: number;
    dom: string;
    selectedIndex: number;
    _ajaxResponse: Record<string, any>;
    developmentMode: boolean;
    renderer: SearchRenderer;
    cache: LRUCache;
    events: EventEmitter<Types.SearchEventMap>;
    pagination: Pagination;
    scrollObserver: IntersectionObserver | null;
    t: Types.TranslationCache;
    fetch?: Types.FetchConfig;
    highlightEnabled: boolean;
    highlightClass: string;
    responseAdapter?: Types.SearchParams['responseAdapter'];
    private errorHandler;
    private searchingLocal;
    private searchingServer;
    private boundClickHandler;
    private boundKeydownHandler;
    private boundFocusInHandler;
    private boundFocusClickOutSide;
    private boundInputHandler;
    private selectingItem;
    private currentDrawId;
    private isLoadingMore;
    private _destroyed;
    private abortController;
    visibility: VisibilityManager | undefined;
    /**
     * Crea una instancia de Search.
     * @param {Types.SearchParams} params - Parámetros de configuración
     */
    constructor(params: Types.SearchParams);
    /**
     * Inicializa el componente Search.
     * @returns {Search} Instancia para encadenamiento
     */
    init(): Search;
    /**
     * Ejecuta una búsqueda y renderiza los resultados.
     * @param {string} [searchTerm] - Término de búsqueda (usa this.searchTerm si no se proporciona)
     * @param {boolean} [isEvent=false] - Si fue iniciado por evento del usuario
     * @returns {Promise<Search>} Instancia actual para encadenamiento
     */
    draw(searchTerm?: string, isEvent?: boolean): Promise<Search>;
    /**
     * Procesa la paginación en modo scroll infinito.
     * @returns {void}
     */
    processInfiniteScroll(): void;
    /**
     * Registra un listener para un evento.
     * @param {string} eventName - Nombre del evento (ej: "search", "pageChange")
     * @param {Function} callback - Función a ejecutar cuando se emite el evento
     * @returns {EventEmitter} - {@link EventEmitter} para poder concatenar métodos
     */
    on<K extends keyof Types.SearchEventMap>(eventName: K, callback: (data: Types.SearchEventMap[K]) => void): EventEmitter<Types.SearchEventMap>;
    /**
     * Genera la clave de caché para una búsqueda en particular y una página determinada.
     * @param {string} searchTerm - Término de búsqueda
     * @param {number} page - Número de página
     * @returns {string} Clave de caché
     */
    getCacheKey(searchTerm: string, page: number): string;
    /**
     * Ordena los datos por un campo específico.
     * @param {string} field - Campo por el cual se va a ordenar los datos.
     * @param {'asc'|'desc'} [order='asc'] - Orden de ordenamiento. Por defecto, 'asc' (ascendente).
     * @returns {Search} - La instancia actual de {@link Search} para encadenar métodos.
     */
    sort(field: string, order?: 'asc' | 'desc'): Search;
    /**
     * Elimina el orden actual y reinicia a orden natural.
     * @returns {Search} - La instancia actual de {@link Search} para encadenar métodos.
     */
    clearSort(): Search;
    /**
     * Configura la delegación de eventos en el contenedor principal.
     * Todos los eventos de interacción (focus, blur, click, keyboard, input)
     * se manejan en el contenedor <search> usando event delegation.
     *
     * @return {Search} - The current instance for chaining methods.
     */
    setupEventDelegation(): Search;
    clear(): Search;
    /**
     * Destruye la instancia de Search, limpiando recursos y event listeners.
     * Emite el evento 'destroy' antes de limpiar.
     * No elimina el HTML del DOM, solo limpia las referencias internas.
     *
     * @public
     * @returns {void}
     * @fires Search#destroy - Se emite antes de destruir la instancia
     *
     * @example
     * search.destroy();
     */
    destroy(): void;
}
export { Search };
//# sourceMappingURL=app.d.ts.map