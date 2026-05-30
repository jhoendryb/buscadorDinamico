/**
 * Función que crea un elemento HTML con los atributos y las opciones especificadas.
 *
 * @param {string} element - El nombre del elemento HTML a crear.
 * @param {Object} [dataset] - Un objeto con los pares clave-valor para los atributos data del elemento.
 * @param {Array} [children] - Un arreglo de objetos con los elementos hijos del elemento.
 * @param {Object|HTMLDomElement} [child] - Un elemento hijo del elemento.
 * @param {...*} [attributes.*] - Cualquier otro atributo se convierte en un atributo del elemento.
 * @returns {HTMLDomElement} - El elemento HTML creado.
 */
function createElement({ element, dataset, children, child, event, attributes, ...propertys }) {
    const specialAttributes = {
        value: ["input", "textarea", "select"],
        selected: ["option"]
    };

    let el = (typeof element == "object" ? element : document.createElement(element));

    Object.keys(specialAttributes).forEach(key => {
        if (propertys[key] && specialAttributes[key].includes(element)) {
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