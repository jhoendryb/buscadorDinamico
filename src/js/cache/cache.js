/**
 * Implementación de caché LRU (Least Recently Used).
 * @class
 */
export class LRUCache {
    /**
     * Crea una instancia de LRUCache.
     * @param {number} [maxSize=50] - Tamaño máximo del caché
     */
    constructor(maxSize = 50) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    /**
     * Almacena un valor en el caché.
     * @param {string} key - Clave del valor
     * @param {*} value - Valor a almacenar
     */
    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            // Eliminar el primer elemento (el menos usado recientemente)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
    /**
     * Obtiene un valor del caché.
     * @param {string} key - Clave del valor
     * @returns {*} Valor almacenado o undefined si no existe
     */
    get(key) {
        if (this.cache.has(key)) {
            // Mover al final (marcar como recientemente usado)
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
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
     * Limpia todo el caché.
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Obtiene el tamaño actual del caché.
     * @returns {number} Cantidad de elementos en el caché
     */
    size() {
        return this.cache.size;
    }
}