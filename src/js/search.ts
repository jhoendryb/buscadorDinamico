import * as Types from './types';
import { Search } from './app';
import { createElement } from './renderElement';

const DEFAULT_FETCH = {
    url: "/api/example",
    method: "POST",
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: {
        page: 1,
        searchTerm: "",
        // sortBy: "id_ciudad",
        // sortOrder: "asc"
    }
    // success: function (resp: any, instance: any) {
    //     if (resp) {
    //         console.log(resp)
    //     }
    // },
    // error: function (error: any) {
    //     console.log(error);
    // }
}

const DEFAULT_TRANSLATION = {
    "searchPlaceholder": "Ingrese palabra clave...",
    "loading": "Buscando...",
    "noResults": "No se encontraron resultados",
    "pagination": "{{to}} de {{total}}"
}

const DEFAULT_DATA = Array.from({ length: 2 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `Description item ${i}`
}));

const DEFAULT_RESPONSE_ADAPTER = (response: any): any => {
    return {
        data: response.items,
        countPage: response.count
    }
};

function copiarCodigo(boton: HTMLElement) {
    const contenedor = boton.parentElement as HTMLElement;
    const codigo = contenedor.querySelector("code") as HTMLElement;

    navigator.clipboard.writeText(codigo.innerText).then(() => {
        boton.innerText = "¡Copiado!";
        setTimeout(() => {
            boton.innerText = "Copiar";
        }, 2000);
    });
}

