import * as Types from '../types';
import { ErrorHandler, ErrorCode, SearchError } from '../error-handler';

export class SearchingLocal {
    private searchInstance: any;
    private errorHandler: ErrorHandler;

    constructor(searchInstance: any, errorHandler: ErrorHandler) {
        this.searchInstance = searchInstance;
        this.errorHandler = errorHandler;
    }

    /**
     * Extrae datos del DOM si no hay datos proporcionados.
     */
    isExtractData(): boolean {
        try {
            const data = this.searchInstance.data;
            
            // Validación con ErrorHandler
            if (!Array.isArray(data)) {
                this.errorHandler.validateType(data, 'array', 'data', ErrorCode.INVALID_DATA_FORMAT);
            }

            if (data.length > 0) return false;

            const items = this.searchInstance.renderer.body.content.querySelectorAll('.items') as HTMLElement[];
            
            if (items.length === 0) return false;

            this.searchInstance.data = Array.from(items).map((item: HTMLElement) => {
                const dataItem: any = {};
                Array.from(item.attributes).forEach((attr: any) => {
                    if (attr.name.startsWith('data-')) {
                        dataItem[attr.name.replace('data-', '')] = attr.value.trim();
                    }
                });
                dataItem.children = item.innerHTML.trim();
                return dataItem;
            });

            this.searchInstance._data = this.searchInstance.data;
            return true;
        } catch (error) {
            if (error instanceof SearchError) {
                this.errorHandler.logError(error);
            }
            throw error;
        }
    }

    /**
     * Realiza búsqueda local filtrando los datos en memoria.
     */
    searching(searchTerm: string, isEvent: boolean = false): any {
        try {
            if (this.searchInstance.searchTerm === searchTerm && searchTerm !== "") {
                return this.searchInstance;
            }

            // Validaciones con ErrorHandler
            if (!Array.isArray(this.searchInstance.data)) {
                this.errorHandler.throwCustomError(ErrorCode.INVALID_DATA_FORMAT, {
                    context: 'searchingLocal',
                    dataType: typeof this.searchInstance.data
                });
            }

            if (this.searchInstance.cacheEnabled) {
                this.searchInstance.cache.clearCacheByPrefix(this.searchInstance.searchTerm);
            }

            this.searchInstance.pagination.goToPage(1);

            const cacheKey = this.searchInstance.getCacheKey(searchTerm, this.searchInstance.pagination.getCurrentPage());
            const cachedData = this.searchInstance.cache.get(cacheKey);
            
            if (this.searchInstance.cacheEnabled && cachedData && !isEvent) {
                this.searchInstance._data = cachedData;
                this.searchInstance.processInfiniteScroll();
                return this.searchInstance;
            }

            this.searchInstance._data = this.searchInstance.data.filter((item: Record<string, any>) => {
                const values = Object.values(item);
                return values.some((value: any) =>
                    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
            });

            if (this.searchInstance.sortBy) {
                this.searchInstance.sort(this.searchInstance.sortBy, this.searchInstance.sortOrder);
            }

            this.searchInstance.searchTerm = searchTerm;

            if (this.searchInstance.cacheEnabled) {
                this.searchInstance.cache.set(cacheKey, this.searchInstance._data);
            }

            if (isEvent) {
                this.searchInstance.events.emit('search', {
                    searchTerm,
                    results: this.searchInstance._data,
                    totalResults: this.searchInstance._data.length,
                    timestamp: new Date().toISOString()
                } as Types.SearchEventData);
            }

            return this.searchInstance;
        } catch (error) {
            if (error instanceof SearchError) {
                this.errorHandler.logError(error);
            }
            throw error;
        }
    }
}
