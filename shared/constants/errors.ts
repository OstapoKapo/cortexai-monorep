
export const AppErrors = {
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User with this email already exists',
    USER_NOT_FOUND: 'User not found',
    WRONG_PASSWORD: 'Password is incorrect',
    UNAUTHORIZED: 'Unauthorized access',
    TOKEN_EXPIRED: 'Token has expired',
  },
  VALIDATION: {
    INVALID_EMAIL: 'Email is invalid',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
    REQUIRED_FIELD: 'This field is required',
  },

  SYSTEM: {
    INTERNAL_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database connection failed',
  },
} as const;

export type AppErrorType = typeof AppErrors;