function reactionSearch({ form, search, emit = null }: Record<string, any>): Search {

    const formData = new FormData(form as HTMLFormElement);
    let values: { [key: string]: string | number | boolean | Function } = {};
    Array.from(formData.keys()).forEach((key) => {
        let value = formData.get(key);
        if (typeof value === 'string' && value.trim() !== "") {
            if ([
                "procesServer", "keyboardEnabled",
                "cacheEnabled", "developmentMode",
                "highlightEnabled"
            ].includes(key) !== false) {
                values[key] = true;
            } else if (key === "fetch") {
                values[key] = JSON.parse(value.trim());
            } else if (key === "translation") {
                values[key] = JSON.parse(value.trim());
            } else if (key === "data") {
                values[key] = JSON.parse(value.trim());
            } else if (key === "responseAdapter") {
                values[key] = new Function(`return ${value.trim()}`)();
            } else {
                values[key] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    });

    if (!values["procesServer"]) delete values["fetch"];
    // values["keyboardEnabled"] = true;

    const code: HTMLElement | null = document.querySelector(".code-prepareSearch");
    if (code) {
        code.innerHTML = `new Search(${JSON.stringify(values, (_, value) => {
            if (typeof value === 'function') {
                return value.toString();
            }
            return value;
        }, 2)}).init()`;
    }

    if (emit && emit.name === "theme") {
        search.renderer.setTheme(emit.value as string);
        return search;
    }

    if (emit && emit.name === "sortOrder") {
        if (emit.value === "") {
            search.clearSort();
            search.draw("", true);
            return search;
        }
        if (!values["sortBy"]) return search;
        search.sort(values["sortBy"] as string, emit.value as string);
        search.draw("", true);
        return search;
    }

    if (search) search.destroy();

    search = new Search(values as unknown as Types.SearchParams).init();

    search.on('itemSelected', (data: any) => console.log(data));
    search.on('destroy', (data: any) => console.log(data));
    // search.on('search', (data: any) => console.log(data, "buscando"));

    return search;
}

window.addEventListener('load', () => {
    const btn: HTMLElement | null = document.querySelector(".copy-btn");
    const form: HTMLElement | null = document.querySelector("form.form-dynamic_search");

    const inputFetch: HTMLTextAreaElement | null = form?.querySelector("#input-fetch") || null;
    createElement({
        element: inputFetch,
        placeholder: JSON.stringify(DEFAULT_FETCH, null, 2),
        innerHTML: JSON.stringify(DEFAULT_FETCH, null, 2)
    } as Types.CreateElementConfig);

    const inputTranslation: HTMLTextAreaElement | null = form?.querySelector("#input-translation") || null;
    createElement({
        element: inputTranslation,
        placeholder: JSON.stringify(DEFAULT_TRANSLATION, null, 2),
        innerHTML: JSON.stringify(DEFAULT_TRANSLATION, null, 2)
    } as Types.CreateElementConfig);

    const inputData: HTMLTextAreaElement | null = form?.querySelector("#input-data") || null;
    createElement({
        element: inputData,
        placeholder: JSON.stringify(DEFAULT_DATA, null, 2),
        innerHTML: JSON.stringify(DEFAULT_DATA, null, 2)
    } as Types.CreateElementConfig);

    const inputResponseAdapter: HTMLTextAreaElement | null = form?.querySelector("#input-responseAdapter") || null;
    createElement({
        element: inputResponseAdapter,
        placeholder: DEFAULT_RESPONSE_ADAPTER.toString(),
        innerHTML: DEFAULT_RESPONSE_ADAPTER.toString()
    } as Types.CreateElementConfig);
    // const match = key.match(/^(\w+)\[(\w+)\]$/);
    let search: Search = reactionSearch({ form });

    form?.addEventListener('input', function (e) {
        const emit = (e.target as HTMLInputElement);
        search = reactionSearch({ form, search, emit });
    });

    btn?.addEventListener('click', (e) => copiarCodigo(e.target as HTMLElement));
});

// const formData = new FormData();
// formData.append('page', '1');
// formData.append('searchTerm', '');

// const search1 = new Search({
//     element: '.app-search1',
//     theme: 'onyx-black',
//     procesServer: true,
//     cacheEnabled: true,
//     keyboardEnabled: true,
//     highlightEnabled: true,
//     // responseAdapter: (response) => ({
//     //     data: response.items,
//     //     countPage: response.count
//     // }),
//     template: `<div>{{name}} - {{id_ciudad}}</div>`,
//     translation: {
//         searchPlaceholder: 'Escribe la busqueda aqui.',
//         pagination: '{{total}} resultados, paginados {{from}}-{{to}}'
//     },
//     dom: 'scip',
//     developmentMode: true,
//     fetch: {
//         url: "/buscadorDinamico/src/php/responseAjax.php",
//         method: "POST",
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
//         },
//         body: {
//             page: 1,
//             searchTerm: "",
//             sortBy: "id_ciudad",
//             sortOrder: "asc"
//         },
//         success: function (resp, instance) {
//             if (resp) {
//                 console.log(resp)
//             }
//         },
//         error: function (error) {
//             console.log(error);
//         }
//     },
// });


// search1.events.once('search', (data: any) => {
//     console.log("Que fue esto sera solo una vez", data);
// });

// console.log("Esto es pruebas", prueba);

// search1.on('itemSelected', (data) => {
//     if (!data.item) return;

//     data.close();

//     // const input = document.querySelector(".filter-search-app-search1");
//     // if (input) {
//     //     (input as HTMLInputElement).blur();
//     // }
// });

// search1.on('search', () => console.table(search1.cache.stats));
// search1.on('pageChange', (data) => console.log('Page change:', data));

// const search2 = new Search({
//     element: '.app-search2',
// });

// search2.on('search', (data: any) => {
//     console.log('Search event:', data);
// });

// search2.on('pageChange', (data: any) => {
//     console.log('Page change event:', data);
// });

// const search3 = new Search({
//     element: '.app-search3',
// });

// const search4 = new Search({
//     element: '.app-search4',
//     dom: 'pics',
//     keyboardEnabled: true,
//     theme: 'clean-white',
//     // template: (item) => {
//     //     let templete = "";
//     //     if (item) {
//     //         templete = `${item.child.name} - ${item.id}`;
//     //         if (item.description) {
//     //             templete += ` - ${item.description}`;
//     //         }
//     //     }
//     //     return templete;
//     // },
//     data: arrayData
// });

// search1.init();
// search2.init();
// search3.init();
// search4.init();

// console.log(search4._data);

// search2.sort('name', 'asc').draw();