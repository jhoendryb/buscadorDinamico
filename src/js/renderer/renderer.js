// src/js/renderer/renderer.js
import { createElement } from '../renderElement.js';

/**
 * Clase helper para crear la estructura DOM inicial de los componentes.
 * NO maneja la lógica de negocio de paginación ni renderizado de items.
 * @class
 */
export class SearchRenderer {
    /**
     * Crea una instancia de SearchRenderer.
     * @param {Object} body - Objeto con referencias a elementos del DOM
     * @param {Function} uniqueClassNameFn - Función para generar nombres de clase únicos
     */
    constructor(body, uniqueClassNameFn) {
        this.body = body;
        this.uniqueClassNameFn = uniqueClassNameFn;
    }

    /**
     * Genera un nombre de clase único.
     * @param {string} baseClass - Clase base
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
                children: [
                    {
                        element: "label",
                        htmlFor: this.getUniqueClassName('input-search'),
                        textContent: this.t?.searchLabel || 'Filtrar por Búsqueda'
                    }
                ]
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
     * @param {number} options.debounceTime - Tiempo de debounce
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
                "role": "combobox"
            },
            event: {
                input: (e) => {
                    const searchTerm = e.target.value.trim().toLowerCase();
                    clearTimeout(timeOut);
                    timeOut = setTimeout(() => {
                        if (onInput) onInput(searchTerm, e instanceof Event);
                    }, debounceTime);
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
    renderItems() {
        if (this.body.renderItems) return;

        const element = this.body.content;
        let renderItems = element.querySelector('.items-search');

        if (!renderItems) {
            renderItems = createElement({
                element: "main",
                id: this.getUniqueClassName('items-search'),
                className: `items-search scroll-personalize ${this.getUniqueClassName("items-search")}`,
                attributes: {
                    'aria-label': 'Resultados de búsqueda',
                    'role': 'listbox',
                    'aria-activedescendant': ''
                }
            });
            element.appendChild(renderItems);
        }

        this.body.renderItems = renderItems;
        return renderItems;
    }

    /**
     * Renderiza el contenedor de paginación (ul vacía).
     * NO renderiza los botones, eso lo hace processPagination() en app.js.
     * @returns {HTMLElement} Contenedor de paginación
     */
    renderPagination() {
        if (this.body.paginationItems) return;

        const element = this.body.content;
        let paginationItems = element.querySelector('.index-search');

        if (!paginationItems) {
            paginationItems = createElement({
                element: "footer",
                className: `index-search ${this.getUniqueClassName("index-search")}`,
                attributes: {
                    'aria-label': 'Paginación de resultados',
                    'role': 'navigation'
                },
                children: [
                    {
                        element: "ul",
                        className: `pagination ${this.getUniqueClassName("pagination")}`
                    }
                ]
            });
            element.appendChild(paginationItems);
        }

        this.body.paginationItems = paginationItems;
        return paginationItems;
    }

    /**
     * Renderiza los componentes en el orden especificado por la propiedad 'dom'.
     * @param {string} domString - String con el orden (ej: 'sip' = search, items, pagination)
     * @param {Object} options - Opciones para cada componente
     */
    renderByDom(domString, options = {}) {
        const content = this.body.content;
        content.innerHTML = '';

        const domMap = {
            's': () => {
                this.contentSearch();
                this.renderSearch(options.search || {});
            },
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
     * @param {Array} data - Array de items a renderizar
     * @param {string|Function} template - Template personalizado (string o función)
     * @param {string} noResults - Mensaje cuando no hay resultados
     * @param {EventEmitter} events - Instancia de EventEmitter para emitir eventos
     * @returns {boolean|void} Retorna false si no hay contenedor, void en caso contrario
     */
    renderItemsContent(data, template, noResults, events) {
        const container = this.body.renderItems;

        if (!container) return false;

        container.innerHTML = '';

        const jsonItem = {
            element: "div",
            className: "items",
            attributes: { 'role': 'option' }
        };

        if (!data || data.length === 0) {
            jsonItem.textContent = noResults || 'No se encontraron resultados';
            container.appendChild(createElement(jsonItem));
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

        events.emit('renderItems', {
            items: data,
            content: container
        });
    }
}
