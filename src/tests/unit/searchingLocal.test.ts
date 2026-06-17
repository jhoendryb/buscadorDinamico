import { SearchingLocal } from '../../js/searching/searchingLocal';
import { ErrorHandler, ErrorCode } from '../../js/error-handler';

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
        searchingLocal = new SearchingLocal(mockSearchInstance, errorHandler);
    });

    describe('isExtractData', () => {
        it('debe retornar false si ya hay datos', () => {
            mockSearchInstance.data = [{ id: 1 }];
            expect(searchingLocal.isExtractData()).toBe(false);
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
            searchingLocal.searching('juan');
            expect(mockSearchInstance._data).toHaveLength(1);
        });

        it('debe lanzar error si data no es array', () => {
            mockSearchInstance.data = 'invalid';
            expect(() => searchingLocal.searching('test')).toThrow();
        });
    });
});
