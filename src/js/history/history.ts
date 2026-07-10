export class SearchHistory {
    private history: string[] = [];
    private maxItems: number;

    constructor(maxItems: number = 10) {
        this.maxItems = maxItems;
        this.#loadFromStorage();
    }

    add(searchTerm: string): void {
        if (!searchTerm.trim()) return;
        
        // Remover si ya existe
        this.history = this.history.filter(term => term !== searchTerm);
        
        // Agregar al inicio
        this.history.unshift(searchTerm);
        
        // Limitar tamaño
        if (this.history.length > this.maxItems) {
            this.history = this.history.slice(0, this.maxItems);
        }
        
        this.#saveToStorage();
    }

    get(): string[] {
        return this.history;
    }

    clear(): void {
        this.history = [];
        this.#saveToStorage();
    }

    #loadFromStorage(): void {
        const stored = localStorage.getItem('search-history');
        if (stored) {
            this.history = JSON.parse(stored);
        }
    }

    #saveToStorage(): void {
        localStorage.setItem('search-history', JSON.stringify(this.history));
    }
}
