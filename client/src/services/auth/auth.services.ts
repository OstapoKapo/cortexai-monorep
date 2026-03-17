import { httpFactory } from "../http/http-factory";
import {LoginDtoType, RegisterDtoType} from "@cortex/shared"
import { API_ROUTES } from "@cortex/shared";

export interface IAuthResponse {
    message: string;
}
class AuthService {
    private authHttp = httpFactory.createAuthHttpService();
    private directHttp = httpFactory.createDirectHttpService();
    
    async login(data: LoginDtoType) : Promise<IAuthResponse> {
        return this.directHttp.post<IAuthResponse, LoginDtoType>(`${API_ROUTES.AUTH.LOGIN}`, data);
    }

    async logout(): Promise<IAuthResponse> {
        return this.authHttp.post<IAuthResponse, null>(`${API_ROUTES.AUTH.LOGOUT}`, null);
    }

    async register(data: RegisterDtoType) : Promise<IAuthResponse> {
        return this.directHttp.post<IAuthResponse, RegisterDtoType>(`${API_ROUTES.AUTH.REGISTER}`, data);
    }

    async getProfile(): Promise<IAuthResponse> {
        return this.authHttp.get<IAuthResponse>(`${API_ROUTES.USERS.ME}`);
    }
}

export const authService = new AuthService();