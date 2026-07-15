/**
 * Implementación de caché LRU (Least Recently Used o Menos Recientemente Utilizado).
 * @class LRUCache
 */
export class LRUCache<T = any> {
    private cache: Map<string, { value: T; expiresAt: number }>;
    readonly maxSize: number;
    readonly ttlSeconds: number;
    public stats: {
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
    constructor(maxSize: number = 50, ttlSeconds: number = 300) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttlSeconds = ttlSeconds;
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };
    }
    /**
     * Almacena un valor en el caché.
     * @param {string} key - Clave única para identificar el valor
     * @param {*} value - Valor a almacenar (puede ser cualquier tipo)
     * @returns {void}
     */
    set(key: string, value: T): void {
        if (this.cache.has(key)) {
            this.cache.set(key, {
                value,
                expiresAt: Date.now() + (this.ttlSeconds * 1000)
            });
            return;
        }

        if (this.cache.size >= this.maxSize) {
            this.cleanup();
        }

        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.delete(firstKey);
                this.stats.evictions++;
            }
        }

        this.cache.set(key, {
            value,
            expiresAt: Date.now() + (this.ttlSeconds * 1000)
        });
    }

    /**
     * Obtiene un valor del caché o lo carga si no existe.
     * @param {string} key - Clave del valor a obtener
     * @param {() => Promise<T>} fetch - Función para cargar el valor si no existe en el caché
     * @param {() => void} onMiss - Función para ejecutar cuando el valor no existe en el caché
     * @returns {Promise<T>} Valor almacenado o cargado
     */
    async getOrFetch(
        key: string,
        fetch: () => Promise<T>,
        onMiss?: () => void
    ): Promise<T> {
        const cached = this.get(key);
        if (cached !== undefined) return cached;

        if (onMiss) onMiss();

        const value = await fetch();
        this.set(key, value);
        return value;
    }
    /**
     * Obtiene un valor del caché.
     * @param {string} key - Clave del valor a obtener
     * @returns {*|undefined} Valor almacenado o undefined si no existe
     */
    get(key: string): T | undefined {
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            return undefined
        };

        // Verificar expiración
        if (Date.now() > entry.expiresAt) {
            this.delete(key);
            this.stats.misses++;
            return undefined;
        }

        this.stats.hits++;
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
        const entry = this.cache.get(key);
        if (!entry) return false;
        if (Date.now() > entry.expiresAt) return false;
        return true;
    }
    /**
     * Obtiene la cantidad de items almacenados en el caché.
     * @returns {number} Cantidad de elementos en el caché
     */
    size(): number {
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
    clearCacheByPrefix(searchTerm: string): LRUCache<T> {
        if (!searchTerm) return this;
        for (const key of this.cache.keys()) {
            if (key.startsWith(searchTerm)) {
                this.delete(key);
            }
        }
        return this;
    }

    /**
     * Elimina un elemento del caché por su clave.
     * @param {string} key - Clave del elemento a eliminar
     * @returns {boolean} true si el elemento fue eliminado, false si no existía
     */
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