import { createElement } from '../renderElement.js';
import * as Types from '../types.js';

/**
 * Clase helper para crear la estructura DOM inicial de los componentes.
 * NO maneja la lógica de negocio de paginación ni renderizado de items.
 * @class
 */
export class SearchRenderer {
    /**
     * Crea una instancia de SearchRenderer.
     * @param {Types.BodyConfig} body - Objeto con referencias a elementos del DOM
     * @param {Function} uniqueClassNameFn - Función para generar nombres de clase únicos
     */
    constructor(body, uniqueClassNameFn) {
        this.body = body;
        this.uniqueClassNameFn = uniqueClassNameFn;
        this.isVisible = false; // Nuevo: estado de visibilidad
        this.hideTimeout = null; // Nuevo: timeout para delay al ocultar
    }
    /**
     * Genera un nombre de clase único usando la función proporcionada.
     * @param {string} baseClass - Clase base (ej: "input-search")
     * @returns {string} Nombre de clase único
     */
    getUniqueClassName(baseClass) {
        return this.uniqueClassNameFn(baseClass);
    }
    /**
     * Renderiza el contenedor del input de búsqueda (label + contenedor).
     * NO crea el input con debounce, eso lo hace renderSearch().
     * @returns {HTMLElement} Contenedor de búsqueda
     */
    contentSearch() {
        if (this.body.contentSearch) return;

        const element = this.body.content;
        let contentSearch = element.querySelector('.input-search');

        if (!contentSearch) {
            contentSearch = createElement({
                element: "search",
                className: "input-search" + ` ${this.getUniqueClassName('input-search')}`,
                // children: [
                //     {
                //         element: "label",
                //         htmlFor: this.getUniqueClassName('input-search'),
                //         textContent: this.t?.searchLabel || 'Filtrar por Búsqueda'
                //     }
                // ]
            });
            element.appendChild(contentSearch);
        }

        this.body.contentSearch = contentSearch;
        return contentSearch;
    }
    /**
     * Renderiza el input de búsqueda con debounce.
     * Debe llamarse después de contentSearch().
     * @param {Object} options - Opciones de configuración
     * @param {Function} options.onInput - Callback al escribir en el input
     * @param {number} options.debounceTime - Tiempo de debounce en ms
     * @param {string} options.placeholder - Placeholder del input
     * @param {string} options.ariaLabel - Label ARIA para accesibilidad
     * @returns {HTMLElement} Input de búsqueda
     */
    renderSearch({ onInput, debounceTime, placeholder, ariaLabel }) {
        if (this.body.inputSearch) return;

        const element = this.body.contentSearch;
        let inputSearch = element.querySelector('.filter-search');
        let timeOut;

        let jsonInput = {
            element: inputSearch,
            id: this.getUniqueClassName('input-search'),
            attributes: {
                "aria-label": ariaLabel || 'Filtrar por Búsqueda',
                "aria-autocomplete": "list",
                "aria-expanded": "false", // Nuevo: estado inicial
                "role": "combobox"
            },
            event: {
                input: (e) => {
                    const searchTerm = e.target.value.trim().toLowerCase();
                    clearTimeout(timeOut);
                    timeOut = setTimeout(() => {
                        if (onInput) onInput(searchTerm, e instanceof Event);
                    }, debounceTime);
                },
                focus: () => {
                    const count = this.body.renderItems.querySelectorAll(".items").length;
                    if (count > 0) this.showResults();
                },
                blur: () => {
                    this.hideResultsWithDelay();
                }
            },
            ...(!inputSearch ? {
                element: "input",
                name: this.getUniqueClassName("filterSearch"),
                className: `form-control input-lg ${this.getUniqueClassName("filter-search")}`,
                placeholder: placeholder || 'Ingrese palabra clave...',
            } : {})
        };

        inputSearch = createElement(jsonInput);
        inputSearch.setAttribute('aria-controls', this.getUniqueClassName('items-search'));

        if (jsonInput.element === "input") element.appendChild(inputSearch);

        this.body.inputSearch = inputSearch;
        return inputSearch;
    }
    /**
     * Renderiza el contenedor donde se mostrarán los resultados de búsqueda.
     * @returns {HTMLElement} Contenedor de items
     */
    renderItems(zIndex) {
        if (this.body.renderItems) return;

        // Requerir contenedor padre
        if (!this.body.contentPaginationItems) {
            this.renderContentPaginationItems();
        }

        const element = this.body.contentPaginationItems;
        let renderItems = element.querySelector('.items-search');

        if (!renderItems) {
            renderItems = createElement({
                element: "ul",
                id: this.getUniqueClassName('items-search'),
                className: `items-search scroll-personalize ${this.getUniqueClassName("items-search")}`,
                attributes: {
                    'aria-label': 'Resultados de búsqueda',
                    'role': 'listbox',
                    'aria-activedescendant': '',
                    'hidden': 'true',
                    'style': `z-index: ${zIndex};`
                }
            });
            element.appendChild(renderItems);
        }

        this.body.renderItems = renderItems;
        return renderItems;
    }

