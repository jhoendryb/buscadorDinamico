import { Search } from '../../js/app.js';

describe('Search', () => {
    let testElement;

    beforeEach(() => {
        // Crea el elemento en el DOM antes de cada test
        testElement = document.createElement('div');
        testElement.className = 'test';
        document.body.appendChild(testElement);
    });

    afterEach(() => {
        // Limpia el DOM después de cada test
        document.body.removeChild(testElement);
    });

    test('debe inicializar correctamente', () => {
        const search = new Search({ element: '.test' });
        expect(search.element).toBe('.test');
    });

    test('debe lanzar error si element no existe', () => {
        expect(() => new Search({ element: '.non-existent' })).toThrow();
    });

    test('debe ordenar datos correctamente', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Zebra' }, { name: 'Aardvark' }, { name: 'Moose' }]
        });
        search.init();
        search.sort('name', 'asc');
        expect(search._data[0].name).toBe('Aardvark');
        expect(search._data[2].name).toBe('Zebra');
    });

    test('debe respetar debounceTime', async () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }, { name: 'Maria' }],
            debounceTime: 500
        });
        search.init();

        const input = search._body.inputSearch;
        input.value = 'juan';
        input.dispatchEvent(new Event('input'), { bubbles: true });

        expect(search._data.length).toBe(2); // Debe mostrar ambos resultados inmediatamente
        await new Promise(resolve => setTimeout(resolve, 600));
        expect(search._data.length).toBe(1); // Debe filtrar a solo 'Juan' después del debounce
    });

    test('debe respetar itemsPerPage', () => {
        const search = new Search({
            element: '.test',
            data: Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Item ${i}` }))
        });
        search.init();
        expect(search.pagination.getPageItems(search._data).length).toBe(10);
    });

    test('debe mostrar todos los items si busqueda esta vacia', () => {
        const search = new Search({
            element: '.test',
            data: Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Item ${i}` })),
        });
        search.searching('');
        expect(search._data.length).toBe(25);
    });

    test('debe filtrar sin importar mayúsculas/minúsculas', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }, { name: 'Maria' }]
        });
        search.searching('JUAN');
        expect(search._data.length).toBe(1);
        expect(search._data[0].name).toBe('Juan');
    });

    test('debe filtrar datos correctamente', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }, { name: 'Maria' }]
        });
        search.searching('juan');
        expect(search._data.length).toBe(1);
        expect(search._data[0].name).toBe('Juan');
    });

    test('debe usar template personalizado si se proporciona', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Zebra', age: 26 }, { name: 'Aardvark', age: 28 }, { name: 'Moose', age: 30 }],
            template: `<div>{{name}} - {{age}} años</div>`
        });
        search.on('renderItems', (data) => {
            const { content } = data;
            const item = content.querySelector('.items');
            expect(item.innerHTML).toContain('Zebra - 26 años');
        });
        search.init();
    });

    test('debe emitir evento cuando se selecciona un item', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Zebra', age: 26 }, { name: 'Aardvark', age: 28 }, { name: 'Moose', age: 30 }],
            template: `<div>{{name}} - {{age}} años</div>`
        });
        search.on('itemSelected', (data) => {
            const { item } = data;
            expect(item.innerHTML).toContain('Aardvark - 28 años');
        });
        search.on('renderItems', (data) => {
            const { content } = data;
            const item = content.querySelectorAll('.items')[1];
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            item.dispatchEvent(enterEvent);
        });
        search.init();
    });

    test('debe navegar items con teclado', async () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Zebra', age: 26 }, { name: 'Aardvark', age: 28 }, { name: 'Moose', age: 30 }],
            template: `<div>{{name}} - {{age}} años</div>`,
            keyboardEnabled: true
        });
        await search.init(); // Espera a que init termine

        const items = search._body.renderItems?.querySelectorAll('.items');
        expect(items.length).toBeGreaterThan(0);

        const contentElement = search._body.content;
        contentElement.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'ArrowDown',
            bubbles: true
        }));

        expect(search.selectedIndex).toBe(0);
    });

    test('debe usar caché correctamente', async () => {
        const search = new Search({
            element: '.test',
            data: [
                { name: 'Juan', age: 25 },
                { name: 'Maria', age: 30 },
                { name: 'Pedro', age: 35 }
            ],
            cacheEnabled: true,
            cacheMaxSize: 10
        });

        await search.init();

        // Primera búsqueda - debe almacenar en caché
        search.searching('juan');
        const firstResults = search._data;
        expect(firstResults.length).toBe(1);

        // Segunda búsqueda igual - debe usar caché
        search.searching('juan');
        expect(search._data).toEqual(firstResults);

        // Búsqueda diferente - no debe usar caché
        search.searching('maria');
        expect(search._data.length).toBe(1);
        expect(search._data[0].name).toBe('Maria');
    });

    test('debe emitir eventos correctamente', async () => {
        const search = new Search({
            element: '.test',
            data: [
                { name: 'Juan', age: 25 },
                { name: 'Maria', age: 30 }
            ]
        });

        const mockCallback = jest.fn();
        search.on('renderItems', mockCallback);

        await search.init();

        expect(mockCallback).toHaveBeenCalled();
        expect(mockCallback).toHaveBeenCalledWith(
            expect.objectContaining({
                items: expect.any(Array),
                content: expect.any(Object)
            })
        );
    });

    test('debe permitir encadenar on y off', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan', age: 25 }]
        });

        const mockCallback = jest.fn();
        const subscription = search.on('renderItems', mockCallback);

        expect(subscription).toHaveProperty('off');
        expect(typeof subscription.off).toBe('function');
    });

    test('debe navegar entre páginas', () => {
        const search = new Search({
            element: '.test',
            data: Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Item ${i}` }))
        });
        search.init();

        expect(search.pagination.getCurrentPage()).toBe(1);

        search.pagination.nextPage();
        expect(search.pagination.getCurrentPage()).toBe(2);

        search.pagination.prevPage();
        expect(search.pagination.getCurrentPage()).toBe(1);

        search.pagination.goToPage(3);
        expect(search.pagination.getCurrentPage()).toBe(3);
    });

});