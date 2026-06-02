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
} from './index.js';

class Search {
    /**
     * Una instancia de `LRUCache<string, string>` que almacena las traducciones predeterminadas.
     * @type {Types.TranslationCache}
     */
    static #defaultTranslations = Constants.DEFAULT_TRANSLATIONS;
    /**
     * Crea una instancia de Search.
     * @param {Types.SearchParams} params - Parámetros de configuración
     */
    constructor(params) {
        const { translation, ...newParams } = params;

        this.data = [];
        this.procesServer = false;
        this.searchTerm = "";
        this._ajaxResponse = {};
        this.sortBy = null;
        this.sortOrder = Constants.SORT_ORDER;
        this.keyboardEnabled = false;
        this.template = null;
        this.cacheEnabled = false;
        this.itemsPerPage = Constants.DEFAULT_ITEMS_PER_PAGE;
        this.debounceTime = Constants.DEFAULT_DEBOUNCE_TIME;
        this.cacheMaxSize = Constants.DEFAULT_CACHE_MAX_SIZE;
        this.selectedIndex = Constants.NO_SELECTION;
        this.dom = Constants.DOM_ORDERS.SEARCH_ITEMS_PAGINATION; // 's': Search, 'i': Items, 'p': Pagination

        Object.assign(this, newParams);

        this.renderer = new SearchRenderer({
            content: document.querySelector(this.element), // ".input-search" - contenedor que contiene la app Search
            contentSearch: undefined, // ".app-search" - contenedor del Search
            inputSearch: undefined, // "#filter-search" - input donde se escribe la búsqueda
            renderItems: undefined, // ".items-search" - elemento donde se muestran los items
            paginationItems: undefined // ".index-search" - elemento donde se muestra la paginación
        }, this.#getUniqueClassName.bind(this));
        this.cache = new LRUCache(this.cacheMaxSize);
        this.events = new EventEmitter();
        this.pagination = new Pagination(this.itemsPerPage, Constants.FIRST_PAGE);
        this.pagination.setCountFunction(() => {
            return this.procesServer ? this._ajaxResponse.success.countPage : this._data.length;
        });
        this.pagination.setDataItemsFunction(() => {
            return this._data;
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
            alert(msgError)
            throw new Error(msgError)
        }

        Object.assign(this, (this.procesServer ? searchingServer : searchingLocal))

        this.events.emit('init', {
            searchTerm: this.searchTerm,
            itemsPerPage: this.itemsPerPage,
            procesServer: this.procesServer
        });
    }
    init() {
        if (!this.procesServer) this.isExtractData();

        this.renderer.renderByDom(this.dom, {
            search: {
                onInput: (searchTerm, isEvent) => this.draw(searchTerm, isEvent),
                debounceTime: this.debounceTime,
                placeholder: this.t.searchPlaceholder,
                ariaLabel: this.t.searchLabel
            }
        });

        this.setupKeyboardNavigation();

        this.draw(this.searchTerm);

        console.log('Init Search', this._data);
        return this;
    }
    async draw(searchTerm = this.searchTerm, isEvent = false) {
        await this.searching(searchTerm, isEvent);

        if (this.renderer.body.paginationItems) {
            this.processPagination();
        }
    }
    #getUniqueClassName(baseClass) {
        const parentSelector = this.element.replace(/^\.|^\#/, '');
        return `${baseClass}-${parentSelector}`;
    }
    _renderItems(data) {
        return this.renderer.renderItemsContent(
            data,
            this.template,
            this.t.noResults,
            this.events
        );
    }
    processPagination() {
        const contentPagination = this.renderer.body.paginationItems;
        const pagination = contentPagination.querySelector(".pagination");

        pagination.innerHTML = "";
        const buttonsPaginations = {
            start: 1,
            prev: this.pagination.getCurrentPage() - 1,
            current: this.pagination.getCurrentPage(),
            next: this.pagination.getCurrentPage() + 1,
            end: this.pagination.getTotalPages(),
        };

        Object.keys(buttonsPaginations).forEach((key) => {
            if (key === "prev" && buttonsPaginations[key] <= 1) return;
            if (key === "start" && buttonsPaginations[key] === buttonsPaginations.current) return;
            if (key === "end" && buttonsPaginations[key] === buttonsPaginations.current) return;
            if (key === "next" && buttonsPaginations[key] >= this.pagination.getTotalPages()) return;

            const jsonElement = {
                element: "li",
                className: key === "current" ? `page-selected ${key}` : key,
                children: key === "current"
                    ? [{ element: "span", textContent: buttonsPaginations[key], attributes: { 'aria-current': 'page' } }]
                    : [{
                        element: "button",
                        textContent: buttonsPaginations[key],
                        attributes: {
                            'aria-label': `Ir a página ${buttonsPaginations[key]}`
                        },
                        event: {
                            click: () => {
                                this.pagination.goToPage(buttonsPaginations[key]);
                                if (this.procesServer) {
                                    this.fetch.body.page = buttonsPaginations[key];
                                    this.draw(this.searchTerm);
                                    return;
                                }
                                this.processPagination()
                            }
                        }
                    }]
            };

            const li = createElement(jsonElement);
            pagination.appendChild(li);
        });

        const next = this.pagination.getPageItems(this.procesServer ? null : this._data);

        this._renderItems(next);

        this.events.emit('pageChange', {
            page: this.pagination.getCurrentPage(),
            totalPages: this.pagination.getTotalPages(),
            itemsOnPage: next.length
        });
    }
    on(eventName, callback) {
        return this.events.on(eventName, callback);
    }
    showLoading() {
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
    }
    getCacheKey(searchTerm, page) {
        return `${searchTerm}_${page}`;
    }
    sort(field, order = 'asc') {
        this.sortBy = field;
        this.sortOrder = order;
        if (this.procesServer) {
            this.draw(this.searchTerm, true);
        } else {
            this._data.sort((a, b) => {
                const valA = a[field];
                const valB = b[field];
                if (valA < valB) return order === 'asc' ? Constants.SORT_ASC : Constants.SORT_DESC;
                if (valA > valB) return order === 'asc' ? Constants.SORT_DESC : Constants.SORT_ASC;
                return 0;
            });
        }
        this.events.emit('sortChange', { field, order });
        return this;
    }
    clearSort() {
        this.sortBy = null;
        this.sortOrder = 'asc';

        if (this.procesServer) {
            this.fetch.body.sortBy = null;
            this.fetch.body.sortOrder = 'asc';
        }

        this.cache.clear();
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
     * @returns {void}
     * 
     * @example
     * search.keyboardEnabled = true;
     * search.setupKeyboardNavigation();
     */
    setupKeyboardNavigation() {
        if (!this.keyboardEnabled) return;

        const content = this.renderer.body.content;
        content.addEventListener('keydown', (e) => {
            const contentItems = this.renderer.body.renderItems;
            if (!contentItems) return;

            const items = contentItems.querySelectorAll('.items');
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const keyName = (e.key === 'ArrowLeft' ? 'prev' : 'next');
                const btnPagination = this.renderer.body.paginationItems.querySelector(`.${keyName} button`);
                if (!btnPagination) {
                    const btn = keyName === 'prev' ? 'start' : 'end';
                    if (btn === "start" && this.pagination.getCurrentPage() <= 1) return;
                    if (btn === "end" && this.pagination.getCurrentPage() >= this.pagination.getTotalPages()) return;
                    const btnStart = this.renderer.body.paginationItems.querySelector(`.${btn} button`);
                    btnStart.click();
                    return;
                }
                btnPagination.click();
                return;
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                this.highlightItem(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.highlightItem(items);
            } else if (e.key === 'Enter' && this.selectedIndex >= 0) {
                e.preventDefault();
                this.selectItem(items[this.selectedIndex]);
            }
        });
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
     * this.highlightItem(items);
     */
    highlightItem(items) {
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                this.events.emit('itemHighlighted', { item, index });
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
     * this.selectItem(items[0]);
     */
    selectItem(item) {
        this.events.emit('itemSelected', { item, index: this.selectedIndex });
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
    destroy() {
        this.events.emit('destroy', { timestamp: new Date().toISOString() });

        if (this._body?.inputSearch) {
            const newInput = this.renderer.body.inputSearch.cloneNode(true);
            this.renderer.body.inputSearch.parentNode.replaceChild(newInput, this.renderer.body.inputSearch);
        }

        // Limpiar eventos del EventEmitter
        this.events.removeAllListeners();

        this._body = null;
        this._data = null;
        this.data = null;
        this.pagination = null;
        this.events = null;
        this.cache = null;
    }
}

export { Search };