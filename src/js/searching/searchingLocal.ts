import * as Types from '../types';
/**
 * Objeto que contiene la lógica de búsqueda en modo local (client-side).
 * Se asigna dinámicamente a la instancia Search cuando procesServer es false.
 * @namespace
 */
export const searchingLocal = {
    /**
     * Extrae datos del DOM si no hay datos proporcionados.
     * Busca elementos con la clase '.items' y extrae sus atributos data-.
     * @returns {boolean} True si extrajo datos, false si ya existían
     */
    isExtractData() {
        if ((this as any).data.length > 0) return false;

        const items = (this as any).renderer.body.content.querySelectorAll('.items') as HTMLElement[];
        if (items.length === 0) return false;

        (this as any).data = Array.from(items).map((item: HTMLElement) => {
            const data: any = {};
            Array.from(item.attributes).forEach((attr: any) => {
                if (attr.name.startsWith('data-')) {
                    data[attr.name.replace('data-', '')] = attr.value.trim();
                }
            });
            data.children = item.innerHTML.trim();
            return data;
        });

        (this as any)._data = (this as any).data;

        console.log((this as any)._data, "Quien soy loco");
        return true;
    },

    /**
     * Realiza búsqueda local filtrando los datos en memoria.
     * Usa caché si está habilitado y ordena si sortBy está configurado.
     * @param {string} searchTerm - Término de búsqueda
     * @param {boolean} [isEvent=false] - Si fue iniciado por evento del usuario
     * @returns {Search} Instancia de Search para encadenamiento
     */
    searching(searchTerm: string, isEvent: boolean = false): any {
        if ((this as any).searchTerm === searchTerm && searchTerm != "") return this;

        if ((this as any).cacheEnabled) {
            (this as any).cache.clearCacheByPrefix((this as any).searchTerm);
        }

        (this as any).pagination.goToPage(1)

        const cacheKey = (this as any).getCacheKey(searchTerm, (this as any).pagination.getCurrentPage());
        const cachedData = (this as any).cache.get(cacheKey);
        if ((this as any).cacheEnabled && cachedData && !isEvent) {
            (this as any)._data = cachedData;
            (this as any).processInfiniteScroll();
            return;
        }

        // if (!(this as any).isExtractData()) {
        //     (this as any)._data = (this as any).data;
        // }

        (this as any)._data = (this as any).data.filter((element: Record<string, any>) => {
            const values = Object.values(element);
            return values.some((value: any) =>
                value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        if ((this as any).sortBy) {
            (this as any).sort((this as any).sortBy, (this as any).sortOrder);
        }

        (this as any).searchTerm = searchTerm;

        if ((this as any).cacheEnabled) {
            (this as any).cache.set(cacheKey, (this as any)._data);
        }

        if (isEvent) {
            (this as any).events.emit('search', {
                searchTerm,
                results: (this as any)._data,
                totalResults: (this as any)._data.length,
                timestamp: new Date().toISOString()
            } as Types.SearchEventData);
        }

        return this;
    }
};