    /**
     * Renderiza el contenedor de paginación.
     * @returns {HTMLElement} Contenedor de paginación
     */
    renderPagination() {
        if (!this.body.contentPaginationItems) {
            this.renderContentPaginationItems();
        }

        const element = this.body.contentPaginationItems;
        let paginationItems = element.querySelector('.pagination-items');

        if (!paginationItems) {
            paginationItems = createElement({
                element: "div",
                className: "pagination-items",
                attributes: { 'role': 'status', 'aria-live': 'polite' },
                children: [this.renderCounter()]
            });
            element.appendChild(paginationItems);
        }

        this.body.paginationItems = paginationItems;
        return paginationItems;
    }

    /**
     * Renderiza el contador de registros.
     * @returns {HTMLElement} Contador de registros
     */
    renderCounter() {
        return {
            element: "div",
            className: "items-counter",
            textContent: "0 de 0"
        };
    }
    /**
     * Añade items al contenedor sin reemplazar el contenido existente.
     * @param {Array<Object>} data - Items a añadir
     * @param {string|Function} template - Template personalizado
     * @param {string} noResults - Mensaje sin resultados
     * @param {EventEmitter} events - Instancia de EventEmitter
     * @returns {void}
     */
    appendItems(data, template, noResults, events) {
        const container = this.body.renderItems;
        if (!container) return;

        // Si es la primera carga y no hay items, mostrar mensaje
        if (container.children.length === 0 && (!data || data.length === 0)) {
            const noResultsElement = createElement({
                element: "div",
                className: "items",
                textContent: noResults
            });
            container.appendChild(noResultsElement);
            return;
        }

        // Añadir items al final
        data.forEach(item => {
            const itemElement = createElement({
                element: "div",
                className: "items",
                attributes: { 'role': 'option' }
            });

            if (template) {
                if (typeof template === 'function') {
                    itemElement.innerHTML = template(item);
                } else if (typeof template === 'string') {
                    let templateStr = template;
                    Object.keys(item).forEach(key => {
                        templateStr = templateStr.replace(`{{${key}}}`, item[key]);
                    });
                    itemElement.innerHTML = templateStr;
                }
            } else {
                itemElement.textContent = Object.values(item).join(' ');
            }

            container.appendChild(itemElement);
        });

        events.emit('appendItems', {
            items: data,
            content: container
        });
    }
    /**
     * Actualiza el contador de registros.
     * @param {number} loaded - Cantidad de items cargados
     * @param {number} total - Total de items
     * @returns {void}
     */
    updateCounter(loaded, total) {
        const counter = this.body.paginationItems?.querySelector('.items-counter');
        if (counter) {
            counter.textContent = `${loaded} de ${total}`;
        }
    }
    /**
     * Renderiza los componentes en el orden especificado por la propiedad 'dom'.
     * @param {string} domString - String con el orden (ej: 'sip' = search, items, pagination)
     * @param {Object} options - Opciones para cada componente
     * @param {Object} options.search - Opciones para el componente de búsqueda
     * @param {boolean} options.infiniteScroll - Si debe usar scroll infinito
     * @returns {void}
     */
    renderByDom(domString, options = {}) {
        const content = this.body.content;
        content.innerHTML = '';

        const domMap = {
            's': () => {
                this.contentSearch();
                this.renderSearch(options.search || {});
            },
            'c': () => this.renderContentPaginationItems(),
            'i': () => this.renderItems(),
            'p': () => this.renderPagination()
        };

        for (const char of domString) {
            if (domMap[char]) {
                domMap[char]();
            }
        }
    }


