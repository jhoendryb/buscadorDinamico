import {
    createElement,
    searchingLocal,
    searchingServer,
    LRUCache,
    EventEmitter,
    Pagination,
    SearchRenderer,
    Constants,
    Types
} from './index';

class Search {
    // Declaraciones de propiedades
    element: string;
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
    renderer: any;
    cache: any;
    events: any;
    pagination: any;
    scrollObserver: IntersectionObserver | null;
    t: Types.TranslationCache;
    fetch?: Types.FetchConfig;
    isExtractData?: () => void | undefined;
    searching: (searchTerm: string, isEvent: boolean) => Promise<void> = async () => { };
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
        this.zIndex = Constants.DEFAULT_Z_INDEX;
        this.sortOrder = Constants.SORT_ORDER;
        this.itemsPerPage = Constants.DEFAULT_ITEMS_PER_PAGE;
        this.debounceTime = Constants.DEFAULT_DEBOUNCE_TIME;
        this.cacheMaxSize = Constants.DEFAULT_CACHE_MAX_SIZE;
        this.cacheTtlSeconds = Constants.DEFAULT_CACHE_TTL;
        this.dom = Constants.DOM_ORDERS.SEARCH_CONTENT_ITEMS_PAGINATION;
        this.selectedIndex = Constants.NO_SELECTION;

        Object.assign(this, newParams);

        this.scrollObserver = null;
        this._ajaxResponse = {};

