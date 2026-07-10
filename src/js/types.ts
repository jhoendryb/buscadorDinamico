export interface SearchParams {
    element: string;
    theme?: string;
    searchTerm?: string;
    data?: Object[];
    procesServer?: boolean;
    keyboardEnabled?: boolean;
    cacheEnabled?: boolean;
    template?: string | ((item: any) => string);
    sortBy?: string;
    zIndex?: number;
    sortOrder?: 'asc' | 'desc';
    itemsPerPage?: number;
    debounceTime?: number;
    cacheMaxSize?: number;
    cacheTtlSeconds?: number;
    dom?: string;
    fetch?: FetchConfig;
    translation?: TranslationCache;
    developmentMode?: boolean;
    highlightEnabled?: boolean;
    highlightClass?: string;
    historyEnabled?: boolean;
    historyMaxItems?: number;
}

export interface FetchConfig {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: Record<string, any>;
    timeout?: number;
    success?: (resp: any, instance: any) => void;
    error?: (err: any) => void;
}

export interface TranslationCache {
    searchPlaceholder?: string;
    loading?: string;
    noResults?: string;
    [key: string]: string | undefined;
}

export interface BodyConfig {
    content: HTMLElement;
    contentSearch?: HTMLElement;
    inputSearch?: HTMLElement;
    renderItems?: HTMLElement;
    paginationItems?: HTMLElement;
    contentPaginationItems?: HTMLElement;
}

export interface RenderSearchOptions {
    onInput: (searchTerm: string, isEvent: boolean) => void;
    debounceTime: number;
    placeholder?: string;
    ariaLabel?: string;
}

export interface RenderByDomOptions {
    zIndex?: number;
    search?: RenderSearchOptions;
}

export interface SearchEventInit {
    searchTerm: string;
    itemsPerPage: number;
    procesServer: boolean;
}

export interface PageChangeEventData {
    page: number;
    totalPages: number;
    itemsOnPage: number;
    totalLoaded: number;
}

export interface SortChangeEventData {
    field: string;
    order: 'asc' | 'desc';
}

export interface ItemSelectedEventData {
    item: HTMLElement;
    index: number;
    close: () => void;
}

export interface ItemHighlightedEventData {
    item: HTMLElement;
    index: number;
}

export interface DestroyEventData {
    timestamp: string;
}

export interface RenderItemsEventData {
    items: any[];
    content: HTMLElement;
}

export interface AppendItemsEventData {
    items: any[];
    content: HTMLElement;
}

export interface SearchEventData {
    searchTerm: string;
    results: Record<string, any>;
    totalResults: number;
    timestamp: string;
}

export interface CreateElementConfig {
    element: string | HTMLElement;
    dataset?: Record<string, string>;
    children?: CreateElementConfig[];
    child?: HTMLElement;
    event?: Record<string, (e: any) => void>;
    attributes?: Record<string, string>;
    style?: Record<string, string>;
    [key: string]: any;
}

export enum DomComponent {
    SEARCH = 's',
    CONTENT = 'c',
    ITEMS = 'i',
    PAGINATION = 'p'
}