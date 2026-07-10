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
        searchPlaceholder: 'Escribe la busqueda aqui.'
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

const search4 = new Search({
    element: '.app-search4',
    dom: 'pics',
    keyboardEnabled: true,
    theme: 'clean-white',
    data: [
        {
            country: 'VE',
            name: 'Venezuela',
            descripcion: 'El pais mas rico en petroleo.'
        },
        {
            country: 'CO',
            name: 'Colombia',
            descripcion: 'El pais mas rico en cafe.'
        },
        {
            country: 'MX',
            name: 'Mexico',
            descripcion: 'El pais mas rico en tacos.'
        },
        {
            country: 'AR',
            name: 'Argentina',
            descripcion: 'El pais mas rico en empanadas.'
        },
        {
            country: 'CL',
            name: 'Chile',
            descripcion: 'El pais mas rico en vino.'
        },
        {
            country: 'PE',
            name: 'Peru',
            descripcion: 'El pais mas rico en machi.'
        },
        {
            country: 'EC',
            name: 'Ecuador',
            descripcion: 'El pais mas rico en cacao.'
        },
        {
            country: 'BO',
            name: 'Bolivia',
            descripcion: 'El pais mas rico en plata.'
        },
        {
            country: 'CO',
            name: 'Colombia',
            descripcion: 'El pais mas rico en cafe.'
        },
        {
            country: 'MX',
            name: 'Mexico',
            descripcion: 'El pais mas rico en tacos.'
        },
        {
            country: 'AR',
            name: 'Argentina',
            descripcion: 'El pais mas rico en empanadas.'
        },
        {
            country: 'CL',
            name: 'Chile',
            descripcion: 'El pais mas rico en vino.'
        },
        {
            country: 'PE',
            name: 'Peru',
            descripcion: 'El pais mas rico en machi.'
        },
        {
            country: 'EC',
            name: 'Ecuador',
            descripcion: 'El pais mas rico en cacao.'
        },
        {
            country: 'BO',
            name: 'Bolivia',
            descripcion: 'El pais mas rico en plata.'
        },
    ]
});

search1.init();
// search2.init();
// search3.init();
search4.init();

// search2.sort('name', 'asc').draw();