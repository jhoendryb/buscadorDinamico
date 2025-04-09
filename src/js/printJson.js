// ---------------------------
function jsonToHtml(json, parent = null) {
    // Si no hay un elemento padre, creamos uno nuevo
    if (!parent) {
        parent = document.createElement('div');
    }

    // Función auxiliar para crear elementos
    function createElementFromJson(elementJson) {
        // Crear el elemento base
        const element = document.createElement(elementJson.tag);

        // Añadir atributos
        if (elementJson.attributes) {
            Object.entries(elementJson.attributes).forEach(([key, value]) => {
                if (key === 'class') {
                    if (typeof value === 'string') {
                        value.split(' ').forEach(cls => element.classList.add(cls));
                    } else if (Array.isArray(value)) {
                        value.forEach(cls => element.classList.add(cls));
                    }
                } else if (key === 'style') {
                    if (typeof value === 'string') {
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            console.warn('Error parsing style string:', e);
                            return;
                        }
                    }
                    if (typeof value === 'object') {
                        Object.entries(value).forEach(([prop, val]) => {
                            element.style[prop] = val;
                        });
                    }
                } else if (key === 'innerText' || key === 'text') {
                    element.textContent = value;
                } else {
                    if (typeof value === 'object') {
                        value = JSON.stringify(value);
                    }
                    element.setAttribute(key, value);
                }
            });
        }

        // Añadir hijos recursivamente
        if (elementJson.children) {
            elementJson.children.forEach(childJson => {
                const child = createElementFromJson(childJson);
                element.appendChild(child);
            });
        }

        return element;
    }

    // Validar el JSON
    function validateJson(elementJson) {
        if (!elementJson || typeof elementJson !== 'object') {
            throw new Error('El JSON debe ser un objeto');
        }

        if (!elementJson.tag) {
            throw new Error('El elemento debe tener un tag');
        }

        if (elementJson.children) {
            if (!Array.isArray(elementJson.children)) {
                throw new Error('Los children deben ser un array');
            }
            elementJson.children.forEach(validateJson);
        }
    }

    // Validar el JSON
    validateJson(json);

    // Crear el elemento raíz
    const rootElement = createElementFromJson(json);

    // Si hay un elemento padre, añadir el elemento creado
    if (parent) {
        parent.appendChild(rootElement);
    }

    // Retornar el elemento raíz
    return rootElement;
}

// Ejemplo de uso
window.addEventListener("DOMContentLoaded", () => {
    // const json = {
    //     tag: "div",
    //     attributes: {
    //         class: "app-search",
    //         style: {
    //             backgroundColor: "rgb(41, 41, 47)"
    //         }
    //     },
    //     children: [
    //         {
    //             tag: "search",
    //             attributes: {
    //                 class: "input-search"
    //             },
    //             children: [
    //                 {
    //                     tag: "label",
    //                     attributes: {
    //                         for: "filter-search",
    //                         text: "Filtrar por Busqueda"
    //                     }
    //                 },
    //                 {
    //                     tag: "input",
    //                     attributes: {
    //                         type: "text",
    //                         name: "filterSearch",
    //                         id: "filter-search",
    //                         class: "form-control input-lg",
    //                         placeholder: "Ingrese palabra clave..."
    //                     }
    //                 }
    //             ]
    //         },
    //         {
    //             tag: "main",
    //             attributes: {
    //                 class: "items-search scroll-personalize"
    //             }
    //         },
    //         {
    //             tag: "footer",
    //             attributes: {
    //                 class: "index-search"
    //             },
    //             children: [
    //                 {
    //                     tag: "ul",
    //                     attributes: {
    //                         class: "pagination"
    //                     }
    //                 }
    //             ]
    //         }
    //     ]
    // };

    // // Crear el HTML a partir del JSON
    // const element = jsonToHtml(json);
    // document.body.appendChild(element);
});
// ---------------------------