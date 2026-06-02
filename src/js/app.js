import { createElement } from './renderElement.js'
import { searchingLocal, searchingServer } from './searchngHandle.js'
import { LRUCache } from './cache/index.js';
import { EventEmitter } from './events/index.js';
import { Pagination } from './pagination/index.js';
import { SearchRenderer } from './renderer/index.js';

class Search {
    /**
     * Traducciones por defecto para la interfaz de usuario.
     * @private
     * @static
     * @type {Object}
     * @property {string} searchLabel - Etiqueta para el input de búsqueda
     * @property {string} searchPlaceholder - Placeholder del input
     * @property {string} noResults - Mensaje cuando no hay resultados
     * @property {string} loading - Mensaje de carga
     */
    static #defaultTranslations = {
        searchLabel: 'Filtrar por Búsqueda',
        searchPlaceholder: 'Ingrese palabra clave...',
        noResults: 'No se encontraron resultados',
        loading: 'Buscando...'
    };
    /**
     * Cantidad por defecto de items por página.
     * @private
     * @static
     * @type {number}
     * @default 10
     */
    static #DEFAULT_ITEMS_PER_PAGE = 10;
    /**
     * Tiempo por defecto de debounce en milisegundos.
     * @private
     * @static
     * @type {number}
     * @default 500
     */
    static #DEFAULT_DEBOUNCE_TIME = 500;
    /**
     * Tamaño máximo por defecto del caché.
     * @private
     * @static
     * @type {number}
     * @default 50
     */
    static #DEFAULT_CACHE_MAX_SIZE = 50;
    /**
     * Valor que indica que no hay item seleccionado.
     * @private
     * @static
     * @type {number}
     * @default -1
     */
    static #NO_SELECTION = -1;
    /**
     * Número de la primera página.
     * @private
     * @static
     * @type {number}
     * @default 1
     */
    static #FIRST_PAGE = 1;
    /**
     * Valor para ordenamiento ascendente.
     * @private
     * @static
     * @type {number}
     * @default -1
     */
    static #SORT_ASC = -1;
    /**
     * Valor para ordenamiento descendente.
     * @private
     * @static
     * @type {number}
     * @default 1
     */
    static #SORT_DESC = 1;

    /**
     * Crea una instancia del componente Search con las configuraciones especificadas.
    * 
    * @public
    * @param {Object} params - Objeto de configuración del componente
    * @param {string} params.element - Selector CSS del contenedor donde se renderizará el componente (requerido)
    * @param {Array} [params.data] - Array de datos para búsqueda en modo local
    * @param {boolean} [params.procesServer=false] - Si es true, usa búsqueda en servidor vía AJAX
    * @param {number} [params.itemsPerPage=10] - Cantidad de items por página
    * @param {number} [params.debounceTime=500] - Tiempo de debounce en milisegundos para la búsqueda
    * @param {boolean} [params.cacheEnabled=false] - Si es true, habilita caché de resultados
    * @param {number} [params.cacheMaxSize=50] - Tamaño máximo del caché
    * @param {string} [params.sortBy] - Campo por el cual ordenar los resultados
    * @param {'asc'|'desc'} [params.sortOrder='asc'] - Orden de clasificación (ascendente o descendente)
    * @param {boolean} [params.keyboardEnabled=false] - Si es true, habilita navegación por teclado
    * @param {string|Function} [params.template] - Template personalizado para renderizar items (string o función)
    * @param {string} [params.dom='sip'] - Orden de renderizado: 's'=search, 'i'=items, 'p'=pagination
    * @param {Object} [params.translation] - Objeto con traducciones personalizadas
    * @param {string} [params.translation.searchLabel] - Etiqueta para el input de búsqueda
    * @param {string} [params.translation.searchPlaceholder] - Placeholder del input
    * @param {string} [params.translation.noResults] - Mensaje cuando no hay resultados
    * @param {string} [params.translation.loading] - Mensaje de carga
    * @param {Object} [params.fetch] - Configuración para búsqueda en servidor
    * @param {string} params.fetch.url - URL del endpoint de búsqueda
    * @param {'GET'|'POST'} [params.fetch.method='POST'] - Método HTTP
    * @param {Object} [params.fetch.body] - Cuerpo de la petición
    * @throws {Error} Si el parámetro 'element' no es proporcionado
    * @throws {Error} Si el parámetro 'element' no es un string
    * @throws {Error} Si 'procesServer' es true y 'fetch.url' no es proporcionado
    * @throws {Error} Si 'itemsPerPage' no es un número
    * @throws {Error} Si 'itemsPerPage' es menor a 1
    * @throws {Error} Si el contenedor especificado no existe en el DOM
    * 
    * @example
    * const search = new Search({
    *     element: '.app-search',
    *     data: [{ name: 'Juan' }, { name: 'Maria' }],
    *     itemsPerPage: 10,
    *     debounceTime: 300,
    *     keyboardEnabled: true
    * });
    */
    constructor(params) {
        const { translation, ...newParams } = params;

        this.data = [];
        this.procesServer = false;
        this.searchTerm = "";
        this.itemsPerPage = Search.#DEFAULT_ITEMS_PER_PAGE;
        this._ajaxResponse = {};
        this.debounceTime = Search.#DEFAULT_DEBOUNCE_TIME;
        this.cacheEnabled = false;
        this.cacheMaxSize = Search.#DEFAULT_CACHE_MAX_SIZE;
        this.sortBy = null;
        this.sortOrder = 'asc';
        this.selectedIndex = Search.#NO_SELECTION;
        this.keyboardEnabled = false;
        this.template = null;
        this.dom = 'sip'; // 's': Search, 'i': Items, 'p': Pagination

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
        this.pagination = new Pagination(this.itemsPerPage);
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
    /**
     * Inicializa el componente Search, renderiza los elementos y realiza la búsqueda inicial.
     * Este método debe llamarse después de crear una instancia de Search.
     * 
     * @public
     * @returns {Search} Retorna la instancia actual para permitir encadenamiento (chaining)
     * @throws {Error} Si el elemento contenedor no existe en el DOM
     * 
     * @example
     * const search = new Search({ element: '.app-search' });
     * search.init();
     * 
     * @example
     * // Con chaining
     * const search = new Search({ element: '.app-search' })
     *     .init()
     *     .sort('name', 'asc');
     */
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
    /**
     * Ejecuta una búsqueda y renderiza los resultados y paginación.
     * Este método combina searching() y processPagination() en una sola operación.
     * 
     * @public
     * @param {string} [searchTerm=this.searchTerm] - Término de búsqueda a filtrar
     * @param {boolean} [isEvent=false] - Indica si la búsqueda fue iniciada por un evento del usuario
     * @returns {Promise<void>} Una promesa que se resuelve cuando la búsqueda y renderizado completan
     * 
     * @example
     * await search.draw('juan');
     * 
     * @example
     * // Con chaining
     * await search.sort('name', 'asc').draw('juan');
     */
    async draw(searchTerm = this.searchTerm, isEvent = false) {
        await this.searching(searchTerm, isEvent);

        if (this.renderer.body.paginationItems) {
            this.processPagination();
        }
    }
    /**
     * Genera un nombre de clase único combinando la base con el selector del elemento padre.
     * Esto evita conflictos de nombres cuando hay múltiples instancias de Search en la página.
     * 
     * @private
     * @param {string} baseClass - Clase base para generar el nombre único
     * @returns {string} Nombre de clase único en formato "baseClass-parentSelector"
     * 
     * @example
     * // Si element es '.app-search'
     * this.#getUniqueClassName('input-search'); // "input-search-app-search"
     */
    #getUniqueClassName(baseClass) {
        // Obtener el selector del padre sin el punto inicial
        const parentSelector = this.element.replace(/^\.|^\#/, '');
        // Crear clase única combinando la base con el selector del padre
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
    /**
     * Procesa y renderiza los botones de paginación.
     * Calcula qué botones mostrar según la página actual y total de páginas.
     * Renderiza los items correspondientes a la página actual.
     * 
     * @public
     * @returns {void}
     * @fires Search#pageChange - Se emite cuando cambia la página
     * 
     * @example
     * search.processPagination();
     */
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
    /**
     * Muestra un indicador de carga en el contenedor de items.
     * Reemplaza el contenido actual con un spinner y mensaje de carga.
     * 
     * @public
     * @returns {void}
     * 
     * @example
     * search.showLoading();
     */
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
    /**
     * Ordena los resultados por un campo específico.
     * 
     * @public
     * @param {string} field - Nombre del campo por el cual ordenar
     * @param {'asc'|'desc'} [order='asc'] - Orden de clasificación ('asc' para ascendente, 'desc' para descendente)
     * @returns {Search} Retorna la instancia actual para permitir encadenamiento (chaining)
     * @fires Search#sortChange - Se emite cuando cambia el ordenamiento
     * 
     * @example
     * search.sort('name', 'asc');
     * 
     * @example
     * // Con chaining
     * search.sort('name', 'asc').draw();
     */
    sort(field, order = 'asc') {
        this.sortBy = field;
        this.sortOrder = order;
        if (this.procesServer) {
            this.draw(this.searchTerm, true);
        } else {
            this._data.sort((a, b) => {
                const valA = a[field];
                const valB = b[field];
                if (valA < valB) return order === 'asc' ? Search.#SORT_ASC : Search.#SORT_DESC;
                if (valA > valB) return order === 'asc' ? Search.#SORT_DESC : Search.#SORT_ASC;
                return 0;
            });
        }
        this.events.emit('sortChange', { field, order });
        return this;
    }
    /**
     * Limpia el ordenamiento actual y restaura el estado original.
     * En modo servidor, también limpia los parámetros de ordenamiento en la petición fetch.
     * 
     * @public
     * @returns {void}
     * 
     * @example
     * search.clearSort();
     */
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