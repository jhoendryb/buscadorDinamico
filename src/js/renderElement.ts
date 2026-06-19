import * as Types from './types';

/**
 * Crea un elemento HTML con los atributos y opciones especificadas.
 * Función auxiliar para crear elementos DOM de forma declarativa.
 * 
 * @public
 * @param {Object} config - Configuración del elemento a crear
 * @param {string|HTMLElement} config.element - Nombre del elemento HTML a crear o elemento existente
 * @param {Object} [config.dataset] - Objeto con pares clave-valor para atributos data-*
 * @param {Array<Object>} [config.children] - Arreglo de objetos con configuración de elementos hijos
 * @param {HTMLElement} [config.child] - Elemento hijo único
 * @param {Object} [config.event] - Objeto con eventos a agregar (clave: nombre evento, valor: callback)
 * @param {Object} [config.attributes] - Objeto con atributos HTML a establecer
 * @param {Object} [config.*] - Cualquier otra propiedad opcional se asigna directamente al elemento. Debe ser el último parámetro.
 * @returns {HTMLElement} El elemento HTML creado
 * 
 * @example
 * // Crear un input simple
 * const input = createElement({
 *     element: 'input',
 *     type: 'text',
 *     placeholder: 'Buscar...'
 * });
 * 
 * @example
 * // Crear un div con hijos y eventos
 * const container = createElement({
 *     element: 'div',
 *     className: 'container',
 *     attributes: { 'role': 'listbox' },
 *     event: {
 *         click: (e) => console.log('Clicked', e)
 *     },
 *     children: [
 *         { element: 'span', textContent: 'Hola' }
 *     ]
 * });
 * 
 * @example
 * // Crear con dataset
 * const item = createElement({
 *     element: 'div',
 *     dataset: { id: '123', name: 'Juan' }
 * });
 */

function createElement({ element, dataset, children, child, event, attributes, style, ...propertys }: Types.CreateElementConfig): HTMLElement {
    const specialAttributes = {
        value: ["input", "textarea", "select"],
        selected: ["option"]
    };

    const typeElement = typeof element == "object";
    let el = (typeElement ? element : document.createElement(element)) as HTMLElement;

    Object.keys(specialAttributes).forEach((key: string) => {
        const elementName = (typeElement ? (element as HTMLElement).tagName : element).toLowerCase();
        if (propertys[key] && specialAttributes[key as keyof typeof specialAttributes].includes(elementName)) {
            el.setAttribute(key, propertys[key]);
            delete propertys[key];
        }
    });

    if (attributes) Object.keys(attributes).forEach(key => {
        el.setAttribute(key, attributes[key]);
    });

    Object.assign(el, propertys);

    if (dataset) Object.assign(el.dataset, dataset);
    if (child) el.appendChild(child);
    if (style) Object.assign(el.style, style);

    if (event) {
        Object.keys(event).forEach(key => {
            el.addEventListener(`${key}`, event[key])
        });
    }

    if (children) {
        children.forEach(child => {
            let childElement = createElement(child);
            el.appendChild(childElement);
        });
    }

    return el;
}

export { createElement }