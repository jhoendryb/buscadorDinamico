export declare class SearchingLocal {
    #private;
    /**
     * Extrae datos del DOM si no hay datos proporcionados en el constructor.
     * Busca elementos con clase '.items' y extrae sus atributos data-*.
     * @returns {boolean} true si se extrajeron datos del DOM, false si ya existían datos o no hay elementos
     */
    isExtractData(container: HTMLElement): Record<string, any>[] | null;
    /**
     * Realiza búsqueda local filtrando los datos en memoria.
     * Filtra el array de datos buscando coincidencias en cualquier campo.
     * @param {string} searchTerm - Término de búsqueda a filtrar
     * @param {boolean} [isEvent=false] - Si fue iniciado por evento del usuario (emite evento 'search')
     * @returns {any} Instancia de Search para encadenamiento
     */
    search(searchTerm: string, data: Record<string, any>[], sortBy?: string | null, sortOrder?: string): Record<string, any>[];
}
//# sourceMappingURL=searchingLocal.d.ts.map