    /**
     * Renderiza los items en el contenedor de resultados.
     * Usa el template personalizado si está configurado, sino muestra los valores del objeto.
     * @param {Array<Object>} data - Array de items a renderizar
     * @param {string|Function} template - Template personalizado (string o función)
     * @param {string} noResults - Mensaje cuando no hay resultados
     * @param {EventEmitter} events - Instancia de EventEmitter para emitir eventos
     * @returns {boolean|void} Retorna false si no hay contenedor, void en caso contrario
     */
    renderItemsContent(data, template, noResults, events, pagination) {
        const container = this.body.renderItems;

        if (!container) return false;

        container.innerHTML = '';

        const jsonItem = {
            element: "li",
            className: "items",
            tabindex: '0',
            attributes: { 'role': 'option' },
            event: {
                // Nuevo: mantener visible al hacer clic
                mousedown: (e) => {
                    e.preventDefault(); // Evitar blur inmediato
                    this.isVisible = true; // Mantener estado visible
                }
            }
        };

        if (!data || data.length === 0) {
            jsonItem.textContent = noResults || 'No se encontraron resultados';
            container.appendChild(createElement(jsonItem));

            // Ocultar si no hay resultados
            // this.hideResults();
            return;
        }

        data.forEach(item => {
            if (template) {
                let templateStr = template;
                if (typeof template === 'function') {
                    jsonItem.innerHTML = template(item);
                } else if (typeof template === 'string') {
                    Object.keys(item).forEach(key => {
                        templateStr = templateStr.replace(`{{${key}}}`, item[key]);
                    });
                    jsonItem.innerHTML = templateStr;
                }
                container.appendChild(createElement(jsonItem));
                return
            }
            jsonItem.textContent = Object.values(item).join(' ');
            container.appendChild(createElement(jsonItem));
        });

        // Mostrar si hay resultados y el input tiene foco
        if (document.activeElement === this.body.inputSearch) {
            this.showResults();
        }

        events.emit('renderItems', {
            items: data,
            content: container
        });
    }

    /**
 * Muestra el contenedor de resultados.
 * Actualiza aria-expanded y remueve atributo hidden.
 */
    showResults() {
        const contentPagination = this.body.contentPaginationItems;
        const itemsSearch = this.body.renderItems;

        if (!contentPagination || !itemsSearch) return;

        if (contentPagination) {
            contentPagination.classList.remove('content-pagination-hidden');
            contentPagination.classList.add('content-pagination-visible');
            contentPagination.removeAttribute('hidden');
        }

        if (itemsSearch) {
            itemsSearch.classList.remove('items-search-hidden');
            itemsSearch.classList.add('items-search-visible');
            itemsSearch.removeAttribute('hidden');
        }

        this.isVisible = true;

        // Cancelar cualquier timeout de ocultamiento pendiente
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }

    /**
     * Oculta el contenedor de resultados con delay.
     * Permite que el usuario haga clic en un resultado antes de ocultar.
     */
    hideResultsWithDelay() {
        // Delay de 200ms para permitir clic en resultados
        this.hideTimeout = setTimeout(() => {
            this.hideResults();
        }, 200);
    }

    /**
     * Oculta el contenedor de resultados inmediatamente.
     * Actualiza aria-expanded y agrega atributo hidden.
     */
    hideResults() {
        const contentPagination = this.body.contentPaginationItems;
        const itemsSearch = this.body.renderItems;

        if (contentPagination) {
            contentPagination.classList.remove('content-pagination-visible');
            contentPagination.classList.add('content-pagination-hidden');
            // Esperar a que termine la animación antes de ocultar
            setTimeout(() => {
                if (contentPagination.classList.contains('content-pagination-hidden')) {
                    contentPagination.setAttribute('hidden', 'true');
                }
            }, 200);
        }

        if (itemsSearch) {
            itemsSearch.classList.remove('items-search-visible');
            itemsSearch.classList.add('items-search-hidden');
            setTimeout(() => {
                if (itemsSearch.classList.contains('items-search-hidden')) {
                    itemsSearch.setAttribute('hidden', 'true');
                }
            }, 200);
        }
    }



    /**
     * Toggle de visibilidad de resultados.
     */
    toggleResults() {
        if (this.isVisible) {
            this.hideResults();
        } else {
            this.showResults();
        }
    }

    /**
     * Renderiza el contenedor padre que envuelve items-search y pagination-items.
     * @returns {HTMLElement} Contenedor padre content-pagination-items
     */
    renderContentPaginationItems() {
        if (this.body.contentPaginationItems) return;

        const element = this.body.content;
        let contentPaginationItems = element.querySelector('.content-pagination-items');

        if (!contentPaginationItems) {
            contentPaginationItems = createElement({
                element: "div",
                className: `content-pagination-items ${this.getUniqueClassName("content-pagination-items")}`
            });
            element.appendChild(contentPaginationItems);
        }

        this.body.contentPaginationItems = contentPaginationItems;
        return contentPaginationItems;
    }


}
