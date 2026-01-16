import { httpFactory } from "../http/http-factory";
import {LoginDtoType, RegisterDtoType, ILoginResponse, IRegisterResponse, IUserProfileResponse, ILogoutResponse} from "@cortex/shared"
import { API_ROUTES } from "@cortex/shared";


class AuthService {
    private authHttp = httpFactory.createAuthHttpService();
    private directHttp = httpFactory.createDirectHttpService();
    
    async login(data: LoginDtoType) : Promise<ILoginResponse> {
        return this.directHttp.post<ILoginResponse, LoginDtoType>(`${API_ROUTES.AUTH.LOGIN}`, data);
    }

    async logout(): Promise<ILogoutResponse> {
        return this.authHttp.post<ILogoutResponse, null>(`${API_ROUTES.AUTH.LOGOUT}`, null);
    }

    async register(data: RegisterDtoType) : Promise<IRegisterResponse> {
        return this.directHttp.post<IRegisterResponse, RegisterDtoType>(`${API_ROUTES.AUTH.REGISTER}`, data);
    }

    async getProfile(): Promise<IUserProfileResponse> {
        return this.authHttp.get<IUserProfileResponse>(`${API_ROUTES.USERS.ME}`);
    }
}

export const authService = new AuthService();