export enum ErrorCode {
    // Errores de validación de parámetros
    ELEMENT_REQUIRED = 'SEARCH_001',
    ELEMENT_TYPE_INVALID = 'SEARCH_002',
    FETCH_URL_REQUIRED = 'SEARCH_003',
    ITEMSPERPAGE_TYPE_INVALID = 'SEARCH_004',
    ITEMSPERPAGE_VALUE_INVALID = 'SEARCH_005',
    
    // Errores de DOM
    ELEMENT_NOT_FOUND = 'SEARCH_010',
    CONTAINER_NOT_FOUND = 'SEARCH_011',
    
    // Errores de red
    NETWORK_ERROR = 'SEARCH_020',
    FETCH_FAILED = 'SEARCH_021',
    
    // Errores de datos
    INVALID_DATA_FORMAT = 'SEARCH_030',
    EMPTY_RESPONSE = 'SEARCH_031',
    
    // Errores internos
    INITIALIZATION_FAILED = 'SEARCH_040',
    RENDER_ERROR = 'SEARCH_041',
}

export interface ErrorDetails {
    code: ErrorCode;
    message: string;
    solution: string;
    documentation?: string;
}
