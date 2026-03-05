import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { RegisterDto, LoginDto } from '../../src/common/dto/auth.dto';
describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Мок для AuthService
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  };

  // Мок для об'єкта Response (Express)
  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user and set cookies', async () => {
      const dto: RegisterDto = { email: 'test@test.com', password: '123', name: 'Test',  };
      const tokens = { accessToken: 'access.token', refreshToken: 'refresh.token' };
      
      (mockAuthService.register as jest.Mock).mockResolvedValue(tokens);

      const result = await controller.register(dto, mockResponse);

      expect(authService.register).toHaveBeenCalledWith(dto);
      // Перевіряємо, що куки встановились 2 рази (access + refresh)
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenCalledWith('accessToken', tokens.accessToken, expect.any(Object));
      expect(mockResponse.cookie).toHaveBeenCalledWith('refreshToken', tokens.refreshToken, expect.any(Object));
      expect(result).toEqual({ message: 'User registered successfully' });
    });
  });

  describe('login', () => {
    it('should login user and set cookies', async () => {
      const dto: LoginDto = { email: 'test@test.com', password: '123' };
      const tokens = { accessToken: 'access.token', refreshToken: 'refresh.token' };

      (mockAuthService.login as jest.Mock).mockResolvedValue(tokens);

      const result = await controller.login(dto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ message: 'User logged in successfully' });
    });
  });

  describe('logout', () => {
    it('should logout user and clear cookies', async () => {
      const req = { user: { userId: '123' } } as any;

      const result = await controller.logout(req, mockResponse);

      expect(authService.logout).toHaveBeenCalledWith('123');
      // Перевіряємо очистку кук
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('accessToken');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
      expect(result).toEqual({ message: 'User logged out successfully' });
    });
  });
});