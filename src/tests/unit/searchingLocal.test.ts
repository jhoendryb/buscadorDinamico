import { SearchingLocal } from '../../js/searching/searchingLocal';
import { ErrorHandler } from '../../js/error-handler';

describe('SearchingLocal', () => {
    let searchingLocal: SearchingLocal;
    let mockSearchInstance: any;
    let errorHandler: ErrorHandler;

    beforeEach(() => {
        errorHandler = ErrorHandler.getInstance(true);
        mockSearchInstance = {
            data: [],
            searchTerm: '',
            cacheEnabled: false,
            renderer: {
                body: {
                    content: document.createElement('div')
                }
            },
            pagination: {
                goToPage: jest.fn(),
                getCurrentPage: jest.fn(() => 1)
            },
            cache: {
                clearCacheByPrefix: jest.fn(),
                get: jest.fn(),
                set: jest.fn()
            },
            sortBy: null,
            sortOrder: 'asc',
            events: {
                emit: jest.fn()
            },
            getCacheKey: jest.fn(() => 'cache-key'),
            processInfiniteScroll: jest.fn(),
            sort: jest.fn()
        };
        searchingLocal = new SearchingLocal();
    });

    describe('isExtractData', () => {
        it('debe retornar false si ya hay datos', () => {
            mockSearchInstance.data = [{ id: 1 }];
            // Agregar un elemento de ejemplo al DOM para que se extraigan datos
            const container = document.createElement('div');
            // Sin flag class="items" para el ejemplo
            container.innerHTML = `
                <div data-id="1" data-name="Juan">
                <div data-id="2" data-name="Maria">
            `;
            document.body.appendChild(container);
            expect(searchingLocal.isExtractData(container)).toBe(null);
            // Limpiar el ejemplo del DOM
            document.body.removeChild(container);
        });

        it('debe extraer datos del DOM', () => {
            // Test de extracción de datos
        });
    });

    describe('searching', () => {
        it('debe filtrar datos correctamente', () => {
            mockSearchInstance.data = [
                { name: 'Juan', id: 1 },
                { name: 'Maria', id: 2 }
            ];
            const result = searchingLocal.search('juan', mockSearchInstance.data);
            expect(result).toHaveLength(1);
        });

        it('debe lanzar error si data no es array', () => {
            mockSearchInstance.data = 'invalid';
            expect(() => searchingLocal.search('test', mockSearchInstance.data)).toThrow();
        });
    });
});
