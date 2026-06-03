/**
 * Implementación de caché LRU (Least Recently Used o Menos Recientemente Utilizado).
 * @class LRUCache
 */
export class LRUCache {
    /**
     * Crea una instancia de LRUCache.
     * @param {number} maxSize - Tamaño máximo del caché (cantidad de items)
     * @param {number} ttlSeconds - Tiempo de vida en segundos
     */
    constructor(maxSize, ttlSeconds) {
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
    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            // Eliminar el primer elemento (el menos usado recientemente)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        // this.cache.set(key, value);
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
    get(key) {
        if (this.cache.has(key)) {
            const item = this.cache.get(key);
            
            // Verificar si expiró
            if (Date.now() > item.expiresAt) {
                this.cache.delete(key);
                return undefined;
            }
            
            // Renovar TTL y mover al final (LRU)
            this.cache.delete(key);
            this.cache.set(key, {
                value: item.value,
                expiresAt: Date.now() + (this.ttlSeconds * 1000)
            });
            return item.value;
        }
        return undefined;
    }
    /**
     * Verifica si una clave existe en el caché.
     * @param {string} key - Clave a verificar
     * @returns {boolean} True si existe, false si no
     */
    has(key) {
        return this.cache.has(key);
    }
    /**
     * Obtiene la cantidad de items almacenados en el caché.
     * @returns {number} Cantidad de elementos en el caché
     */
    size() {
        return this.cache.size;
    }
    /**
     * Limpia todo el caché, eliminando todos los items.
     * @returns {void}
     */
    clear() {
        this.cache.clear();
    }
}