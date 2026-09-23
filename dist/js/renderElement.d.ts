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
declare function createElement({ element, dataset, children, child, event, attributes, style, ...propertys }: Types.CreateElementConfig): HTMLElement;
export { createElement };
//# sourceMappingURL=renderElement.d.ts.map