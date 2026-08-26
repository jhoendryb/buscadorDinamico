import { SearchingServer } from '../../js/searching/searchingServer';
import { ErrorHandler } from '../../js/error-handler';

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
        searchingServer = new SearchingServer(errorHandler);
    });

    describe('search', () => {
        it('debe lanzar error si url no existe', () => {
            mockSearchInstance.fetch.url = undefined;
            expect(async () => searchingServer.search('', mockSearchInstance.fetch, 1, 10)).rejects.toThrow();
        });

        it('debe lanzar error si método es inválido', () => {
            mockSearchInstance.fetch.method = 'INVALID';
            expect(async () => searchingServer.search('', mockSearchInstance.fetch, 1, 10)).rejects.toThrow();
        });
    });

    describe('SearchingServer › respuesta vacía como caso válido', () => {
        const jsonResponse = (body: unknown): any => ({
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => body
        });
        const fetchConfig = { url: 'http://test.com/api', method: 'POST', body: {} };
        let errorHandler: ErrorHandler;

        beforeEach(() => {
            errorHandler = ErrorHandler.getInstance(true);
        });

        afterEach(() => {
            delete (globalThis as any).fetch;
        });

        it('debe resolver { data: [], countPage: 0 } cuando el endpoint documentado devuelve cero resultados', async () => {
            (global as any).fetch = jest.fn().mockResolvedValue(
                jsonResponse({ data: [], countPage: 0 })
            );

            const server = new SearchingServer(errorHandler);

            await expect(
                server.search('xyzq-sin-coincidencias', fetchConfig, 1, 10)
            ).resolves.toEqual({ data: [], countPage: 0 });
        });

        it('debe ejecutar responseAdapter aunque la respuesta cruda sea un array vacío top-level', async () => {
            (global as any).fetch = jest.fn().mockResolvedValue(jsonResponse([]));

            const server = new SearchingServer(errorHandler, (response: any) => ({
                data: Array.isArray(response) ? response : [],
                countPage: Array.isArray(response) ? response.length : 0
            }));

            await expect(
                server.search('xyzq-sin-coincidencias', fetchConfig, 1, 10)
            ).resolves.toEqual({ data: [], countPage: 0 }); // ROJO hoy: lanza EMPTY_RESPONSE antes del adapter
        });

        it('debe seguir lanzando error ante JSON malformado (eso SÍ es un fallo real)', async () => {
            (global as any).fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => { throw new SyntaxError('Unexpected token'); }
            } as any);

            const server = new SearchingServer(errorHandler);

            await expect(
                server.search('', fetchConfig, 1, 10)
            ).rejects.toThrow();
        });
    });
});
