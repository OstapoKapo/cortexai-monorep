export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export interface IHttpConfig {
    url?: string;
    headers?: Record<string, string>;
    params?: unknown;
    data?: unknown;
}

export type IMap = Record<string, unknown>;

export interface IResponse<T = object | Array<object>> {
    status: HttpStatusCode;
    data: T;
}

export interface ApiErrorResponse {
    message?: string;
}

export interface IHttpClient {
    get: <T>(url: string, config?: IHttpConfig) => Promise<T>;
    post: <T, TD>(url: string, data: TD, config?: IHttpConfig) => Promise<T>;
    put: <T, TD>(url: string, data: TD, config?: IHttpConfig) => Promise<T>;
    patch: <T, TD>(url: string, data: TD, config?: IHttpConfig) => Promise<T>;
    delete: <T>(url: string, config?: IHttpConfig) => Promise<T>;
}