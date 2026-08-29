import { SearchingServer } from '../../js/searching/searchingServer';
import { ErrorHandler } from '../../js/error-handler';

describe('SearchingServer', () => {
    let searchingServer: SearchingServer;
    let errorHandler: ErrorHandler;

    const fetchConfig = { url: 'http://test.com/api', method: 'POST', body: {} };

    beforeEach(() => {
        errorHandler = ErrorHandler.getInstance(true);
        searchingServer = new SearchingServer(errorHandler);
    });

    describe('search', () => {
        it('debe lanzar error si url no existe', async () => {
            const config = { ...fetchConfig, url: undefined as unknown as string };
            await expect(
                searchingServer.search('', config, 1, 10)
            ).rejects.toThrow();
        });

        it('debe lanzar error si método es inválido', async () => {
            const config = { ...fetchConfig, method: 'INVALID' };
            await expect(
                searchingServer.search('', config, 1, 10)
            ).rejects.toThrow();
        });
    });

    describe('respuesta vacía como caso válido', () => {
        const jsonResponse = (body: unknown): any => ({
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => body
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
            ).resolves.toEqual({ data: [], countPage: 0 });
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
