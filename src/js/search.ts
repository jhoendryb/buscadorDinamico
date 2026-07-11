import { Search } from './app';

// const formData = new FormData();
// formData.append('page', '1');
// formData.append('searchTerm', '');

const search1 = new Search({
    element: '.app-search1',
    theme: 'onyx-black',
    procesServer: true,
    cacheEnabled: true,
    keyboardEnabled: true,
    highlightEnabled: true,
    template: `<div>{{name}} - {{id_ciudad}}</div>`,
    translation: {
        searchPlaceholder: 'Escribe la busqueda aqui.',
        pagination: '{{total}} resultados, paginados {{count}}'
    },
    dom: 'scip',
    developmentMode: true,
    fetch: {
        url: "/buscadorDinamico/src/php/responseAjax.php",
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: {
            page: 1,
            searchTerm: ""
            // sortBy: "id_ciudad",
            // sortOrder: "asc"
        },
        // body: formData,

        // success: function (resp, instance) {
        //     if (resp) {
        //         console.log(resp)
        //     }
        // },
        // error: function (error) {
        //     console.log(error);
        // }
    },
});


// const prueba = search1.on('renderItems', (data: any) => {
//     const { content } = data;
//     const item = content.children;
//     console.log('Page change event:', item[0]);
//     console.log('Item content:', item[0].innerHTML);
// });

// console.log("Esto es pruebas", prueba);

search1.on('itemSelected', (data: any) => {
    if (!data.item) return;

    data.close();

    const input = document.querySelector(".filter-search-app-search1");
    if (input) {
        (input as HTMLInputElement).blur();
    }
});

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


const arrayData = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `Description item ${i}`
}));

const search4 = new Search({
    element: '.app-search4',
    dom: 'pics',
    keyboardEnabled: true,
    theme: 'clean-white',
    data: arrayData
});

search1.init();
// search2.init();
// search3.init();
search4.init();

console.log(search4._data);

// search2.sort('name', 'asc').draw();