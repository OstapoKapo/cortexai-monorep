// --- Auth Request Types ---
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// --- Auth Response Types ---
export interface AuthResponse {
  message: string;
}

export interface BasicResponse {
  message: string;
}
