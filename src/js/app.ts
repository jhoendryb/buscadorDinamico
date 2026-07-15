import {
    createElement,
    SearchingLocal,
    SearchingServer,
    LRUCache,
    EventEmitter,
    Pagination,
    SearchRenderer,
    SearchError,
    ErrorCode,
    ErrorHandler,
    Constants,
    Types
} from './index';

class Search {
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
    private errorHandler: ErrorHandler;
    private searchingLocal: SearchingLocal;
    private searchingServer: SearchingServer;
    private boundKeydownHandler: (e: KeyboardEvent) => void;
    private boundClickHandler: (e: Event) => void;
    private currentDrawId: number = 0;
    private isLoadingMore: boolean = false;
    /**
     * Instancia que almacena las traducciones predeterminadas.
     * @type {Types.TranslationCache}
     */
    static #defaultTranslations: Types.TranslationCache = Constants.DEFAULT_TRANSLATIONS;
    /**
     * Crea una instancia de Search.
     * @param {Types.SearchParams} params - Parámetros de configuración
     */
    constructor(params: Types.SearchParams) {
        const { translation, ...newParams } = params;

        this.element = undefined as unknown as string;
        this.searchTerm = "";
        this.data = [];
        this.procesServer = false;
        this.keyboardEnabled = false;
        this.cacheEnabled = false;
        this.template = null;
        this.sortBy = null;
        this.theme = Constants.DEFAULT_THEME;
        this.zIndex = Constants.DEFAULT_Z_INDEX;
        this.sortOrder = Constants.SORT_ORDER;
        this.itemsPerPage = Constants.DEFAULT_ITEMS_PER_PAGE;
        this.debounceTime = Constants.DEFAULT_DEBOUNCE_TIME;
        this.cacheMaxSize = Constants.DEFAULT_CACHE_MAX_SIZE;
        this.cacheTtlSeconds = Constants.DEFAULT_CACHE_TTL;
        this.dom = Constants.DOM_ORDERS.SEARCH_CONTENT_ITEMS_PAGINATION;
        this.selectedIndex = Constants.NO_SELECTION;
        this.developmentMode = Constants.DEFAULT_DEVELOPMENT_MODE;
        this.highlightEnabled = Constants.DEFAULT_HIGHLIGHT_ENABLED;
        this.highlightClass = "";

        Object.assign(this, newParams);

        this.boundKeydownHandler = () => { };
        this.boundClickHandler = () => { };
        this.errorHandler = ErrorHandler.getInstance(this.developmentMode);
        this.events = new EventEmitter<Types.SearchEventMap>(this.errorHandler);

        try {
            this.#validateParameters()

            this.scrollObserver = null;
            this._ajaxResponse = {};

            this.t = { ...Search.#defaultTranslations, ...translation };

            this.searchingLocal = new SearchingLocal();
            this.searchingServer = new SearchingServer(this.errorHandler, this.responseAdapter);

            this.renderer = new SearchRenderer({
                content: document.querySelector(this.element) as HTMLElement, // ".input-search" - contenedor que contiene la app Search
                contentSearch: undefined, // ".app-search" - contenedor del Search
                inputSearch: undefined, // "#filter-search" - input donde se escribe la búsqueda
                renderItems: undefined, // ".items-search" - elemento donde se muestran los items
                paginationItems: undefined, // ".index-search" - elemento donde se muestra la paginación
                counterItems: undefined // ".items-counter" - elemento donde se muestra el contador de registros
            }, this.#getUniqueClassName.bind(this), Constants.DEFAULT_TIME_HIDDEN_RESULTS);
            this.cache = new LRUCache<Types.SearchResult>(this.cacheMaxSize, this.cacheTtlSeconds);
            this.pagination = new Pagination(this.itemsPerPage, Constants.FIRST_PAGE);
            this.pagination.setCountFunction(() => {
                return this.procesServer ? this._ajaxResponse.success?.countPage || 0 : this._data?.length || 0;
            });
            this.pagination.setDataItemsFunction((): Record<string, any>[] => {
                return this._data || [];
            });
            this.pagination.onPageChangeCallback((page, totalPages) => {
                this.events.emit('pageChange', {
                    page,
                    totalPages,
                    itemsOnPage: this.pagination.getPageItems(this.procesServer ? null : this._data).length,
                    totalLoaded: this.pagination.getTotalLoaded()
                } as Types.PageChangeEventData);
            });

            this._data = this.data;
        } catch (error) {
            if (error instanceof SearchError) {
                this.errorHandler.logError(error, this.events);
            }
            throw error;
        }
    }
    /**
     * Inicializa el componente Search.
     * @returns {Search} Instancia para encadenamiento
     */
    init(): Search {
        try {
            this.errorHandler.validateElementExists(this.element, ErrorCode.ELEMENT_NOT_FOUND);

            this.renderer.setTheme(this.theme);

            if (!this.procesServer) {
                const extracted = this.searchingLocal.isExtractData(this.renderer.body.content);
                if (extracted) {
                    this.data = extracted;
                    this._data = this.data;
                }
            }

            this.renderer.renderByDom(this.dom, {
                zIndex: this.zIndex,
                search: {
                    onInput: (searchTerm: string, isEvent: boolean) => this.draw(searchTerm, isEvent),
                    debounceTime: this.debounceTime,
                    placeholder: this.t.searchPlaceholder,
                    ariaLabel: this.t.searchLabel
                }
            } as Types.RenderByDomOptions);

            this.setupKeyboardNavigation();

            this.draw(this.searchTerm);

            this.events.emit('init', {
                searchTerm: this.searchTerm,
                itemsPerPage: this.itemsPerPage,
                procesServer: this.procesServer
            } as Types.SearchEventInit);

            return this;
        } catch (error) {
            if (error instanceof SearchError) {
                this.errorHandler.logError(error);
            }
            throw error;
        }
    }
    #validateParameters(): void {
        this.errorHandler.validateRequired(this.element, 'element', ErrorCode.ELEMENT_REQUIRED);
        this.errorHandler.validateType(this.element, 'string', 'element', ErrorCode.ELEMENT_TYPE_INVALID);

        if (this.procesServer) {
            this.errorHandler.validateRequired(this.fetch?.url, 'fetch.url', ErrorCode.FETCH_URL_REQUIRED);
        }

        if (this.itemsPerPage) {
            this.errorHandler.validateType(this.itemsPerPage, 'number', 'itemsPerPage', ErrorCode.ITEMSPERPAGE_TYPE_INVALID);
            this.errorHandler.validateRange(this.itemsPerPage, 1, 'itemsPerPage', ErrorCode.ITEMSPERPAGE_VALUE_INVALID);
        }

        if (this.highlightClass) {
            this.errorHandler.validateType(this.highlightClass, 'string', 'highlightClass', ErrorCode.INVALID_TYPE_FORMAT);
        }
    }
    #highlightText(text: string): string {
        if (!this.highlightEnabled || !this.searchTerm) return text;
        const escaped = this.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        return text.replace(regex, `<span class="${['search-highlight', this.highlightClass].filter(cls => cls).join(' ')}">$1</span>`);
    }
    /**
     * Ejecuta una búsqueda y renderiza los resultados.
     * @param {string} [searchTerm] - Término de búsqueda (usa this.searchTerm si no se proporciona)
     * @param {boolean} [isEvent=false] - Si fue iniciado por evento del usuario
     * @returns {Promise<Search>} Instancia actual para encadenamiento
     */
    async draw(searchTerm: string = this.searchTerm, isEvent: boolean = false): Promise<Search> {
        const drawId = ++this.currentDrawId;
        if (searchTerm !== this.searchTerm && this.renderer.body.renderItems) {
            this.renderer.body.renderItems.scrollTop = 0;
            this.renderer.body.renderItems.innerHTML = '';
            this.events.emit('resultsCleared', { previousSearchTerm: this.searchTerm } as Types.ResultsClearedEventData);
            this.renderer.body.renderItems.removeAttribute('aria-activedescendant');
            this.pagination.goToPage(1);
            this.selectedIndex = -1;
        }

        let searchResult: Types.SearchResult | null = null;

        if (this.procesServer) {
            const cacheKey = this.getCacheKey(searchTerm, this.pagination.getCurrentPage());
            const loadFetch = async () => {
                return await this.searchingServer.search(
                    searchTerm,
                    this.fetch as Types.FetchConfig,
                    this.pagination.getCurrentPage(),
                    this.itemsPerPage
                );
            };
            searchResult = this.cacheEnabled
                ? await this.cache.getOrFetch(cacheKey, loadFetch, () => this.renderer.showLoading(this.t.loading || ''))
                : await loadFetch();
            this._ajaxResponse.success = { countPage: searchResult?.countPage };
        } else {
            const filtered = this.searchingLocal.search(
                searchTerm,
                this.data,
                this.sortBy,
                this.sortOrder
            );
            searchResult = { data: filtered };
        }

        if (drawId !== this.currentDrawId) return this;

        this._data = searchResult?.data || [];
        this.searchTerm = searchTerm;

        if (isEvent) {
            this.events.emit('search', {
                searchTerm,
                results: this._data,
                totalResults: this._data.length,
                timestamp: new Date().toISOString()
            } as Types.SearchEventData);
        }

        this.processInfiniteScroll();
        this.events.emit('searchComplete', {
            searchTerm,
            results: this._data,
            totalResults: this._data?.length
        });
        return this;
    }
    /**
     * Procesa la paginación en modo scroll infinito.
     * @returns {void}
     */
    processInfiniteScroll(): void {
        if (!this.pagination) return;

        const next = this.pagination.getPageItems(this.procesServer ? null : this._data);

        this.renderer.appendItems(
            next,
            this.template,
            this.t.noResults,
            this.events,
            (this.pagination.getCurrentPage() === 1),
            this.#highlightText.bind(this)
        );

        const range = this.pagination.getRange();
        this.renderer.updateCounter({ ...range, textPagination: this.t.pagination });

        this.#setupScrollDetection();
    }
    /**
     * Configura el detector de scroll al final del contenedor.
     * @returns {Search} Instancia actual para encadenamiento
     */
    #setupScrollDetection(): Search {
        const container = this.renderer.body.renderItems;
        if (!container) return this;

