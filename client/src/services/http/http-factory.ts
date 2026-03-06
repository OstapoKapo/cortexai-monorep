import { mainAxios } from './axios-setup';
import { IHttpClient, IHttpConfig, IResponse, IMap } from '../types';

export class HttpService implements IHttpClient {
    constructor(
        private readonly fetchingService = mainAxios,
        private readonly baseUrl? : string
    ) {}

    public createQueryLink(base: string, args: IMap): string {
        const parameters = new URLSearchParams();
        for (const [key, value] of Object.entries(args)) {
            if (value !== undefined && value !== null) {
                parameters.append(key, String(value));
            }
        }
        const queryString = parameters.toString();
        return queryString ? `${base}?${queryString}` : base;
    }

    private getConfig(config: IHttpConfig | undefined) {
        return {
            ...config,
            baseURL: this.baseUrl,
            headers: {
                ...config?.headers,
                ...this.getJsonHeaders()
            }
        }
    }

    public async get<T>(url: string, config?: IHttpConfig): Promise<T> {
        const response = await this.fetchingService.get<IResponse<T>>(url, this.getConfig(config));
        return response.data as unknown as T;
    }

    public async post<T, TD>(url: string, data: TD, config?: IHttpConfig): Promise<T> {
        const response = await this.fetchingService.post<IResponse<T>>(url, data, this.getConfig(config));
        return response.data as unknown as T;
    }

    public async put<T, TD>(url: string, data: TD, config?: IHttpConfig): Promise<T> {
        const response = await this.fetchingService.put<IResponse<T>>(url, data, this.getConfig(config));
        return response.data as unknown as T;
    }

    public async patch<T, TD>(url: string, data: TD, config?: IHttpConfig): Promise<T> {
        const response = await this.fetchingService.patch<IResponse<T>>(url, data, this.getConfig(config));
        return response.data as unknown as T;
    }

    public async delete<T>(url: string, config?: IHttpConfig): Promise<T> {
        const response = await this.fetchingService.delete<IResponse<T>>(url, this.getConfig(config));
        return response.data as unknown as T;
    }

    private getJsonHeaders(): Record<string, string> {
        return { 'Content-Type': 'application/json' };
    }
}

export class EnhancedWithAuthHttpService {
    constructor(private readonly httpService: HttpService) {}

    public async get<T>(url: string, config: IHttpConfig = {}): Promise<T> {
        return this.httpService.get<T>(url, await this.attachAuthHeader(config));
    }

    public async post<T, TD>(url: string, data: TD, config: IHttpConfig = {}): Promise<T> {
        return this.httpService.post<T, TD>(url, data, await this.attachAuthHeader(config));
    }

    public async put<T, TD>(url: string, data: TD, config: IHttpConfig = {}): Promise<T> {
        return this.httpService.put<T, TD>(url, data, await this.attachAuthHeader(config));
    }

    public async patch<T, TD>(url: string, data: TD, config: IHttpConfig = {}): Promise<T> {
        return this.httpService.patch<T, TD>(url, data, await this.attachAuthHeader(config));
    }

    public async delete<T>(url: string, config: IHttpConfig = {}): Promise<T> {
        return this.httpService.delete<T>(url, await this.attachAuthHeader(config));
    }

    private async attachAuthHeader(config: IHttpConfig): Promise<IHttpConfig> {
        
        let token = null;
        if(typeof window !== 'undefined'){
            return config;
        }
        try{
            const {cookies} = await import('next/headers');
            const cookiesStore = await cookies();
            const authToken = cookiesStore.get('accessToken');
            token = authToken ? authToken.value : null;
            return {
                ...config,
                headers: {
                    ...config.headers,
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            };
        }catch(error){
            console.log("SSR Error:", error);
        }

        return config;
    }
}

export class HttpFactoryService {

    private getBaseUrl(): string | undefined {
        if (typeof window === 'undefined') {
            // SSR: direct to gateway via internal network
            return process.env.NEST_INTERNAL_URL || undefined;
        }
        // CSR: use proxy (default axios baseUrl)
        return undefined;
    }

    public getDirectUrl(): string {
        // For auth (login/register) - always direct to gateway, no proxy
        // Browser needs public URL, SSR can use internal
        if (typeof window === 'undefined') {
            return process.env.NEST_INTERNAL_URL || 'http://localhost:3001';
        }
        return process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3001';
    }

    public createHttpService(): HttpService {
        return new HttpService(mainAxios, this.getBaseUrl());
    }

    public createAuthHttpService(): EnhancedWithAuthHttpService {
        return new EnhancedWithAuthHttpService(new HttpService(mainAxios, this.getBaseUrl()));
    }

    public createDirectHttpService(): HttpService {
        return new HttpService(mainAxios, this.getDirectUrl());
    }
}

export const httpFactory = new HttpFactoryService();