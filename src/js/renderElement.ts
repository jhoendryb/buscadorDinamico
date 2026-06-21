import * as Types from './types';

/**
 * Creates an HTML element with the specified attributes and options.
 * Auxiliary function to create DOM elements declaratively.
 *
 * @public
 * @param {Object} config - Element creation configuration
 * @param {string|HTMLElement} config.element - Name of the HTML element to create or existing element
 * @param {Object} [config.dataset] - Object with key-value pairs for data-* attributes
 * @param {Array<Object>} [config.children] - Array of configuration objects for child elements
 * @param {HTMLElement} [config.child] - Single child element
 * @param {Object} [config.event] - Object with events to add (key: event name, value: callback)
 * @param {Object} [config.attributes] - Object with HTML attributes to set
 * @param {Object} [config.*] - Any other optional property. Must be the last parameter.
 * @returns {HTMLElement} The created HTML element
 *
 * @example
 * // Create a simple input
 * const input = createElement({
 *     element: 'input',
 *     type: 'text',
 *     placeholder: 'Search...'
 * });
 *
 * @example
 * // Create a div with children and events
 * const container = createElement({
 *     element: 'div',
 *     className: 'container',
 *     attributes: { 'role': 'listbox' },
 *     event: {
 *         click: (e) => console.log('Clicked', e)
 *     },
 *     children: [
 *         { element: 'span', textContent: 'Hello' }
 *     ]
 * });
 *
 * @example
 * // Create with dataset
 * const item = createElement({
 *     element: 'div',
 *     dataset: { id: '123', name: 'John' }
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