        this.renderer = new SearchRenderer({
            content: document.querySelector(this.element) as HTMLElement, // ".input-search" - contenedor que contiene la app Search
            contentSearch: undefined, // ".app-search" - contenedor del Search
            inputSearch: undefined, // "#filter-search" - input donde se escribe la búsqueda
            renderItems: undefined, // ".items-search" - elemento donde se muestran los items
            paginationItems: undefined // ".index-search" - elemento donde se muestra la paginación
        }, this.#getUniqueClassName.bind(this));
        this.cache = new LRUCache(this.cacheMaxSize, this.cacheTtlSeconds);
        this.events = new EventEmitter();
        this.pagination = new Pagination(this.itemsPerPage, Constants.FIRST_PAGE);
        this.pagination.setCountFunction(() => {
            return this.procesServer ? this._ajaxResponse.success.countPage : this._data?.length;
        });
        this.pagination.setDataItemsFunction((): Record<string, any>[] => {
            return this._data || [];
        });

        this.t = { ...Search.#defaultTranslations, ...translation };

        if (!this.element) {
            throw new Error("El parámetro 'element' es requerido");
        }

        if (typeof this.element !== 'string') {
            throw new Error("El parámetro 'element' debe ser un string con el selector CSS");
        }

        if (this.procesServer && !this.fetch?.url) {
            throw new Error("El parámetro 'fetch.url' es requerido cuando procesServer es true");
        }

        if (this.itemsPerPage) {
            if (typeof this.itemsPerPage !== 'number') {
                throw new Error("El parámetro 'itemsPerPage' debe ser un número");
            }
            if (this.itemsPerPage < 1) {
                throw new Error("El parámetro 'itemsPerPage' debe ser mayor a 0");
            }
        }

        this._data = this.data;

        const element = this.renderer.body.content;

        if (!element) {
            let msgError = `No existe el contenedor ${this.element}`
            throw new Error(msgError)
        }

        Object.assign(this, (this.procesServer ? searchingServer : searchingLocal))
    }
    /**
     * Inicializa el componente Search.
     * @returns {Search} Instancia para encadenamiento
     */
    init(): Search {
        if (!this.procesServer && typeof this.isExtractData === 'function') {
            this.isExtractData();
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
    }
    /**
     * Ejecuta una búsqueda y renderiza los resultados.
     * @param {string} [searchTerm] - Término de búsqueda (usa this.searchTerm si no se proporciona)
     * @param {boolean} [isEvent=false] - Si fue iniciado por evento del usuario
     * @returns {Promise<void>} Promesa que se resuelve cuando termina el renderizado
     */
    async draw(searchTerm: string = this.searchTerm, isEvent: boolean = false): Promise<Search> {
        // Resetear scroll si cambia el término de búsqueda
        if (searchTerm !== this.searchTerm && this.renderer.body.renderItems) {
            this.renderer.body.renderItems.scrollTop = 0;
            this.renderer.body.renderItems.innerHTML = '';
            this.pagination.goToPage(1);
        }

        await this.searching(searchTerm, isEvent);

        this.processInfiniteScroll();

        return this;
    }
    /**
     * Procesa la paginación en modo scroll infinito.
     * @returns {void}
     */
    processInfiniteScroll(): void {
        if (!this.pagination) return;

        const next = this.pagination.getPageItems(this.procesServer ? null : this._data);

        // Si es la primera página, renderizar items
        if (this.pagination.getCurrentPage() === 1) {
            this.renderer.renderItemsContent(
                next,
                this.template,
                this.t.noResults,
                this.events
            );
        } else {
            // Si es una página adicional, añadir items
            this.renderer.appendItems(
                next,
                this.template,
                this.t.noResults,
                this.events
            );
        }

        // Actualizar contador
        const loaded = this.pagination.getTotalLoaded();
        const total = this.pagination.getTotalItems();
        this.renderer.updateCounter(loaded, total);

        // Configurar detector de scroll
        this.#setupScrollDetection();

        this.events.emit('pageChange', {
            page: this.pagination.getCurrentPage(),
            totalPages: this.pagination.getTotalPages(),
            itemsOnPage: next.length,
            totalLoaded: loaded
        } as Types.PageChangeEventData);
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

        // Remover detector anterior si existe
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
        }

        // Remover sentinel anterior si existe
        const existingSentinel = container.querySelector('.scroll-sentinel');
        if (existingSentinel) {
            existingSentinel.remove();
        }

        // Usar Intersection Observer para detectar scroll al final
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
        if (!this.pagination.hasMorePages()) return this;

        // Mostrar indicador de carga
        this.#showLoadingMore();

        const nextPage = this.pagination.loadNextPage();

        if (this.procesServer) {
            if (this.fetch?.body) {
                this.fetch.body.page = nextPage;
            }
            await this.searching(this.searchTerm, false);

            // Reconfigurar detector de scroll para el nuevo contenido
            this.#setupScrollDetection();
        } else {
            // En modo local, usar datos ya cargados
            const next = this.pagination.getPageItems(this._data);
            this.renderer.appendItems(
                next,
                this.template,
                this.t.noResults,
                this.events
            );

            // Reconfigurar detector de scroll para el nuevo contenido
            this.#setupScrollDetection();
        }

        // Actualizar contador
        const loaded = this.pagination.getTotalLoaded();
        const total = this.pagination.getTotalItems();
        this.renderer.updateCounter(loaded, total);

        // Ocultar indicador de carga
        this.#hideLoadingMore();

        // Si no hay más páginas, ocultar botón de cargar más
        if (!this.pagination.hasMorePages()) {
            const loadMoreButton = this.renderer.body.paginationItems?.querySelector('.load-more-button') as HTMLButtonElement;
            if (loadMoreButton) {
                loadMoreButton.style.display = 'none';
            }
        }

        return this;
    }
    /**
     * Muestra indicador de carga al cargar más items.
     * @returns {void}
     */
    #showLoadingMore(): Search {
        const loadMoreButton = this.renderer.body.paginationItems?.querySelector('.load-more-button') as HTMLButtonElement;
        if (loadMoreButton) {
            loadMoreButton.textContent = 'Cargando...';
            loadMoreButton.disabled = true;
        }
        return this;
    }
    /**
     * Oculta indicador de carga al cargar más items.
     * @returns {void}
     */
    #hideLoadingMore(): Search {
        const loadMoreButton = this.renderer.body.paginationItems?.querySelector('.load-more-button') as HTMLButtonElement;
        if (loadMoreButton) {
            loadMoreButton.textContent = 'Cargar más...';
            loadMoreButton.disabled = false;
        }
        return this;
    }
    /**
     * Limpia el detector de scroll.
     * @returns {void}
     */
    #cleanupScrollDetection(): Search {
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
            this.scrollObserver = null;
        }
        return this;
    }
    /**
     * Genera un nombre de clase CSS único basado en el selector del elemento.
     * @param {string} baseClass - Clase base (ej: "input-search")
     * @returns {string} Nombre de clase único (ej: "input-search-mi-buscador")
     * @private
     */
    #getUniqueClassName(baseClass: string): string {
        const parentSelector = this.element.replace(/^\.|^\#/, '');
        return `${baseClass}-${parentSelector}`;
    }
    /**
     * Registra un listener para un evento.
     * @param {string} eventName - Nombre del evento (ej: "search", "pageChange")
     * @param {Function} callback - Función a ejecutar cuando se emite el evento
     * @returns {{off: Function}} Objeto con método off para remover el listener
     */
    on(eventName: string, callback: Function): EventEmitter {
        return this.events.on(eventName, callback);
    }
    /**
     * Muestra el indicador de carga.
     * @returns {void}
     */
    showLoading(): Search {
        if (this.renderer.body.renderItems) {
            const loading = createElement({
                element: "div",
                className: `search-loading`,
                children: [
                    {
                        element: "div",
                        className: `spinner`
                    },
                    {
                        element: "p",
                        textContent: this.t.loading
                    }
                ]
            });
            this.renderer.body.renderItems.innerHTML = loading.outerHTML;
        }

        return this;
    }
    /**
     * Genera una clave única para el caché basada en el término de búsqueda y página.
     * @param {string} searchTerm - Término de búsqueda
     * @param {number} page - Página actual
     * @returns {string} Clave única para el caché
     */
    getCacheKey(searchTerm: string, page: number): string {
        return `${searchTerm}_${page}`;
    }
    /**
     * Ordena los datos por un campo específico.
     * @param {string} field - Campo por el cual ordenar
     * @param {'asc'|'desc'} [order='asc'] - Orden de ordenamiento
     * @returns {void}
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
     * @returns {Search} Instancia actual para encadenamiento
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
     * Configura la navegación por teclado para el componente.
     * Habilita las siguientes teclas:
     * - ArrowUp/ArrowDown: Navegar entre items
     * - ArrowLeft/ArrowRight: Navegar entre páginas
     * - Enter: Seleccionar item destacado
     * 
     * Requiere que keyboardEnabled sea true.
     * 
     * @public
     * @returns {Search} Instancia actual para encadenamiento
     */
    setupKeyboardNavigation(): Search {
        if (!this.keyboardEnabled) return this;

        const content = this.renderer.body.content;
        content.addEventListener('keydown', (e: KeyboardEvent) => {
            const contentItems = this.renderer.body.renderItems;
            if (!contentItems) return;

            const items = contentItems.querySelectorAll('.items') as any;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                this.#highlightItem(items);
                this.renderer.showResults();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.#highlightItem(items);
                this.renderer.showResults();
            } else if (e.key === 'Enter' && this.selectedIndex >= 0) {
                e.preventDefault();
                this.#selectItem(items[this.selectedIndex]);
                this.renderer.hideResults();
            }
        });

        return this;
    }
    /**
     * Destaca el item seleccionado agregando la clase 'selected'.
     * Remueve la clase de todos los demás items.
     * 
     * @private
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
                this.events.emit('itemHighlighted', { item, index } as Types.ItemHighlightedEventData);
            } else {
                item.classList.remove('selected');
            }
        });
    }
    /**
     * Selecciona un item y emite el evento 'itemSelected'.
     * 
     * @private
     * @param {HTMLElement} item - Elemento DOM del item a seleccionar
     * @returns {void}
     * @fires Search#itemSelected - Se emite cuando se selecciona un item
     * 
     * @example
     * this.#selectItem(items[0]);
     */
    #selectItem(item: Record<string, any>): void {
        this.events.emit('itemSelected', { item, index: this.selectedIndex } as Types.ItemSelectedEventData);
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

        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
            this.scrollObserver = null;
        }

        this.#cleanupScrollDetection();

        if (this.renderer.animationTimeouts) {
            this.renderer.animationTimeouts.forEach((timeout: any) => clearTimeout(timeout));
            this.renderer.animationTimeouts = [];
        }

        if (this.renderer.hideTimeout) {
            clearTimeout(this.renderer.hideTimeout);
            this.renderer.hideTimeout = null;
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
        this.cache = null;
        this.pagination = null;
        this.events = null;
        this.renderer = null;
    }
}

export { Search };