        if (typeof IntersectionObserver === 'undefined') {
            console.warn('IntersectionObserver no está disponible. Scroll infinito no funcionará en este entorno.');
            return this;
        }

        const existingSentinel = container.querySelector('.scroll-sentinel');
        if (existingSentinel) {
            this.scrollObserver?.unobserve(existingSentinel);
            existingSentinel.remove();
        }

        // Usar Intersection Observer para detectar scroll al final
        if (!this.scrollObserver) {
            this.scrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && this.pagination.hasMorePages()) {
                        this.#loadMore();
                    }
                });
            }, {
                root: container,
                rootMargin: '100px', // Cargar 100px antes del final
                threshold: 0.1
            });
        }

        // Crear elemento sentinel al final
        const sentinel = createElement({
            element: "div",
            className: "scroll-sentinel",
            attributes: { 'style': 'height: 1px; visibility: hidden; padding: 0; margin: 0;' }
        });

        container.appendChild(sentinel);
        this.scrollObserver.observe(sentinel);

        return this;
    }
    /**
     * Carga más items en modo scroll infinito.
     * @returns {Promise<Search>} Instancia actual para encadenamiento
     */
    async #loadMore(): Promise<Search> {
        if (this.isLoadingMore || !this.pagination.hasMorePages()) return this;
        this.isLoadingMore = true;

        try {
            const nextPage = this.pagination.loadNextPage();

            if (this.procesServer) {
                let searchResult: Types.SearchResult | null = null;
                const cacheKey = this.getCacheKey(this.searchTerm, nextPage);
                const loadFetch = async () => await this.searchingServer.search(
                    this.searchTerm,
                    this.fetch as Types.FetchConfig,
                    this.pagination.getCurrentPage(),
                    this.itemsPerPage
                );
                searchResult = this.cacheEnabled
                    ? await this.cache.getOrFetch(cacheKey, loadFetch)
                    : await loadFetch();
                this._data = searchResult?.data || [];
                this._ajaxResponse.success = { countPage: searchResult?.countPage };
            }

            const next = this.pagination.getPageItems(this.procesServer ? null : this._data);
            this.renderer.appendItems(
                next,
                this.template,
                this.t.noResults,
                this.events,
                (this.pagination.getCurrentPage() === 1),
                this.#highlightText.bind(this)
            );

            this.#setupScrollDetection();

            // Actualizar contador
            const range = this.pagination.getRange();
            this.renderer.updateCounter({ ...range, textPagination: this.t.pagination });

            return this;
        } finally {
            this.isLoadingMore = false;
        }
    }
    /**
     * Limpia el detector de scroll.
     * @returns {void}
     */
    #cleanupScrollDetection(): Search {
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
        }
        return this;
    }
    /**
     * Genera un nombre de clase CSS único basado en el selector del elemento.
     * @param {string} baseClass - Clase base (ej: "input-search")
     * @returns {string} Nombre de clase único (ej: "input-search-mi-buscador")
     */
    #getUniqueClassName(baseClass: string): string {
        const parentSelector = this.element.replace(/^[.#]/, '');
        return `${baseClass}-${parentSelector}`;
    }
    /**
     * Registra un listener para un evento.
     * @param {string} eventName - Nombre del evento (ej: "search", "pageChange")
     * @param {Function} callback - Función a ejecutar cuando se emite el evento
     * @returns {EventEmitter} - {@link EventEmitter} para poder concatenar métodos
     */
    on<K extends keyof Types.SearchEventMap>(eventName: K, callback: (data: Types.SearchEventMap[K]) => void): EventEmitter<Types.SearchEventMap> {
        return this.events.on(eventName, callback);
    }
    /**
     * Genera la clave de caché para una búsqueda en particular y una página determinada.
     * @param {string} searchTerm - Término de búsqueda
     * @param {number} page - Número de página
     * @returns {string} Clave de caché
     */
    getCacheKey(searchTerm: string, page: number): string {
        return `${searchTerm}_${page}`;
    }
    /**
     * Ordena los datos por un campo específico.
     * @param {string} field - Campo por el cual se va a ordenar los datos.
     * @param {'asc'|'desc'} [order='asc'] - Orden de ordenamiento. Por defecto, 'asc' (ascendente).
     * @returns {Search} - La instancia actual de {@link Search} para encadenar métodos.
     */
    sort(field: string, order: 'asc' | 'desc' = 'asc'): Search {
        this.sortBy = field;
        this.sortOrder = order;
        if (this.procesServer) {
            this.draw(this.searchTerm, true);
        } else {
            this._data?.sort((a, b) => {
                const valA = a[field];
                const valB = b[field];
                if (valA < valB) return order === 'asc' ? Constants.SORT_ASC : Constants.SORT_DESC;
                if (valA > valB) return order === 'asc' ? Constants.SORT_DESC : Constants.SORT_ASC;
                return 0;
            });
        }
        this.events.emit('sortChange', { field, order } as Types.SortChangeEventData);
        return this;
    }
    /**
     * Elimina el orden actual y reinicia a orden natural.
     * @returns {Search} - La instancia actual de {@link Search} para encadenar métodos.
     */
    clearSort(): Search {
        this.sortBy = null;
        this.sortOrder = 'asc';

        if (this.procesServer) {
            if (this.fetch?.body) {
                this.fetch.body.sortBy = null;
                this.fetch.body.sortOrder = 'asc';
            }
        }

        this.cache.clear();
        return this;
    }
    /**
     * Configures keyboard navigation for the component.
     * Enables the following keys:
     * - ArrowUp/ArrowDown: Navigate between items
     * - ArrowLeft/ArrowRight: Navigate between pages
     * - Enter: Select highlighted item
     *
     * Requires that `keyboardEnabled` is true.
     *
     * @return {Search} - The current instance of {@link Search} for chaining methods.
     */
    setupKeyboardNavigation(): Search {
        if (!this.keyboardEnabled) return this;

        const content = this.renderer.body.content;
        const renderItems = this.renderer.body.renderItems;
        const input = this.renderer.body.inputSearch;
        const eventPreviu = (input?: HTMLInputElement) => {
            if (input) {
                input.value = '';
                input.dispatchEvent(new Event('input'));
                input.blur();
            }
        }

        this.boundKeydownHandler = (e: KeyboardEvent) => {
            if (!renderItems) return;

            const items = renderItems.querySelectorAll('.items') as any;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                this.#highlightItem(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.#highlightItem(items);
            } else if (['enter'].includes(e.key.toLowerCase()) && this.selectedIndex >= 0) {
                e.preventDefault();
                this.#selectItem(items[this.selectedIndex]);
                eventPreviu(input as HTMLInputElement);
            }
        };
        this.boundClickHandler = (e: Event) => {
            e.preventDefault();
            if (!renderItems) return;

            const item = (e.target as HTMLElement).closest('.items');
            const items = renderItems.querySelectorAll('.items') as any;
            if (item) {
                this.selectedIndex = Array.from(items).indexOf(item);
                this.#highlightItem(items);
                this.#selectItem(item);
                eventPreviu(input as HTMLInputElement);
            }
        };

        renderItems?.addEventListener('click', this.boundClickHandler);

        content.addEventListener('keydown', this.boundKeydownHandler);

        return this;
    }
    /**
     * Destaca el item seleccionado agregando la clase 'selected'.
     * Remueve la clase de todos los demás items.
     * 
     * @param {NodeList} items - Lista de items del DOM
     * @returns {void}
     * @fires Search#itemHighlighted - Se emite cuando se destaca un item
     * 
     * @example
     * this.#highlightItem(items);
     */
    #highlightItem(items: Record<string, any>[]): void {
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                this.renderer.body.renderItems?.setAttribute('aria-activedescendant', item.id);
                item.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
                this.events.emit('itemHighlighted', { item, index } as Types.ItemHighlightedEventData);
            } else {
                item.classList.remove('selected');
            }
        });
    }
    /**
     * Selecciona un item y emite el evento 'itemSelected'.
     * 
     * @param {HTMLElement} item - Elemento DOM del item a seleccionar
     * @returns {void}
     * @fires Search#itemSelected - Se emite cuando se selecciona un item
     * 
     * @example
     * this.#selectItem(items[0]);
     */
    #selectItem(item: Record<string, any>): void {
        this.events.emit('itemSelected', { item, index: this.selectedIndex, close: () => this.renderer.hideResults() } as Types.ItemSelectedEventData);
    }
    clear(): Search {
        this.searchTerm = "";
        if (this.renderer.body.inputSearch) {
            (this.renderer.body.inputSearch as HTMLInputElement).value = "";
        }
        if (this.renderer.body.renderItems) {
            this.renderer.body.renderItems.innerHTML = "";
        }
        this.pagination.goToPage(1);
        this.cache.clear();
        this.selectedIndex = Constants.NO_SELECTION;
        return this;
    }
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
    destroy(): void {
        this.events.emit('destroy', { timestamp: new Date().toISOString() } as Types.DestroyEventData);

        this.renderer.body.content.removeEventListener('keydown', this.boundKeydownHandler);
        this.renderer.body.renderItems?.removeEventListener('click', this.boundClickHandler);

        if (this.scrollObserver) {
            this.#cleanupScrollDetection();
            this.scrollObserver = null;
        }

        if (this.renderer.body.inputSearch) {
            const newInput = this.renderer.body.inputSearch.cloneNode(true);
            if (this.renderer.body.inputSearch.parentNode) {
                this.renderer.body.inputSearch.parentNode.replaceChild(newInput, this.renderer.body.inputSearch);
            }
        }

        this.events.removeAllListeners();

        this._data = null;
        this.data = [];
        this.cache = new LRUCache(this.cacheMaxSize, this.cacheTtlSeconds);
        this.pagination.reset();
        this.events = new EventEmitter();
        this.renderer.destroy();
    }
}

export { Search };