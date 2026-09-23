export declare enum ErrorCode {
    ELEMENT_REQUIRED = "SEARCH_001",
    ELEMENT_TYPE_INVALID = "SEARCH_002",
    FETCH_URL_REQUIRED = "SEARCH_003",
    ITEMSPERPAGE_TYPE_INVALID = "SEARCH_004",
    ITEMSPERPAGE_VALUE_INVALID = "SEARCH_005",
    INVALID_TYPE_FORMAT = "SEARCH_006",
    ELEMENT_NOT_FOUND = "SEARCH_010",
    CONTAINER_NOT_FOUND = "SEARCH_011",
    NETWORK_ERROR = "SEARCH_020",
    FETCH_FAILED = "SEARCH_021",
    INVALID_DATA_FORMAT = "SEARCH_030",
    EMPTY_RESPONSE = "SEARCH_031",
    INITIALIZATION_FAILED = "SEARCH_040",
    RENDER_ERROR = "SEARCH_041"
}
export interface ErrorDetails {
    code: ErrorCode;
    message: string;
    solution: string;
    documentation?: string;
}
//# sourceMappingURL=error-codes.d.ts.map