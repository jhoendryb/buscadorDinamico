import { Pagination } from '../../js/pagination/index.js';

describe('Pagination', () => {
    test('debe crear instancia con itemsPerPage por defecto', () => {
        const pagination = new Pagination();
        expect(pagination.itemsPerPage).toBe(10);
        expect(pagination.getCurrentPage()).toBe(1);
    });

    test('debe crear instancia con itemsPerPage personalizado', () => {
        const pagination = new Pagination(5);
        expect(pagination.itemsPerPage).toBe(5);
    });

    test('debe calcular total de páginas correctamente', () => {
        const pagination = new Pagination(10);
        pagination.setCountFunction(() => 25);
        expect(pagination.getTotalPages()).toBe(3);
    });

    test('debe calcular total de páginas como 1 si no hay items', () => {
        const pagination = new Pagination(10);
        pagination.setCountFunction(() => 0);
        expect(pagination.getTotalPages()).toBe(1);
    });

    test('debe avanzar a siguiente página', () => {
        const pagination = new Pagination(10);
        pagination.setCountFunction(() => 30);

        expect(pagination.nextPage()).toBe(2);
        expect(pagination.getCurrentPage()).toBe(2);
    });

    test('no debe avanzar si está en última página', () => {
        const pagination = new Pagination(10);
        pagination.setCountFunction(() => 15);
        pagination.goToPage(2);

        expect(pagination.nextPage()).toBe(2);
    });

    test('debe retroceder a página anterior', () => {
        const pagination = new Pagination(10);
        pagination.setCountFunction(() => 30);
        pagination.goToPage(3);

        expect(pagination.prevPage()).toBe(2);
        expect(pagination.getCurrentPage()).toBe(2);
    });

    test('no debe retroceder si está en primera página', () => {
        const pagination = new Pagination(10);
        expect(pagination.prevPage()).toBe(1);
    });

    test('debe ir a página específica', () => {
        const pagination = new Pagination(10);
        pagination.setCountFunction(() => 50);

        expect(pagination.goToPage(3)).toBe(3);
        expect(pagination.getCurrentPage()).toBe(3);
    });

    test('no debe ir a página inválida', () => {
        const pagination = new Pagination(10);
        pagination.setCountFunction(() => 30);

        expect(pagination.goToPage(5)).toBe(1); // Página inválida, se queda en 1
    });

    test('debe ir a primera página', () => {
        const pagination = new Pagination(10);
        pagination.goToPage(3);

        expect(pagination.firstPage()).toBe(1);
        expect(pagination.getCurrentPage()).toBe(1);
    });

    test('debe ir a última página', () => {
        const pagination = new Pagination(10);
        pagination.setCountFunction(() => 35);

        expect(pagination.lastPage()).toBe(4);
        expect(pagination.getCurrentPage()).toBe(4);
    });

    test('debe obtener items de página actual', () => {
        const pagination = new Pagination(10);
        const data = Array.from({ length: 25 }, (_, i) => ({ id: i }));

        pagination.setCountFunction(() => data.length);
        pagination.goToPage(2);
        const pageItems = pagination.getPageItems(data);

        expect(pageItems.length).toBe(10);
        expect(pageItems[0].id).toBe(10);
        expect(pageItems[9].id).toBe(19);
    });

    test('debe cambiar itemsPerPage y recalcular página', () => {
        const pagination = new Pagination(10);
        pagination.setCountFunction(() => 30);
        pagination.goToPage(3);

        pagination.setItemsPerPage(5);

        expect(pagination.itemsPerPage).toBe(5);
        // Se mantiene pagina xq es menor a paginas totales (30/5 = 6 paginas)
        // Si fuese menor se recalcularia a 5 (la página actual sería 5)
        expect(pagination.getCurrentPage()).toBe(3);
    });

    test('debe cargar siguiente página', () => {
        const pagination = new Pagination(10);
        pagination.setCountFunction(() => 30);

        expect(pagination.loadNextPage()).toBe(2);
        expect(pagination.getCurrentPage()).toBe(2);
    });

    test('no debe cargar siguiente página si está en última', () => {
        const pagination = new Pagination(10);
        pagination.setCountFunction(() => 15);
        pagination.goToPage(2);

        expect(pagination.loadNextPage()).toBe(2);
    });

    test('debe detectar si hay más páginas', () => {
        const pagination = new Pagination(10);
        pagination.setCountFunction(() => 30);

        expect(pagination.hasMorePages()).toBe(true);

        pagination.goToPage(3);
        expect(pagination.hasMorePages()).toBe(false);
    });

    test('debe calcular total de items cargados', () => {
        const pagination = new Pagination(10);
        pagination.setDataItemsFunction(() => Array.from({ length: 25 }, (_, i) => ({ id: i })));

        pagination.goToPage(1);
        expect(pagination.getTotalLoaded()).toBe(10);

        pagination.goToPage(2);
        expect(pagination.getTotalLoaded()).toBe(20);
    });

    test('debe configurar función de datos', () => {
        const pagination = new Pagination(10);
        const dataFn = () => [{ id: 1 }, { id: 2 }];

        pagination.setDataItemsFunction(dataFn);

        const items = pagination.getPageItems();
        expect(items.length).toBe(2);
    });

});