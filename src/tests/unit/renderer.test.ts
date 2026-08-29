import { SearchRenderer } from '../../js/renderer/index';
import { EventEmitter } from '../../js/events/index';

describe('SearchRenderer', () => {
    let testElement: HTMLDivElement;
    let renderer: SearchRenderer;
    let events: EventEmitter;

    beforeEach(() => {
        testElement = document.createElement('div');
        testElement.className = 'test';
        document.body.appendChild(testElement);

        events = new EventEmitter();
        renderer = new SearchRenderer({
            content: testElement,
            contentSearch: undefined,
            inputSearch: undefined,
            renderItems: undefined,
            paginationItems: undefined
        }, (baseClass) => `${baseClass}-test`, 300);

        jest.useFakeTimers();
    });

    afterEach(() => {
        document.body.removeChild(testElement);
    });

    test('debe generar nombre de clase único', () => {
        const className = renderer.getUniqueClassName('input-search');
        expect(className).toBe('input-search-test');
    });

    test('debe renderizar contenedor de búsqueda', () => {
        const contentSearch = renderer.contentSearch();

        expect(contentSearch).toBeTruthy();
        expect(contentSearch.className).toContain('input-search');
        expect(renderer.body.contentSearch).toBe(contentSearch);
    });

    test('no debe duplicar contenedor de búsqueda', () => {
        renderer.contentSearch();
        const contentSearch2 = renderer.contentSearch();

        expect(contentSearch2).toBe(renderer.body.contentSearch);
    });

    test('debe renderizar input de búsqueda con debounce', () => {
        renderer.contentSearch();
        const mockCallback = jest.fn();

        const inputSearch = renderer.renderSearch({
            onInput: mockCallback,
            debounceTime: 100,
            placeholder: 'Buscar...',
            ariaLabel: 'Label de prueba'
        });

        expect(inputSearch).toBeTruthy();
        expect(inputSearch.tagName).toBe('INPUT');
        expect((inputSearch as HTMLInputElement).placeholder).toBe('Buscar...');
        expect(inputSearch.getAttribute('aria-label')).toBe('Label de prueba');
        expect(renderer.body.inputSearch).toBe(inputSearch);
    });

    test('debe renderizar contenedor de items', () => {
        const renderItems = renderer.renderItems();

        expect(renderItems).toBeTruthy();
        expect(renderItems.className).toContain('items-search');
        expect(renderItems.getAttribute('role')).toBe('listbox');
        expect(renderer.body.renderItems).toBe(renderItems);
    });

    test('debe renderizar contenedor de paginación', () => {
        const pagination = renderer.renderPagination();

        expect(pagination).toBeTruthy();
        expect(pagination.className).toContain('pagination-items');
        expect(pagination.getAttribute('role')).toBe('status');
        expect(renderer.body.paginationItems).toBe(pagination);
    });

    test('debe renderizar componentes en orden sip', () => {
        renderer.renderByDom('sip', {
            search: {
                onInput: jest.fn(),
                debounceTime: 100
            }
        });

        expect(renderer.body.contentSearch).toBeTruthy();
        expect(renderer.body.inputSearch).toBeTruthy();
        expect(renderer.body.renderItems).toBeTruthy();
        expect(renderer.body.paginationItems).toBeTruthy();
    });

    test('debe renderizar componentes en orden ip (sin search)', () => {
        renderer.renderByDom('ip', {});

        expect(renderer.body.contentSearch).toBeFalsy();
        expect(renderer.body.inputSearch).toBeFalsy();
        expect(renderer.body.renderItems).toBeTruthy();
        expect(renderer.body.paginationItems).toBeTruthy();
    });

    test('debe renderizar items con template string', () => {
        renderer.renderItems();

        const data = [{ name: 'Juan', age: 25 }];
        renderer.appendItems(data, '<div>{{name}} - {{age}}</div>', 'No results', events);

        const items = renderer.body.renderItems?.querySelectorAll('.items');
        expect(items?.length).toBe(1);
        expect(items?.[0].innerHTML).toContain('Juan - 25');
    });

    test('debe renderizar items con template función', () => {
        renderer.renderItems();

        const data = [{ name: 'Juan', age: 25 }];
        const templateFn = (item: any) => `<div>${item.name.toUpperCase()}</div>`;
        renderer.appendItems(data, templateFn, 'No results', events);

        const items = renderer.body.renderItems?.querySelectorAll('.items');
        expect(items?.length).toBe(1);
        expect(items?.[0].innerHTML).toContain('JUAN');
    });

    test('debe renderizar items sin template', () => {
        renderer.renderItems();

        const data = [{ name: 'Juan', age: 25 }];
        renderer.appendItems(data, null, 'No results', events);

        const items = renderer.body.renderItems?.querySelectorAll('.items');
        expect(items?.length).toBe(1);
        expect(items?.[0].textContent).toBe('Juan 25');
    });

    test('debe mostrar mensaje cuando no hay resultados', () => {
        renderer.renderItems();

        renderer.appendItems([], null, 'Sin resultados', events);

        const items = renderer.body.renderItems?.querySelectorAll('.items');
        expect(items?.length).toBe(1);
        expect(items?.[0].textContent).toBe('Sin resultados');
    });

    test('debe emitir evento appendItems', () => {
        renderer.renderItems();

        const mockCallback = jest.fn();
        events.on('appendItems', mockCallback);

        const data = [{ name: 'Juan' }];
        renderer.appendItems(data, null, 'No results', events, true);

        expect(mockCallback).toHaveBeenCalledWith({
            items: data,
            content: renderer.body.renderItems
        });
    });

    test('debe retornar false si no hay contenedor de items', () => {
        const result = renderer.appendItems([], null, 'No results', events);
        expect(result).toBe(false);
    });

    test('debe agregar items al contenedor existente', () => {
        renderer.renderItems();

        const data1 = [{ name: 'Juan' }];
        renderer.appendItems(data1, null, 'No results', events);

        const data2 = [{ name: 'Maria' }];
        renderer.appendItems(data2, null, 'No results', events);

        const items = renderer.body.renderItems?.querySelectorAll('.items');
        expect(items?.length).toBe(2);
    });

    test('debe actualizar contador de paginación', () => {
        renderer.renderItems();
        renderer.renderPagination();

        renderer.updateCounter({
            from: 10,
            to: 25,
            total: 100
        });

        const counter = renderer.body.paginationItems?.querySelector('.items-counter');
        expect(counter?.textContent).toContain('10');
        expect(counter?.textContent).toContain('25');
    });

        test('debe abrir resultados vía visibility', () => {
        renderer.renderItems();
        renderer.renderContentPaginationItems();

        renderer.visibility.open('programmatic');

        expect(renderer.body.contentPaginationItems?.classList.contains('content-pagination-visible')).toBe(true);
        expect(renderer.body.contentPaginationItems?.hasAttribute('hidden')).toBe(false);
        expect(renderer.visibility.isOpen).toBe(true);
    });

    test('debe cerrar y commitear hidden tras el fade', () => {
        renderer.renderItems();
        renderer.renderContentPaginationItems();

        renderer.visibility.open('programmatic');
        jest.advanceTimersByTime(300);
        renderer.visibility.close({ reason: 'blur' });
        jest.advanceTimersByTime(300);

        expect(renderer.visibility.phase).toBe('closed');
        expect(renderer.body.contentPaginationItems?.getAttribute('hidden')).toBe('true');
    });

    test('debe renderizar en orden SEARCH_CONTENT_ITEMS_PAGINATION', () => {
        renderer.renderByDom('scip', {
            search: {
                onInput: jest.fn(),
                debounceTime: 100
            }
        });

        expect(renderer.body.contentSearch).toBeTruthy();
        expect(renderer.body.inputSearch).toBeTruthy();
        expect(renderer.body.renderItems).toBeTruthy();
        expect(renderer.body.paginationItems).toBeTruthy();

        // Verificar orden en el DOM
        const children = renderer.body.content?.children;
        expect(children?.[0].className).toContain('input-search');
        expect(children?.[1].className).toContain('content-pagination-items');
    });

    test('debe sincronizar aria-expanded y aria-hidden al abrir/cerrar', () => {
        renderer.renderItems();
        renderer.renderContentPaginationItems();
        renderer.renderSearch({
            onInput: jest.fn(),
            debounceTime: 100,
        });

        renderer.visibility.open('programmatic');
        expect(renderer.body.inputSearch?.getAttribute('aria-expanded')).toBe('true');
        expect(renderer.body.renderItems?.getAttribute('aria-hidden')).toBe('false');

        renderer.visibility.close({ reason: 'programmatic', immediate: true });
        expect(renderer.body.inputSearch?.getAttribute('aria-expanded')).toBe('false');
        expect(renderer.body.renderItems?.getAttribute('aria-hidden')).toBe('true');
    });

    test('debe destruir el visibility manager y limpiar estado', () => {
        renderer.renderItems();
        renderer.renderContentPaginationItems();

        renderer.visibility.open('programmatic');
        jest.advanceTimersByTime(300);

        renderer.destroy();

        expect(renderer.visibility.phase).toBe('closed');
        expect(renderer.visibility.isOpen).toBe(false);
        // Post-destroy open should be a no-op
        renderer.visibility.open('programmatic');
        expect(renderer.visibility.phase).toBe('closed');
    });

    test('debe cerrar inmediatamente sin timers con immediate: true', () => {
        renderer.renderItems();
        renderer.renderContentPaginationItems();

        renderer.visibility.open('programmatic');
        jest.advanceTimersByTime(300);

        renderer.visibility.close({ reason: 'select', immediate: true });

        expect(renderer.visibility.phase).toBe('closed');
        expect(renderer.body.contentPaginationItems?.getAttribute('hidden')).toBe('true');
        expect(jest.getTimerCount()).toBe(0);
    });

    test('debe alternar visibilidad via toggle', () => {
        renderer.renderItems();
        renderer.renderContentPaginationItems();

        renderer.visibility.toggle();
        expect(renderer.visibility.isOpen).toBe(true);

        renderer.visibility.toggle();
        expect(renderer.visibility.phase).toBe('closing');

        jest.advanceTimersByTime(300);
        expect(renderer.visibility.isOpen).toBe(false);
    });

});