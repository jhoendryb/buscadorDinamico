import { createElement } from './renderElement.js'
import { searchingLocal, searchingServer } from './searchngHandle.js'

class Search {
    #defaultTranslations = {
        searchLabel: 'Filtrar por Búsqueda',
        searchPlaceholder: 'Ingrese palabra clave...',
        noResults: 'No se encontraron resultados',
        loading: 'Buscando...'
    };

    constructor(params) {
        const { translation, ...newParams } = params;

        this.data = [];
        this.procesServer = false;
        this.searchTerm = "";
        this.itemsPerPage = 10;
        this._ajaxResponse = {};
        this.debounceTime = 500;
        this._cache = new Map();
        this.cacheEnabled = false;
        this.cacheMaxSize = 50; // Máximo 50 entradas
        this.sortBy = null;
        this.sortOrder = 'asc';
        this.selectedIndex = -1;
        this.keyboardEnabled = false;
        this.template = null;

        Object.assign(this, newParams);

        this.t = { ...this.#defaultTranslations, ...translation };

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
        this._body = {
            content: document.querySelector(this.element), // ".input-search" - contenedor que contiene la app Search
            contentSearch: undefined, // ".app-search" - contenedor del Search
            inputSearch: undefined, // "#filter-search" - input donde se escribe la búsqueda
            renderItems: undefined, // ".items-search" - elemento donde se muestran los items
            paginationItems: undefined // ".index-search" - elemento donde se muestra la paginación
        };

        const element = this._body.content;

        if (!element) {
            let msgError = `No existe el contenedor ${this.element}`
            alert(msgError)
            throw new Error(msgError)
        }

        if (!this._body.contentSearch) this.contentSearch();
        if (!this._body.inputSearch) this.renderSearch();
        if (!this._body.renderItems) this.renderItems();
        if (!this._body.paginationItems) this.renderPagination();

        Object.assign(this, (this.procesServer ? searchingServer : searchingLocal))

        this._pagination = {
            page: 1, // página actual
            countPage: () => Math.ceil(this._pagination.countItems() / this.itemsPerPage) || 1, // cantidad de páginas
            countItems: () => (this.procesServer ? this._ajaxResponse.success.countPage : this._data.length) || 0,
            next: () => {
                if (this.procesServer) return this._data;
                return {
                    start: ((this._pagination.page - 1) * this.itemsPerPage),
                    end: (this._pagination.page * this.itemsPerPage)
                }
            }
        }

        this._events = {}

        this.emit('init', {
            searchTerm: this.searchTerm,
            itemsPerPage: this.itemsPerPage,
            procesServer: this.procesServer
        });

        if (this.procesServer)
            console.log(this, "vamos a ver");
    }
    init() {
        this.setupKeyboardNavigation();

        if (this.procesServer) {
            this.searching(this.searchTerm);
            return;
        } else this.isExtractData();

        this.processPagination();

        this.searching(this.searchTerm);

        console.log('Init Search', this._data);
    }
    #getUniqueClassName(baseClass) {
        // Obtener el selector del padre sin el punto inicial
        const parentSelector = this.element.replace(/^\.|^\#/, '');
        // Crear clase única combinando la base con el selector del padre
        return `${baseClass}-${parentSelector}`;
    }
    _renderItems(data) {
        const container = this._body.renderItems;
        const jsonItem = {
            element: "div",
            className: "items",
            textContent: '',
            attributes: { 'role': 'option' }
        };

        if (!data || data.length === 0) {
            jsonItem.textContent = this.t.noResults;
            container.innerHTML = createElement(jsonItem).outerHTML;
            return;
        }

        let html;

        if (this.template) {
            if (typeof this.template === 'function') {
                html = data.map(item => this.template(item)).join('');
            } else if (typeof this.template === 'string') {
                html = data.map(item => {
                    let template = this.template;
                    Object.keys(item).forEach(key => {
                        template = template.replace(`{{${key}}}`, item[key]);
                    });
                    return template;
                }).join('');
            }
        } else {
            html = data.map(item => {
                jsonItem.textContent = Object.values(item).join(' ');
                return createElement(jsonItem).outerHTML;
            }).join('');
        }

        container.innerHTML = html;
    }
    contentSearch() {
        if (this._body.contentSearch) return;

        const element = this._body.content;

        let contentSearch = element.querySelector('.input-search');

        if (!contentSearch) {
            contentSearch = createElement({
                element: "search",
                className: "input-search" + ` ${this.#getUniqueClassName('input-search')}`,
                children: [
                    {
                        element: "label",
                        htmlFor: this.#getUniqueClassName('input-search'),
                        textContent: this.t.searchLabel
                    }
                ]
            });
            element.appendChild(contentSearch);
        }

        this._body.contentSearch = contentSearch
    }
    renderSearch() {
        if (this._body.inputSearch) return;

        const element = this._body.contentSearch;

        let inputSearch = element.querySelector('.filter-search');
        // EVITAMOS QUE SE USE POR CADA TECLA EL BUSCADOR
        // ASI LIBERAMOS UN POCO DE CARGA AL CODIGO
        let timeOut;
        //------------------

        let jsonInput = {
            element: inputSearch,
            id: this.#getUniqueClassName('input-search'),
            attributes: {
                "aria-label": this.t.searchLabel,
                "aria-autocomplete": "list",
                "role": "combobox"
            },
            event: {
                input: (e) => {
                    const searchTerm = e.target.value.trim().toLowerCase();
                    clearTimeout(timeOut);
                    timeOut = setTimeout(() => {
                        this.searching(searchTerm, e instanceof Event);
                    }, this.debounceTime);
                }
            },
            ...(!inputSearch ? {
                element: "input",
                name: this.#getUniqueClassName("filterSearch"),
                className: `form-control input-lg ${this.#getUniqueClassName("filter-search")}`,
                placeholder: this.t.searchPlaceholder,
            } : {})
        };

        inputSearch = createElement(jsonInput);

        inputSearch.setAttribute('aria-controls', this.#getUniqueClassName('items-search')); // INDICA QUE CONTROLA LA LISTA DE SUGERENCIAS

        if (jsonInput.element === "input") element.appendChild(inputSearch);

        this._body.inputSearch = inputSearch
    }
    renderItems() {
        if (this._body.renderItems) return;

        const element = this._body.content;

        let renderItems = element.querySelector('.items-search');

        if (!renderItems) {
            renderItems = createElement({
                element: "main",
                id: this.#getUniqueClassName('items-search'),
                className: `items-search scroll-personalize ${this.#getUniqueClassName("items-search")}`,
                attributes: {
                    'aria-label': 'Resultados de búsqueda',
                    'role': 'listbox',
                    'aria-activedescendant': ''
                }
            });
            element.appendChild(renderItems);
        }

        this._body.renderItems = renderItems
    }
    renderPagination() {
        if (this._body.paginationItems) return;

        const element = this._body.content;

        let paginationItems = element.querySelector('.index-search');

        if (!paginationItems) {
            paginationItems = createElement({
                element: "footer",
                className: `index-search ${this.#getUniqueClassName("index-search")}`,
                attributes: {
                    'aria-label': 'Paginación de resultados',
                    'role': 'navigation'
                },
                children: [
                    {
                        element: "ul",
                        className: `pagination ${this.#getUniqueClassName("pagination")}`
                    }
                ]
            });
            element.appendChild(paginationItems);
        }

        this._body.paginationItems = paginationItems
    }
    processPagination() {
        const contentPagination = this._body.paginationItems;
        const pagination = contentPagination.querySelector(".pagination");

        pagination.innerHTML = "";
        const buttonsPaginations = {
            start: 1,
            prev: this._pagination.page - 1,
            current: this._pagination.page,
            next: this._pagination.page + 1,
            end: this._pagination.countPage(),
        };

        Object.keys(buttonsPaginations).forEach((key) => {
            if (key === "prev" && buttonsPaginations[key] <= 1) return;
            if (key === "start" && buttonsPaginations[key] === buttonsPaginations.current) return;
            if (key === "end" && buttonsPaginations[key] === buttonsPaginations.current) return;
            if (key === "next" && buttonsPaginations[key] >= this._pagination.countPage()) return;

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
                                this._pagination.page = buttonsPaginations[key];
                                if (this.procesServer) {
                                    this.fetch.body.page = buttonsPaginations[key];
                                    this.searching(this.searchTerm);
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

        const next = this._pagination.next();
        const dataNext = (this.procesServer ? next : this._data.slice(next.start, next.end));

        this._renderItems(dataNext);

        this.emit('pageChange', {
            page: this._pagination.page,
            totalPages: this._pagination.countPage(),
            itemsOnPage: dataNext.length
        });
    }
    on(eventName, callback) {
        if (!this._events[eventName]) this._events[eventName] = [];
        this._events[eventName].push(callback);
    }
    off(eventName, callback) {
        if (!this._events[eventName]) return;
        this._events[eventName] = this._events[eventName].filter(cb => cb !== callback);
    }
    emit(eventName, data) {
        if (!this._events[eventName]) return;
        this._events[eventName].forEach(callback => callback(data));
    }
    showLoading() {
        if (this._body.renderItems) {
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
            this._body.renderItems.innerHTML = loading.outerHTML;
        }
    }
    getCacheKey(searchTerm, page) {
        return `${searchTerm}_${page}`;
    }
    addToCache(key, data) {
        if (this._cache.size >= this.cacheMaxSize) {
            const oldestKey = this._cache.keys().next().value;
            this._cache.delete(oldestKey);
        }
        this._cache.set(key, data);
    }
    getFromCache(key) {
        if (this._cache.has(key)) {
            const data = this._cache.get(key);
            this._cache.delete(key);
            this._cache.set(key, data);
            return data;
        }
        return null;
    }
    clearCache() {
        this._cache.clear();
    }
    sort(field, order = 'asc') {
        this.sortBy = field;
        this.sortOrder = order;

        if (this.procesServer) {
            this.searching(this.searchTerm, true);
        } else {
            this._data.sort((a, b) => {
                const valA = a[field];
                const valB = b[field];

                if (valA < valB) return order === 'asc' ? -1 : 1;
                if (valA > valB) return order === 'asc' ? 1 : -1;
                return 0;
            });
            this.processPagination();
        }

        this.emit('sortChange', { field, order });
    }
    clearSort() {
        this.sortBy = null;
        this.sortOrder = 'asc';

        if (this.procesServer) {
            this.fetch.body.sortBy = null;
            this.fetch.body.sortOrder = 'asc';
        }

        this._cache.clear();
    }
    setupKeyboardNavigation() {
        if (!this.keyboardEnabled) return;

        const content = this._body.content;
        content.addEventListener('keydown', (e) => {
            const items = this._body.renderItems.querySelectorAll('.items');
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const keyName = (e.key === 'ArrowLeft' ? 'prev' : 'next');
                const btnPagination = this._body.paginationItems.querySelector(`.${keyName} button`);
                if (!btnPagination) {
                    const btn = keyName === 'prev' ? 'start' : 'end';
                    if (btn === "start" && this._pagination.page <= 1) return;
                    if (btn === "end" && this._pagination.page >= this._pagination.countPage()) return;
                    const btnStart = this._body.paginationItems.querySelector(`.${btn} button`);
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
    highlightItem(items) {
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }
    selectItem(item) {
        this.emit('itemSelected', { item, index: this.selectedIndex });
    }
    destroy() {
        this.emit('destroy', { timestamp: new Date().toISOString() });
        if (this._body.inputSearch) {
            const newInput = this._body.inputSearch.cloneNode(true);
            this._body.inputSearch.parentNode.replaceChild(newInput, this._body.inputSearch);
        }
        this._body = null;
        this._data = null;
        this.data = null;
        this._pagination = null;
        this._events = null;
    }
}

export { Search };