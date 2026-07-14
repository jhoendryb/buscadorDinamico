export class SearchingLocal {

    /**
     * Extrae datos del DOM si no hay datos proporcionados en el constructor.
     * Busca elementos con clase '.items' y extrae sus atributos data-*.
     * @returns {boolean} true si se extrajeron datos del DOM, false si ya existían datos o no hay elementos
     */
    isExtractData(container: HTMLElement): Record<string, any>[] | null {
        const items = container.querySelectorAll('.items');
        if (items.length === 0) return null;

        return Array.from(items).map((item: Element) => {
            const dataItem: any = {};
            Array.from(item.attributes).forEach((attr: any) => {
                if (attr.name.startsWith('data-')) {
                    dataItem[attr.name.replace('data-', '')] = attr.value.trim();
                }
            });
            dataItem.children = item.innerHTML.trim();
            return dataItem;
        });
    }

    /**
     * Realiza búsqueda local filtrando los datos en memoria.
     * Filtra el array de datos buscando coincidencias en cualquier campo.
     * @param {string} searchTerm - Término de búsqueda a filtrar
     * @param {boolean} [isEvent=false] - Si fue iniciado por evento del usuario (emite evento 'search')
     * @returns {any} Instancia de Search para encadenamiento
     */
    search(
        searchTerm: string,
        data: Record<string, any>[],
        sortBy?: string | null,
        sortOrder?: string
    ): Record<string, any>[] {
        if (searchTerm === "" || !searchTerm) return data;

        const filtered = data.filter(item => {
            const values = this.#flattenValues(item);
            return values.some(value =>
                this.#normalize(String(value)).includes(this.#normalize(searchTerm))
            );
        });

        if (sortBy) {
            filtered.sort((a, b) => {
                const valA = a[sortBy];
                const valB = b[sortBy];
                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }

    #flattenValues(obj: any): string[] {
        if (typeof obj !== 'object' || obj === null) return [String(obj)];
        return Object.values(obj).flatMap(v => this.#flattenValues(v));
    }

    #normalize(s: string): string {
        return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }
}
