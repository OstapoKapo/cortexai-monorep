import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/modules/auth/auth.service';
import { UsersService } from '../../src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AppErrors } from '@cortex/shared';

// Мокаємо (імітуємо) зовнішні бібліотеки
jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Мок для User Service
  const mockUsersService = {
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    changeUserData: jest.fn(),
  };

  // Мок для JWT Service
  const mockJwtService = {
    signAsync: jest.fn(),
  };

  // Мок для Config Service
  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_ACCESS_SECRET') return 'access-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const dto = { email: 'test@test.com', password: '123', name: 'Test' };
      const hashedPassword = 'hashed_password';
      const userId = 'user-id-123';

      // Налаштовуємо поведінку моків
      (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUsersService.createUser.mockResolvedValue({
        id: userId,
        email: dto.email,
      });
      mockJwtService.signAsync.mockResolvedValue('token_string');
      mockUsersService.changeUserData.mockResolvedValue(true);

      const result = await service.register(dto);

      expect(argon2.hash).toHaveBeenCalledWith(dto.password);
      expect(usersService.createUser).toHaveBeenCalledWith({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      });
      expect(usersService.changeUserData).toHaveBeenCalled(); // перевіряємо збереження refresh token
      expect(result).toEqual({
        accessToken: 'token_string',
        refreshToken: 'token_string',
      });
    });
  });

  describe('login', () => {
    it('should return tokens if validation is successful', async () => {
      const dto = { email: 'test@test.com', password: '123' };
      const user = { id: '1', email: 'test@test.com', password: 'hashed_pass' };

      mockUsersService.getUserByEmail.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true); // Пароль підійшов
      mockJwtService.signAsync.mockResolvedValue('token_string');

      const result = await service.login(dto);

      expect(result).toEqual({
        accessToken: 'token_string',
        refreshToken: 'token_string',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const dto = { email: 'wrong@test.com', password: '123' };
      mockUsersService.getUserByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const dto = { email: 'test@test.com', password: 'wrong' };
      const user = { id: '1', email: 'test@test.com', password: 'hashed_pass' };

      mockUsersService.getUserByEmail.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(false); // Пароль не підійшов

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token in database', async () => {
      const userId = 'user-1';
      await service.logout(userId);

      expect(usersService.changeUserData).toHaveBeenCalledWith(userId, {
        refreshToken: null,
      });
    });
  });
});
