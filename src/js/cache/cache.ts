/**
 * Implementación de caché LRU (Least Recently Used o Menos Recientemente Utilizado).
 * @class LRUCache
 */
export class LRUCache {
    private cache: Map<string, { value: any; expiresAt: number }>;
    public maxSize: number;
    public ttlSeconds: number;
    /**
     * Crea una instancia de LRUCache.
     * @param {number} maxSize - Tamaño máximo del caché (cantidad de items)
     * @param {number} ttlSeconds - Tiempo de vida en segundos
     */
    constructor(maxSize: number = 50, ttlSeconds: number = 300) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttlSeconds = ttlSeconds;
    }
    /**
     * Almacena un valor en el caché.
     * @param {string} key - Clave única para identificar el valor
     * @param {*} value - Valor a almacenar (puede ser cualquier tipo)
     * @returns {void}
     */
    set(key: string, value: any): void {
        this.cleanup();

        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.delete(firstKey);
            }
        }
        // Guardar con timestamp de expiración
        this.cache.set(key, {
            value: value,
            expiresAt: Date.now() + (this.ttlSeconds * 1000)
        });
    }
    /**
     * Obtiene un valor del caché.
     * @param {string} key - Clave del valor a obtener
     * @returns {*|undefined} Valor almacenado o undefined si no existe
     */
    get(key: string): any | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        // Verificar expiración
        if (Date.now() > entry.expiresAt) {
            this.delete(key);
            return undefined;
        }

        // Actualizar como recientemente usado
        this.delete(key);
        this.cache.set(key, {
            value: entry.value,
            expiresAt: Date.now() + (this.ttlSeconds * 1000)
        });
        return entry.value;
    }
    /**
     * Verifica si una clave existe en el caché.
     * @param {string} key - Clave a verificar
     * @returns {boolean} True si existe, false si no
     */
    has(key: string): boolean {
        return (this.cache.has(key) && (this.get(key) !== undefined));
    }
    /**
     * Obtiene la cantidad de items almacenados en el caché.
     * @returns {number} Cantidad de elementos en el caché
     */
    size(): number {
        this.cleanup();
        return this.cache.size;
    }
    /**
     * Limpia todo el caché, eliminando todos los items.
     * @returns {void}
     */
    clear(): void {
        this.cache.clear();
    }
    /**
     * Limpia la caché por prefijo de término de búsqueda.
     * @param {string} searchTerm - Término de búsqueda a limpiar
     * @returns {LRUCache} Instancia actual para encadenamiento
     */
    clearCacheByPrefix(searchTerm: string): LRUCache {
        for (const key of this.cache.keys()) {
            if (key.startsWith(searchTerm)) {
                this.delete(key);
            }
        }
        return this;
    }

    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.delete(key);
            }
        }
    }
}