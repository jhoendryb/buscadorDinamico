import { Search } from '../../js/app';

// Mock de IntersectionObserver para Node.js
(global as any).IntersectionObserver = class IntersectionObserver {
    constructor(callback: any, options: any) {
        (this as any).callback = callback;
        (this as any).options = options;
    }
    observe(target: any) {
        // Simular que el elemento no es visible para no activar scroll infinito en tests
        (this as any).callback([{ isIntersecting: false, target }]);
    }
    unobserve(target: any) {
        // No hacer nada
    }
    disconnect() {
        // No hacer nada
    }
};

describe('Search', () => {
    let testElement: HTMLElement;

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
        expect(() => new Search({ element: '.non-existent' }).init()).toThrow();
    });

    test('debe ordenar datos correctamente', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Zebra' }, { name: 'Aardvark' }, { name: 'Moose' }]
        });
        search.init();
        search.sort('name', 'asc');
        if (!search._data) {
            throw new Error('search._data is null');
        }
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

        const input = search.renderer.body.inputSearch;
        input.value = 'juan';
        input.dispatchEvent(new Event('input'), { bubbles: true });

        if (!search._data) {
            throw new Error('search._data is null');
        }

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
        search.searching('', false);
        if (!search._data) {
            throw new Error('search._data is null');
        }
        expect(search._data.length).toBe(25);
    });

    test('debe filtrar sin importar mayúsculas/minúsculas', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }, { name: 'Maria' }]
        });
        search.searching('JUAN', false);
        if (!search._data) {
            throw new Error('search._data is null');
        }
        expect(search._data.length).toBe(1);
        expect(search._data[0].name).toBe('Juan');
    });

    test('debe filtrar datos correctamente', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }, { name: 'Maria' }]
        });
        search.searching('juan', false);
        if (!search._data) {
            throw new Error('search._data is null');
        }
        expect(search._data.length).toBe(1);
        expect(search._data[0].name).toBe('Juan');
    });

    test('debe usar template personalizado si se proporciona', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Zebra', age: 26 }, { name: 'Aardvark', age: 28 }, { name: 'Moose', age: 30 }],
            template: `<div>{{name}} - {{age}} años</div>`
        });
        search.on('renderItems', (data: any) => {
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
        search.on('itemSelected', (data: any) => {
            const { item } = data;
            expect(item.innerHTML).toContain('Aardvark - 28 años');
        });
        search.on('renderItems', (data: any) => {
            const { content } = data;
            const item = content.querySelectorAll('.items')[1];
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            item.dispatchEvent(enterEvent);
        });
        search.init();
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
        search.searching('juan', false);
        if (!search._data) {
            throw new Error('search._data is null');
        }
        const firstResults = search._data;
        expect(firstResults.length).toBe(1);

        // Segunda búsqueda igual - debe usar caché
        search.searching('juan', false);
        expect(search._data).toEqual(firstResults);

        // Búsqueda diferente - no debe usar caché
        search.searching('maria', false);
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

    test('debe limpiar recursos, eventos y DOM al llamar destroy', () => {
        const search = new Search({
            element: '.test',
            data: Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Item ${i}` }))
        });
        search.init();

        if (!search._data) {
            throw new Error('search._data is null');
        }
        expect(search._data).toBeDefined();
        expect(search._data.length).toBe(25);
        expect(search.renderer).toBeDefined();
        expect(search.events).toBeDefined();

        const mockCallback = jest.fn();
        search.on('destroy', mockCallback);

        search.destroy();

        expect(mockCallback).toHaveBeenCalled();
        expect(search._data).toBeNull();
        expect(search.data).toEqual([]);
        expect(search.pagination).toBeNull();
        expect(search.events).toBeNull();
        expect(search.cache).toBeNull();
        expect(search.renderer).toBeNull();
    });

    test('debe reiniciar ordenamiento al llamar clearSort', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Zebra' }, { name: 'Aardvark' }, { name: 'Moose' }]
        });
        search.init();
        search.sort('name', 'asc');

        expect(search.sortBy).toBe('name');
        expect(search.sortOrder).toBe('asc');

        const result = search.clearSort();

        expect(search.sortBy).toBeNull();
        expect(search.sortOrder).toBe('asc');
        expect(result).toBe(search);
    });

    test('debe generar clave única para caché', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }]
        });

        const key1 = search.getCacheKey('juan', 1);
        const key2 = search.getCacheKey('juan', 2);
        const key3 = search.getCacheKey('maria', 1);

        expect(key1).toBe('juan_1');
        expect(key2).toBe('juan_2');
        expect(key3).toBe('maria_1');
    });

    test('debe limpiar caché por prefijo', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }, { name: 'Maria' }],
            cacheEnabled: true,
            cacheMaxSize: 10
        });
        search.init();

        // EL PRIMER cache.set ES LA PRIMERA CARGA "" (VACIA)
        search.cache.set('juan_1', [{ name: 'Juan' }]);
        search.cache.set('juan_2', [{ name: 'Juan' }]);
        search.cache.set('maria_1', [{ name: 'Maria' }]);

        expect(search.cache.size()).toBe(4);

        const result = search.cache.clearCacheByPrefix('juan');

        // Solo maria_1 y la primera carga vacía
        expect(search.cache.size()).toBe(2);
        expect(search.cache.has('maria_1')).toBe(true);
        expect(result).toBe(search.cache); // Encadenamiento
    });

    test('debe mostrar indicador de carga', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }]
        });
        search.init();

        search.showLoading();

        const loadingElement = search.renderer.body.renderItems.querySelector('.search-loading');
        expect(loadingElement).toBeTruthy();
        expect(loadingElement.querySelector('.spinner')).toBeTruthy();
    });

    test('debe configurar navegación por teclado', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }, { name: 'Maria' }],
            keyboardEnabled: true
        });

        search.setupKeyboardNavigation();

        const content = search.renderer.body.content;
        expect(content).toBeTruthy();
    });

    test('debe procesar scroll infinito para primera página', () => {
        const search = new Search({
            element: '.test',
            data: Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Item ${i}` }))
        });
        search.init();

        search.pagination.goToPage(1);
        search.processInfiniteScroll();

        const items = search.renderer.body.renderItems.querySelectorAll('.items');
        expect(items.length).toBe(10); // itemsPerPage por defecto
    });

    // EVENTOS

    test('debe emitir evento init al inicializar', async () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }]
        });

        const mockCallback = jest.fn();
        search.on('init', mockCallback);

        await search.init();

        expect(mockCallback).toHaveBeenCalledWith(
            expect.objectContaining({
                searchTerm: "",
                itemsPerPage: 10,
                procesServer: false
            })
        );
    });

    test('debe emitir evento search al buscar', async () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }, { name: 'Maria' }]
        });

        const mockCallback = jest.fn();
        search.on('search', mockCallback);

        await search.draw('juan', true);

        expect(mockCallback).toHaveBeenCalled();
    });

    test('debe emitir evento pageChange al cambiar de página', () => {
        const search = new Search({
            element: '.test',
            data: Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Item ${i}` }))
        });
        search.init();

        const mockCallback = jest.fn();
        search.on('pageChange', mockCallback);

        search.processInfiniteScroll();

        expect(mockCallback).toHaveBeenCalledWith(
            expect.objectContaining({
                page: 1,
                totalPages: 3,
                itemsOnPage: 10
            })
        );
    });

    test('debe emitir evento sortChange al ordenar', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Zebra' }, { name: 'Aardvark' }]
        });
        search.init();

        const mockCallback = jest.fn();
        search.on('sortChange', mockCallback);

        search.sort('name', 'asc');

        expect(mockCallback).toHaveBeenCalledWith({ field: 'name', order: 'asc' });
    });

    test('debe emitir evento destroy al destruir', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }]
        });
        search.init();

        const mockCallback = jest.fn();
        search.on('destroy', mockCallback);

        search.destroy();

        expect(mockCallback).toHaveBeenCalledWith(
            expect.objectContaining({
                timestamp: expect.any(String)
            })
        );
    });

    //-----------------------

    test('debe permitir encadenamiento en draw', async () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }]
        });

        const result = await search.draw('juan');

        expect(result).toBe(search);
    });

    test('debe permitir encadenamiento en on', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }]
        });

        const result = search.on('test', jest.fn());

        expect(result).toBe(search.events);
    });

    test('debe permitir encadenamiento en showLoading', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }]
        });
        search.init();

        const result = search.showLoading();

        expect(result).toBe(search);
    });

    test('debe configurar zIndex correctamente', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }],
            zIndex: 9999
        });

        expect(search.zIndex).toBe(9999);
    });

    test('debe configurar sortBy y sortOrder', () => {
        const search = new Search({
            element: '.test',
            data: [{ name: 'Juan' }],
            sortBy: 'name',
            sortOrder: 'desc'
        });

        expect(search.sortBy).toBe('name');
        expect(search.sortOrder).toBe('desc');
    });

});