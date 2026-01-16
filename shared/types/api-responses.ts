export interface BaseResponse<T> {
  data: T;                
  statusCode: number;    
  timestamp: string;     
  message?: string;    
}

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;        
  timestamp: string;      
  path: string;           
  correlationID?: string; 
}

export interface AuthResponse {
  token: string;        
  userId: string;             
}

export interface UserProfileResponse {
    id: string;               
    name: string;
    email: string;
    createdAt: string;        
    updatedAt: string;        
}

export type ILoginResponse = BaseResponse<AuthResponse>;

export type IRegisterResponse = BaseResponse<AuthResponse>;

export type IUserProfileResponse = BaseResponse<UserProfileResponse>;

export type ILogoutResponse = BaseResponse<null>;
