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
    private timeHiddenResults: number;
    /**
     * Crea una instancia de SearchRenderer.
     * @param {Types.BodyConfig} body - Objeto con referencias a elementos del DOM
     * @param {Function} uniqueClassNameFn - Función para generar nombres de clase únicos
     * @param {number} timeHiddenResults - Tiempo en milisegundos para ocultar los resultados
     */
    constructor(body: Types.BodyConfig, uniqueClassNameFn: (baseClass: string) => string, timeHiddenResults: number) {
        this.body = body;
        this.uniqueClassNameFn = uniqueClassNameFn;
        this.isVisible = false; // Nuevo: estado de visibilidad
        this.hideTimeout = null; // Nuevo: timeout para delay al ocultar
        this.animationTimeouts = [];
        this.timeHiddenResults = timeHiddenResults;
    }
    /**
     * Agrega una clase de tema al contenedor principal y devuelve la instancia actual.
     * @param {string} theme - Nombre del tema (ej: "light", "dark")
     * @returns {SearchRenderer} Instancia actual de SearchRenderer
     */
    setTheme(theme: string): SearchRenderer {
        const existingThemeClass = Array.from(this.body.content.classList)
            .find(cls => cls.startsWith('theme-'));

        if (existingThemeClass) {
            this.body.content.classList.remove(existingThemeClass);
        }
        if (theme && theme !== 'default') {
            this.body.content.classList.add(`theme-${theme}`);
        }
        return this;
    }
    /**
     * Genera un nombre de clase único usando la función proporcionada.
     * @param {string} baseClass - Clase base (ej: "input-search")
     * @returns {string} Nombre de clase único
     */
    getUniqueClassName(baseClass: string): string {
        return this.uniqueClassNameFn(baseClass);
    }

    /**
     * Helper para unir clases y eliminar duplicados.
     * @param {string} baseClass - Clase base (ej: "input-search")
     * @param {string} [classImport=""] - Clases adicionales (ej: "red blue")
     * @returns {string} Clases unidas y sin duplicados (ej: "input-search red")
     */
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
                "role": "searchbox",
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
     * @param {number} [zIndex=999] - z-index del contenedor de items
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
                'aria-hidden': 'true',
            },
            style: { zIndex },
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
            // textContent: "0 de 0",
            ...(!countItems ? {
                element: "div",
            } : {})
        }

        return createElement(jsonCountItems);
    }
    /**
     * Añade items al contenedor sin reemplazar el contenido existente.
     * @param {Record<string, any>[]} data - Items a añadir
     * @param {string|Function|null} template - Template personalizado (opcional)
     * @param {string} [noResults="No hay resultados."] - Mensaje sin resultados
     * @param {EventEmitter} events - Instancia de EventEmitter
     * @param {boolean} [firstLoad=false] - Si es la primera carga
     * @param {Function} [highlightText] - Función para resaltar texto de búsqueda
     * @returns {boolean} Indica si se pudo añadir los items exitosamente
     */
    appendItems(data: Record<string, any>[], template: string | Function | null, noResults: string = "No hay resultados.", events: EventEmitter, firstLoad: boolean = false, highlightText?: (text?: string) => string): boolean {
        const container = this.body.renderItems;
        if (!container) return false;

        if (firstLoad) container.innerHTML = '';

        const jsonItem: Types.CreateElementConfig = {
            element: "li",
            className: "items",
            tabindex: '0',
            attributes: { 'role': 'option' },
            event: {
                pointerdown: (e: PointerEvent) => {
                    e.preventDefault();
                    this.isVisible = true;
                }
            }
        };

        // Si es la primera carga y no hay items, mostrar mensaje
        if (container.children.length === 0 && (!data || data.length === 0)) {
            jsonItem.textContent = noResults;
            container.appendChild(createElement(jsonItem));
            // Ocultar si no hay resultados
            // this.hideResults();
            return false;
        }

        const length = this.body.renderItems?.children.length;
        let idNum: number = (length ? (length - 1) : 0);

        // Añadir items al final
        data.forEach(item => {
            jsonItem.id = this.getUniqueClassName(`items-${idNum++}`);
            const itemElement = createElement(jsonItem);
            if (template) {
                if (typeof template === 'function') {
                    itemElement.innerHTML = template(item, highlightText);
                } else if (typeof template === 'string') {
                    let templateStr = template;
                    Object.keys(item).forEach(key => {
                        const value = highlightText ? highlightText(item[key]) : item[key];
                        templateStr = templateStr.replace(`{{${key}}}`, value);
                    });
                    itemElement.innerHTML = templateStr;
                }
            } else {
                const value = Object.values(item).join(' ');
                itemElement.textContent = highlightText ? highlightText(value) : value;
            }

            container.appendChild(itemElement);
        });

        events.emit('appendItems', {
            items: data,
            content: container
        });

        return true;
    }
    /**
     * Actualiza el contador de registros.
     * @param {number} loaded - Cantidad de items cargados
     * @param {number} total - Total de items
     * @param {string} [textPagination] - Texto personalizado para paginación (ej: "{{count}} de {{total}}")
     * @returns {void}
     */
    updateCounter(loaded: number, total: number, textPagination?: string): void {
        const counter = this.body.paginationItems?.querySelector('.items-counter');

        if (!textPagination) {
            textPagination = '{{count}} de {{total}}';
        }

        if (counter && textPagination) {
            counter.textContent = textPagination
                .replace('{{count}}', loaded.toString())
                .replace('{{total}}', total.toString());
        }
    }
    /**
     * Renderiza los componentes en el orden especificado por la propiedad 'dom'.
     * @param {string} domString - String con el orden (ej: 'scip' = search, ContentItemPagination, Items, Pagination)
     * @param {Object} options - Opciones para cada componente
     * @param {Object} options.search - Opciones para el componente de búsqueda
     * @returns {void}
     */
    renderByDom(domString: string, options: Record<string, any>): void {
        const domMap: Record<string, () => void> = {
            [Types.DomComponent.SEARCH]: () => {
                this.contentSearch();
                this.renderSearch({ ...options.search });
            },
            [Types.DomComponent.CONTENT]: () => this.renderContentPaginationItems(),
            [Types.DomComponent.ITEMS]: () => this.renderItems(),
            [Types.DomComponent.PAGINATION]: () => this.renderPagination()
        };

        const order = domString.split('');

        const brothers = order.filter((c: string) => 'sc'.includes(c)).join('');
        const children = order.filter((c: string) => 'ip'.includes(c)).join('');

        for (const char of `${brothers}${children}`) {
            if (domMap[char]) {
                domMap[char]();
            }
        }
    }

    /**
     * Muestra el contenedor de resultados.
     * Actualiza aria-expanded y remueve atributo hidden.
     */
    showResults(): void {
        const contentPagination = this.body.contentPaginationItems;

        if (!contentPagination) return;

        contentPagination.classList.remove('content-pagination-hidden');
        contentPagination.classList.add('content-pagination-visible');
        contentPagination.removeAttribute('hidden');

        this.isVisible = true;

        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }

    /**
     * Oculta el contenedor de resultados con delay.
     * Permite que el usuario haga clic en un resultado antes de ocultar.
     */
    hideResultsWithDelay(delay: number = this.timeHiddenResults): void {
        this.hideTimeout = setTimeout(() => {
            this.hideResults();
        }, delay);
    }

    /**
     * Oculta el contenedor de resultados inmediatamente.
     * Actualiza aria-expanded y agrega atributo hidden.
     */
    hideResults(): void {
        const contentPagination = this.body.contentPaginationItems;

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