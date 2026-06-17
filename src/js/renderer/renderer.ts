import { createElement } from '../renderElement';
import { EventEmitter } from '../events/eventEmitter';
import * as Types from '../types';

/**
 * Clase helper para crear la estructura DOM inicial de los componentes.
 * NO maneja la lógica de negocio de paginación ni renderizado de items.
 * @class
 */
export class SearchRenderer {
    public body: Types.BodyConfig;
    private uniqueClassNameFn: (baseClass: string) => string;
    public isVisible: boolean;
    public hideTimeout: ReturnType<typeof setTimeout> | null;
    public animationTimeouts: ReturnType<typeof setTimeout>[];
    /**
     * Crea una instancia de SearchRenderer.
     * @param {Types.BodyConfig} body - Objeto con referencias a elementos del DOM
     * @param {Function} uniqueClassNameFn - Función para generar nombres de clase únicos
     */
    constructor(body: Types.BodyConfig, uniqueClassNameFn: (baseClass: string) => string) {
        this.body = body;
        this.uniqueClassNameFn = uniqueClassNameFn;
        this.isVisible = false; // Nuevo: estado de visibilidad
        this.hideTimeout = null; // Nuevo: timeout para delay al ocultar
        this.animationTimeouts = [];
    }
    /**
     * Genera un nombre de clase único usando la función proporcionada.
     * @param {string} baseClass - Clase base (ej: "input-search")
     * @returns {string} Nombre de clase único
     */
    getUniqueClassName(baseClass: string): string {
        return this.uniqueClassNameFn(baseClass);
    }
    #classDefault(baseClass: string, classImport: string = ''): string {
        return `${baseClass} ${classImport}`.trim().split(' ')
            .filter((cls, index, array) => !classImport.includes(cls) || array.indexOf(cls) === index)
            .join(' ');
    }
    /**
     * Renderiza el contenedor del input de búsqueda (label + contenedor).
     * NO crea el input con debounce, eso lo hace renderSearch().
     * @returns {HTMLElement} Contenedor de búsqueda
     */
    contentSearch(): HTMLElement {
        if (this.body.contentSearch) return this.body.contentSearch;

        const element = this.body.content;
        let contentSearch = element.querySelector('.input-search') as HTMLElement;

        let jsonContentSearch: Types.CreateElementConfig = {
            element: contentSearch,
            className: this.#classDefault(`input-search ${this.getUniqueClassName('input-search')}`, contentSearch?.className),
            ...(!contentSearch ? {
                element: "search"
            } : {})
        }

        const newContentSearch = createElement(jsonContentSearch);

        if (!contentSearch) {
            element.appendChild(newContentSearch);
        }

        this.body.contentSearch = newContentSearch;
        return newContentSearch;
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
    renderSearch({ onInput, debounceTime, placeholder, ariaLabel }: Types.RenderSearchOptions): HTMLElement {
        if (this.body.inputSearch) return this.body.inputSearch;

        const element = this.body.contentSearch;
        let inputSearch = element?.querySelector('.filter-search') as HTMLElement;
        let timeOut: any;

        let jsonInput = {
            element: inputSearch,
            id: this.getUniqueClassName('input-search'),
            placeholder: placeholder || 'Ingrese palabra clave...',
            className: this.#classDefault(`${this.getUniqueClassName("filter-search")}`, inputSearch?.className),
            attributes: {
                "aria-label": ariaLabel || 'Filtrar por Búsqueda',
                "aria-autocomplete": "list",
                "aria-expanded": "false",
                "role": "combobox",
                "aria-controls": this.getUniqueClassName('items-search')
            },
            event: {
                input: (e: Event) => {
                    const searchTerm = (e.target as HTMLInputElement).value.trim().toLowerCase();
                    clearTimeout(timeOut);
                    timeOut = setTimeout(() => {
                        if (onInput) onInput(searchTerm, e instanceof Event);
                    }, debounceTime);
                },
                focus: () => {
                    const count = this.body.renderItems?.querySelectorAll(".items").length || 0;
                    if (count > 0) this.showResults();
                },
                blur: () => {
                    this.hideResultsWithDelay();
                }
            },
            ...(!inputSearch ? {
                element: "input",
                name: this.getUniqueClassName("filterSearch"),
            } : {})
        };

        inputSearch = createElement(jsonInput);

        if (jsonInput.element === "input" && element) element.appendChild(inputSearch);

        this.body.inputSearch = inputSearch;
        return inputSearch;
    }
    /**
     * Renderiza el contenedor donde se mostrarán los resultados de búsqueda.
     * @returns {HTMLElement} Contenedor de items
     */
    renderItems(zIndex: number = 999): HTMLElement {
        if (this.body.renderItems) return this.body.renderItems;

        if (!this.body.contentPaginationItems) {
            this.renderContentPaginationItems();
        }

        const element = this.body.contentPaginationItems;
        let renderItems = element?.querySelector('.items-search') as HTMLElement;

        let jsonItemsSearch: Record<string, any> = {
            element: renderItems,
            className: this.#classDefault(`items-search scroll-personalize ${this.getUniqueClassName("items-search")}`, renderItems?.className),
            attributes: {
                'aria-label': 'Resultados de búsqueda',
                'role': 'listbox',
                'aria-activedescendant': '',
                'hidden': 'true',
                'style': `z-index: ${zIndex};`
            },
            ...(!renderItems ? {
                element: "ul",
                id: this.getUniqueClassName('items-search')
            } : {})
        }

        const newRenderItem = createElement(jsonItemsSearch as Types.CreateElementConfig);

        if (!renderItems && element) {
            element.appendChild(newRenderItem);
        }

        this.body.renderItems = newRenderItem;
        return newRenderItem;
    }

    /**
     * Renderiza el contenedor de paginación.
     * @returns {HTMLElement} Contenedor de paginación
     */
    renderPagination(): HTMLElement {
        if (!this.body.contentPaginationItems) {
            this.renderContentPaginationItems();
        }

        const element = this.body.contentPaginationItems;
        let paginationItems = element?.querySelector('.pagination-items') as HTMLElement;

        let jsonPaginationItems: Types.CreateElementConfig = {
            element: paginationItems,
            className: this.#classDefault(`pagination-items`, paginationItems?.className),
            attributes: { 'role': 'status', 'aria-live': 'polite' },
            innerHTML: this.renderCounter().outerHTML as string,
            ...(!paginationItems ? {
                element: "div",
            } : {})
        }

        console.log(this.body.content.classList);

        const newPaginationItems = createElement(jsonPaginationItems);

        if (!paginationItems && element) {
            element.appendChild(newPaginationItems);
        }

        this.body.paginationItems = newPaginationItems;
        return newPaginationItems;
    }

    /**
     * Renderiza el contador de registros.
     * @returns {HTMLElement} Contador de registros
     */
    renderCounter(): HTMLElement {
        const element = this.body.contentPaginationItems;
        const countItems = element?.querySelector('.items-counter') as HTMLElement;

        let jsonCountItems: Types.CreateElementConfig = {
            element: countItems,
            className: this.#classDefault(`items-counter`, countItems?.className),
            textContent: "0 de 0",
            ...(!countItems ? {
                element: "div",
            } : {})
        }

        return createElement(jsonCountItems);
    }
    /**
     * Añade items al contenedor sin reemplazar el contenido existente.
     * @param {Array<Object>} data - Items a añadir
     * @param {string|Function} template - Template personalizado
     * @param {string} noResults - Mensaje sin resultados
     * @param {EventEmitter} events - Instancia de EventEmitter
     * @returns {void}
     */
    appendItems(data: Record<string, any>[], template: string | Function | null, noResults: string = "No hay resultados.", events: EventEmitter) {
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
    updateCounter(loaded: number, total: number): void {
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
    renderByDom(domString: string, options: Record<string, any>): void {
        // const content = this.body.content;
        // content.innerHTML = '';

        const domMap: Record<string, () => void> = {
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
     * @returns {boolean} Retorna false si no hay contenedor, true en caso contrario
     */
    renderItemsContent(data: Record<string, any>[], template: string | Function | null, noResults: string = "No hay resultados.", events: EventEmitter): boolean {
        const container = this.body.renderItems;

        if (!container) return false;

        container.innerHTML = '';

        const jsonItem: Types.CreateElementConfig = {
            element: "li",
            className: "items",
            tabindex: '0',
            attributes: { 'role': 'option' },
            event: {
                // Nuevo: mantener visible al hacer clic
                mousedown: (e: MouseEvent) => {
                    e.preventDefault(); // Evitar blur inmediato
                    this.isVisible = true; // Mantener estado visible
                }
            }
        };

        if (!data || data.length === 0) {
            jsonItem.textContent = noResults || 'No se encontraron resultados';
            container.appendChild(createElement(jsonItem as Types.CreateElementConfig));

            // Ocultar si no hay resultados
            // this.hideResults();
            return false;
        }

        data.forEach(item => {
            if (template) {
                let templateStr: any = template;
                if (typeof template === 'function') {
                    jsonItem.innerHTML = template(item);
                } else if (typeof template === 'string') {
                    Object.keys(item).forEach(key => {
                        templateStr = templateStr.replace(`{{${key}}}`, item[key]);
                    });
                    jsonItem.innerHTML = templateStr;
                }
                container.appendChild(createElement(jsonItem as Types.CreateElementConfig));
                return
            }
            jsonItem.textContent = Object.values(item).join(' ');
            container.appendChild(createElement(jsonItem as Types.CreateElementConfig));
        });

        // Mostrar si hay resultados y el input tiene foco
        if (document.activeElement === this.body.inputSearch) {
            this.showResults();
        }

        events.emit('renderItems', {
            items: data,
            content: container
        });

        return true;
    }

    /**
     * Muestra el contenedor de resultados.
     * Actualiza aria-expanded y remueve atributo hidden.
     */
    showResults(): void {
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
    hideResultsWithDelay(): void {
        // Delay de 200ms para permitir clic en resultados
        this.hideTimeout = setTimeout(() => {
            this.hideResults();
        }, 200);
    }

    /**
     * Oculta el contenedor de resultados inmediatamente.
     * Actualiza aria-expanded y agrega atributo hidden.
     */
    hideResults(): void {
        const contentPagination = this.body.contentPaginationItems;
        const itemsSearch = this.body.renderItems;

        let timeout;

        if (contentPagination) {
            contentPagination.classList.remove('content-pagination-visible');
            contentPagination.classList.add('content-pagination-hidden');
            // Esperar a que termine la animación antes de ocultar
            timeout = setTimeout(() => {
                if (contentPagination.classList.contains('content-pagination-hidden')) {
                    contentPagination.setAttribute('hidden', 'true');
                }
            }, 200);
            this.animationTimeouts.push(timeout);
        }

        if (itemsSearch) {
            itemsSearch.classList.remove('items-search-visible');
            itemsSearch.classList.add('items-search-hidden');
            timeout = setTimeout(() => {
                if (itemsSearch.classList.contains('items-search-hidden')) {
                    itemsSearch.setAttribute('hidden', 'true');
                }
            }, 200);
            this.animationTimeouts.push(timeout);
        }
    }

    /**
     * Toggle de visibilidad de resultados.
     */
    toggleResults(): void {
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
    renderContentPaginationItems(): HTMLElement {
        if (this.body.contentPaginationItems) return this.body.contentPaginationItems;

        const element = this.body.content;
        let contentPaginationItems = element.querySelector('.content-pagination-items') as HTMLElement;

        let jsonContentPagItems: Types.CreateElementConfig = {
            element: contentPaginationItems,
            className: this.#classDefault(`content-pagination-items ${this.getUniqueClassName("content-pagination-items")}`, contentPaginationItems?.className),
            ...(!contentPaginationItems ? {
                element: "div",
            } : {})
        }

        const newContentPagItems = createElement(jsonContentPagItems)

        if (!contentPaginationItems) {
            element.appendChild(newContentPagItems);
        }

        this.body.contentPaginationItems = newContentPagItems;
        return newContentPagItems;
    }


}
