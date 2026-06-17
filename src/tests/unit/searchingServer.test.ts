import { SearchingServer } from '../../js/searching/searchingServer';
import { ErrorHandler, ErrorCode } from '../../js/error-handler';

describe('SearchingServer', () => {
    let searchingServer: SearchingServer;
    let mockSearchInstance: any;
    let errorHandler: ErrorHandler;

    beforeEach(() => {
        errorHandler = ErrorHandler.getInstance(true);
        mockSearchInstance = {
            fetch: {
                url: 'http://test.com/api',
                method: 'POST',
                body: {}
            },
            searchTerm: '',
            cacheEnabled: false,
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
            itemsPerPage: 10,
            events: {
                emit: jest.fn()
            },
            getCacheKey: jest.fn(() => 'cache-key'),
            processInfiniteScroll: jest.fn(),
            _ajaxResponse: {}
        };
        searchingServer = new SearchingServer(mockSearchInstance, errorHandler);
    });

    describe('ajax', () => {
        it('debe lanzar error si url no existe', () => {
            mockSearchInstance.fetch.url = undefined;
            expect(async () => searchingServer.ajax(mockSearchInstance.fetch)).rejects.toThrow();
        });

        it('debe lanzar error si método es inválido', () => {
            mockSearchInstance.fetch.method = 'INVALID';
            expect(async () => searchingServer.ajax(mockSearchInstance.fetch)).rejects.toThrow();
        });
    });
});
