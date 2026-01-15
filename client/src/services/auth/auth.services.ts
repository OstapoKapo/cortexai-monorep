import { httpFactory } from "../http/http-factory";
import { IResponse } from "../types";
import {LoginDtoType, RegisterDtoType} from "@cortex/shared"


export interface IAuthResponse {
    message: string;
    data: {
        accessToken: string;
    }
}

export interface ILogoutResponse {
    message: string;
}

export interface IUserProfileResponse {
    message: string;
    data: {
        id: string;
        email: string;
        name: string;
    }
}

const NEST_INTERNAL_URL = process.env.NEXT_PUBLIC_NEST_INTERNAL_URL || 'http://localhost:4000/api/proxy';

class AuthService {
    private http = httpFactory.createHttpService();
    private authHttp = httpFactory.createAuthHttpService();
    
    async login(data: LoginDtoType) : Promise<IAuthResponse> {
        return this.http.post<IAuthResponse, LoginDtoType>(`${NEST_INTERNAL_URL}/auth/login`, data);
    }

    async logout(): Promise<ILogoutResponse> {
        return this.http.post<ILogoutResponse, null>(`${NEST_INTERNAL_URL}/auth/logout`, null);
    }

    async register(data: RegisterDtoType) : Promise<IAuthResponse> {
        return this.http.post<IAuthResponse, RegisterDtoType>(`${NEST_INTERNAL_URL}/auth/register`, data);
    }

    async getProfile(): Promise<IUserProfileResponse> {
        return this.authHttp.get<IUserProfileResponse>('/auth/profile');
    }
}

export const authService = new AuthService();