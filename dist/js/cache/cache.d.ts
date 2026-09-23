/**
 * Implementación de caché LRU (Least Recently Used o Menos Recientemente Utilizado).
 * @class LRUCache
 */
export declare class LRUCache<T = any> {
    private cache;
    readonly maxSize: number;
    readonly ttlSeconds: number;
    stats: {
        hits: number;
        misses: number;
        evictions: number;
    };
    /**
     * Crea una instancia de LRUCache.
     * @param {number} maxSize - Tamaño máximo del caché (cantidad de items)
     * @param {number} ttlSeconds - Tiempo de vida en segundos
     * @property {Object} stats - Estatísticas de uso de la caché
     * @property {number} stats.hits - Cantidad de consultas que encontraron un valor válido
     * @property {number} stats.misses - Cantidad de consultas que no encontraron un valor válido
     * @property {number} stats.evictions - Cantidad de inserciones que requirieron eliminar un valor por LRU
     */
    constructor(maxSize?: number, ttlSeconds?: number);
    /**
     * Almacena un valor en el caché.
     * @param {string} key - Clave única para identificar el valor
     * @param {*} value - Valor a almacenar (puede ser cualquier tipo)
     * @returns {void}
     */
    set(key: string, value: T): void;
    /**
     * Obtiene un valor del caché.
     * @param {string} key - Clave del valor a obtener
     * @returns {*|undefined} Valor almacenado o undefined si no existe
     */
    get(key: string): T | undefined;
    /**
     * Verifica si una clave existe en el caché.
     * @param {string} key - Clave a verificar
     * @returns {boolean} True si existe, false si no
     */
    has(key: string): boolean;
    /**
     * Obtiene la cantidad de items almacenados en el caché.
     * @returns {number} Cantidad de elementos en el caché
     */
    size(): number;
    /**
     * Limpia todo el caché, eliminando todos los items.
     * @returns {void}
     */
    clear(): void;
    /**
     * Limpia la caché por prefijo de término de búsqueda.
     * @param {string} searchTerm - Término de búsqueda a limpiar
     * @returns {LRUCache} Instancia actual para encadenamiento
     */
    clearCacheByPrefix(searchTerm: string): LRUCache<T>;
    /**
     * Elimina un elemento del caché por su clave.
     * @param {string} key - Clave del elemento a eliminar
     * @returns {boolean} true si el elemento fue eliminado, false si no existía
     */
    delete(key: string): boolean;
    private cleanup;
}
//# sourceMappingURL=cache.d.ts.map